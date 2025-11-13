import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import type { Cheerio, CheerioAPI } from 'cheerio';
import { load as loadHtml } from 'cheerio';

type SelectorConfig = {
  container: string;
  item: string;
  titleLink: string;
  preview: string;
};

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const POPULAR_FILE_PATH = path.join(
  PROJECT_ROOT,
  'app/shared/utils/_popular.ts'
);
const COMMIT_MESSAGE = 'fix(naver): update popular items selector';

const readStdIn = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', (error) => reject(error));
  });

const buildClassFrequency = ($: CheerioAPI): Map<string, number> => {
  const frequencies = new Map<string, number>();

  $('*').each((_i, el) => {
    const classAttr = $(el).attr('class');
    if (!classAttr) return;

    classAttr
      .split(/\s+/)
      .filter(Boolean)
      .forEach((name) => {
        const next = (frequencies.get(name) ?? 0) + 1;
        frequencies.set(name, next);
      });
  });

  return frequencies;
};

const selectorFromNode = (
  $node: Cheerio<any>,
  frequencies: Map<string, number>
): string => {
  if (!$node.length) return '';

  const id = $node.attr('id');
  if (id) return `#${id}`;

  const classAttr = $node.attr('class');
  if (classAttr) {
    const classes = classAttr
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => {
        const frequency = frequencies.get(name) ?? Number.MAX_SAFE_INTEGER;
        const penalty =
          name.startsWith('sds-') || name.startsWith('type-') ? 1_000_000 : 0;
        return {
          name,
          score: frequency + penalty,
        };
      })
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return b.name.length - a.name.length;
      });

    if (classes.length) return `.${classes[0].name}`;
  }

  const dataTemplate = $node.attr('data-template-id');
  if (dataTemplate) return `[data-template-id="${dataTemplate}"]`;

  const heatmapTarget = $node.attr('data-heatmap-target');
  if (heatmapTarget) return `[data-heatmap-target="${heatmapTarget}"]`;

  const tagName = $node.get(0)?.tagName;
  return tagName ? tagName : '';
};

const ensureSelector = (label: string, selector: string): string => {
  if (!selector) {
    throw new Error(`Unable to derive selector for ${label}`);
  }
  return selector;
};

const escapeSelectorValue = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const applySelectorConfig = (
  source: string,
  config: SelectorConfig
): string => {
  const blockPattern =
    /(export const NAVER_POPULAR_SELECTOR_CONFIG: PopularSelectorConfig = \{\n)([\s\S]*?)(\} as const;)/;

  if (!blockPattern.test(source)) {
    throw new Error('Selector config block was not found in _popular.ts');
  }

  const formattedEntries = Object.entries(config)
    .map(([key, value]) => `  ${key}: '${escapeSelectorValue(value)}',`)
    .join('\n');

  return source.replace(
    blockPattern,
    `$1${formattedEntries}\n$3`
  );
};

const stageAndCommit = () => {
  const relativePath = path.relative(PROJECT_ROOT, POPULAR_FILE_PATH);
  const diffResult = spawnSync(
    'git',
    ['diff', '--quiet', '--', relativePath],
    {
      cwd: PROJECT_ROOT,
    }
  );

  if (diffResult.status === 0) {
    console.log('Selectors already up to date. No commit created.');
    return;
  }

  if (diffResult.status !== 1) {
    console.warn(
      '[naver-popular-update] git diff failed. Commit was skipped.'
    );
    return;
  }

  const addResult = spawnSync('git', ['add', relativePath], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  if (addResult.status !== 0) {
    console.warn(
      '[naver-popular-update] Failed to stage selector updates automatically. Please stage them manually.'
    );
    return;
  }

  const commitResult = spawnSync('git', ['commit', '-m', COMMIT_MESSAGE], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  if (commitResult.status !== 0) {
    console.warn(
      '[naver-popular-update] Failed to create commit automatically. Please commit the changes manually.'
    );
    return;
  }

  console.log(`Created commit: ${COMMIT_MESSAGE}`);
};

const logConfig = (config: SelectorConfig) => {
  console.log('Detected selectors:');
  Object.entries(config).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
};

const main = async () => {
  const htmlInput = (await readStdIn()).trim();
  if (!htmlInput) {
    console.error('No HTML input provided. Paste the HTML and press Ctrl+D.');
    process.exit(1);
  }

  const $ = loadHtml(htmlInput);
  const classFrequencies = buildClassFrequency($);

  // Look for the container with the known class
  const $container = $('.fds-ugc-single-intention-item-list').first();
  if (!$container.length) {
    throw new Error('Could not find .fds-ugc-single-intention-item-list container in the HTML');
  }
  const containerSelector = ensureSelector(
    'container',
    selectorFromNode($container, classFrequencies)
  );

  // Find an item element - first look for items with data-template-id="ugcItem"
  let $item = $container.find('[data-template-id="ugcItem"]').first();
  if (!$item.length) {
    // If not found, look for the common item wrapper class from the current HTML
    $item = $container.find('.xYjt3uiECoJ0o6Pj0xOU').first();
  }
  if (!$item.length) {
    // Fallback to any direct child that looks like an item
    $item = $container.children().first();
  }
  if (!$item.length) {
    throw new Error('Could not find any popular item elements in the container');
  }
  const itemSelector = ensureSelector(
    'popular item',
    selectorFromNode($item, classFrequencies)
  );

  // Find the title link element - look for the known class first
  let $titleLink = $item.find('.CC5p8OBUeZzCymeWTg7v').first();
  if (!$titleLink.length) {
    // Look for links with headline text inside
    $titleLink = $item.find('a span.sds-comps-text-type-headline1').closest('a').first();
  }
  if (!$titleLink.length) {
    // Fallback to any headline text inside an anchor
    $titleLink = $item.find('a').find('span.sds-comps-text-type-headline1').closest('a').first();
  }
  if (!$titleLink.length) {
    throw new Error('Could not find title link elements in the item');
  }
  const titleSelector = ensureSelector(
    'title link',
    selectorFromNode($titleLink, classFrequencies)
  );

  // Find the preview element - look for the known class first
  let $preview = $item.find('.vhAXtgPpcvABjkgTaDZ0').first();
  if (!$preview.length) {
    // Look for preview elements with body text inside
    $preview = $item.find('a span.sds-comps-text-type-body1').closest('a').first();
  }
  if (!$preview.length) {
    // Fallback to any body text inside an anchor
    $preview = $item.find('span.sds-comps-text-type-body1').first().closest('a');
  }
  if (!$preview.length) {
    throw new Error('Could not find preview elements in the item');
  }
  const previewBase = ensureSelector(
    'preview base',
    selectorFromNode($preview, classFrequencies)
  );
  // For the preview selector, we want the base element that contains the text body
  const previewSelector = `${previewBase} .sds-comps-text-type-body1`;

  const newConfig: SelectorConfig = {
    container: containerSelector,
    item: itemSelector,
    titleLink: titleSelector,
    preview: previewSelector,
  };

  const originalSource = readFileSync(POPULAR_FILE_PATH, 'utf8');
  const nextSource = applySelectorConfig(originalSource, newConfig);

  if (nextSource === originalSource) {
    console.log('Selector config unchanged. Nothing to do.');
    return;
  }

  writeFileSync(POPULAR_FILE_PATH, nextSource, 'utf8');
  logConfig(newConfig);
  stageAndCommit();
};

main().catch((error) => {
  console.error(`[naver-popular-update] ${error.message}`);
  process.exit(1);
});

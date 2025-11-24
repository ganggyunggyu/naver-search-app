import { loadHtml } from '../../html';
import { fetchHtml } from '../../_http';
import { NAVER_DESKTOP_HEADERS } from '@/constants';
import type { PopularItem } from '@/entities';
import { DEFAULT_SELECTORS } from '../selectors';

const SELECTORS = DEFAULT_SELECTORS;

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = loadHtml(html);
  const items: PopularItem[] = [];

  const $collectionRoots = $(SELECTORS.collectionRoot);

  $collectionRoots.each((_, root) => {
    const $root = $(root);

    const headline = $root.find(SELECTORS.headline).first().text().trim();

    const topicName = headline || '인기글';

    const $blocks = $root.find(SELECTORS.blockMod);

    $blocks.each((_, block) => {
      const $block = $(block);

      const $blogInfo = $block.find(SELECTORS.blogInfo).first();
      const blogName = $blogInfo.text().trim();
      const blogHref =
        ($blogInfo.is('a') ? $blogInfo : $blogInfo.closest('a'))
          .attr('href')
          ?.trim() || '';

      const $postTitle = $block.find(SELECTORS.postTitle).first();
      const $titleWrap = $block.find(SELECTORS.postTitleWrap).first();
      const title = $postTitle.text().trim();

      let postHref = '';
      if ($titleWrap.length > 0 && $titleWrap.is('a')) {
        postHref = $titleWrap.attr('href')?.trim() || '';
      } else if ($postTitle.is('a')) {
        postHref = $postTitle.attr('href')?.trim() || '';
      }

      if (
        postHref &&
        postHref.includes('naver.com') &&
        !postHref.includes('cafe.naver.com') &&
        !postHref.includes('ader.naver.com') &&
        title
      ) {
        items.push({
          title,
          link: postHref,
          snippet: '',
          image: '',
          badge: '',
          group: topicName,
          blogLink: blogHref,
          blogName: blogName || '',
        });
      }
    });
  });

  const $singleIntentionSections = $(SELECTORS.singleIntentionList);
  if ($singleIntentionSections.length > 0) {
    $singleIntentionSections.each((_, section) => {
      const $section = $(section);

      const headline = $section
        .closest('.sds-comps-vertical-layout')
        .find('.sds-comps-text-type-headline1')
        .first()
        .text()
        .trim();

      const topicName = headline || '인기글';

      const $items = $section.find(SELECTORS.intentionItem);

      $items.each((_, item) => {
        const $item = $(item);

        const $titleLink = $item.find(SELECTORS.intentionTitle).first();
        const title = $item.find(SELECTORS.intentionHeadline).text().trim();
        const postHref = $titleLink.attr('href')?.trim() || '';

        const $profile = $item.find(SELECTORS.intentionProfile).first();
        const blogName = $profile.text().trim();
        const blogHref = $profile.attr('href')?.trim() || '';

        const snippet = $item
          .find(SELECTORS.intentionPreview)
          .first()
          .text()
          .trim();

        const image =
          $item.find(SELECTORS.intentionImage).first().attr('src')?.trim() ||
          '';

        if (
          postHref &&
          title &&
          !postHref.includes('cafe.naver.com') &&
          !postHref.includes('ader.naver.com')
        ) {
          items.push({
            title,
            link: postHref,
            snippet,
            image,
            badge: '',
            group: topicName,
            blogLink: blogHref,
            blogName,
          });
        }
      });
    });
  }

  const unique = new Map<string, PopularItem>();
  for (const item of items) {
    if (!unique.has(item.link)) {
      unique.set(item.link, item);
    }
  }

  return Array.from(unique.values());
};

export const fetchAndParsePopular = async (
  url: string
): Promise<PopularItem[]> => {
  const html = await fetchHtml(url, NAVER_DESKTOP_HEADERS);
  return extractPopularItems(html);
};

export const searchPopularItems = async (
  keyword: string
): Promise<PopularItem[]> => {
  const { buildNaverSearchUrl } = await import('../index');
  const url = buildNaverSearchUrl(keyword);
  return fetchAndParsePopular(url);
};

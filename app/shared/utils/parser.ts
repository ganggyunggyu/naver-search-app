import { loadHtml } from './html';
import { fetchHtml } from './_http';
import { NAVER_DESKTOP_HEADERS } from '@/constants';
import type { PopularItem } from '@/entities';

// ─────────────────────────────────────────────────────────────
// Link Utils
// ─────────────────────────────────────────────────────────────
export const normalizeLink = (href?: string, cru?: string): string => {
  if (cru && cru.startsWith('http')) return cru;
  if (!href) return '';
  try {
    const uParam = new URLSearchParams(href.split('?')[1] || '').get('u');
    if (uParam) return decodeURIComponent(uParam);
  } catch {}
  if (href.startsWith('/')) return `https://search.naver.com${href}`;
  return href;
};

export const buildNaverSearchUrl = (query: string): string =>
  `https://m.search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(
    query
  )}`;

// ─────────────────────────────────────────────────────────────
// Selector Config
// ─────────────────────────────────────────────────────────────
export interface PopularSelectorConfig {
  // Collection (블록형)
  collectionRoot: string;
  headline: string;
  blockModList: string;
  blockMod: string;
  blogInfo: string;
  postTitle: string;
  postTitleWrap: string;

  // Single Intention (리스트형)
  singleIntentionList: string;
  intentionItem: string;
  intentionTitle: string;
  intentionHeadline: string;
  intentionPreview: string;
  intentionProfile: string;
  intentionImage: string;
}

export const DEFAULT_SELECTORS: PopularSelectorConfig = {
  collectionRoot: '.fds-collection-root',
  headline: '.fds-comps-header-headline',
  blockModList: '.fds-ugc-block-mod-list',
  blockMod: '.fds-ugc-block-mod',
  blogInfo: '.fds-info-inner-text',
  postTitle: '.fds-comps-right-image-text-title',
  postTitleWrap: '.fds-comps-right-image-text-title-wrap',

  singleIntentionList: '.fds-ugc-single-intention-item-list',
  intentionItem: '.oIxNPKojSTvxvkjdwXVC',
  intentionTitle: 'a.yUgjyAT8hsQKswX75JB4',
  intentionHeadline: '.sds-comps-text.sds-comps-text-type-headline1',
  intentionPreview: '.q_Caq4prL1xTKuKsMjDN .sds-comps-text-type-body1',
  intentionProfile: '.sds-comps-profile-info-title-text a',
  intentionImage: '.sds-comps-image img',
} as const;

export const updateSelectors = (
  partial: Partial<PopularSelectorConfig>
): PopularSelectorConfig => ({
  ...DEFAULT_SELECTORS,
  ...partial,
});

// 내부에서 사용할 셀렉터 (DEFAULT_SELECTORS 참조)
const SELECTORS = DEFAULT_SELECTORS;

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = loadHtml(html);
  const items: PopularItem[] = [];

  const $collectionRoots = $(SELECTORS.collectionRoot);

  $collectionRoots.each((rootIdx, root) => {
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
      // title-wrap을 우선적으로 확인 (패턴 2)
      if ($titleWrap.length > 0 && $titleWrap.is('a')) {
        postHref = $titleWrap.attr('href')?.trim() || '';
      }
      // title이 직접 링크인 경우 (패턴 1)
      else if ($postTitle.is('a')) {
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
    $singleIntentionSections.each((sectionIdx, section) => {
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

/**
 * URL로 HTML fetch 후 인기글 파싱
 */
export const fetchAndParsePopular = async (
  url: string
): Promise<PopularItem[]> => {
  const html = await fetchHtml(url, NAVER_DESKTOP_HEADERS);
  return extractPopularItems(html);
};

/**
 * 키워드로 네이버 검색 후 인기글 파싱
 */
export const searchPopularItems = async (
  keyword: string
): Promise<PopularItem[]> => {
  const url = buildNaverSearchUrl(keyword);
  return fetchAndParsePopular(url);
};

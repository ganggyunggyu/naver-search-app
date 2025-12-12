import { loadHtml } from '../../html';
import { fetchHtml } from '../../_http';
import { NAVER_DESKTOP_HEADERS } from '@/constants';
import type { PopularItem } from '@/entities';
import { DEFAULT_SELECTORS } from '../selectors';

const SELECTORS = DEFAULT_SELECTORS;

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = loadHtml(html);
  const items: PopularItem[] = [];

  // Single Intention (인기글) 섹션
  const $singleIntentionSections = $(SELECTORS.singleIntentionList);
  if ($singleIntentionSections.length > 0) {
    $singleIntentionSections.each((_, section) => {
      const $section = $(section);

      // 섹션 헤더 구조:
      // .sds-comps-vertical-layout (공통 부모)
      //   └─ .fds-header .sds-comps-header-left h2.sds-comps-text-ellipsis-1 (헤더)
      //   └─ .fds-ugc-single-intention-item-list (리스트)
      const headline = $section
        .parent()
        .find('.fds-header .sds-comps-header-left .sds-comps-text-ellipsis-1')
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

  // Snippet Paragraph (스블) 섹션
  const $snippetParagraphSections = $(SELECTORS.snippetParagraphList);
  if ($snippetParagraphSections.length > 0) {
    $snippetParagraphSections.each((_, section) => {
      const $section = $(section);

      // 섹션 헤더 구조:
      // .sds-comps-vertical-layout (공통 부모)
      //   └─ .fds-header .sds-comps-header-left h2.sds-comps-text-ellipsis-1 (헤더)
      //   └─ .fds-ugc-snippet-paragraph-item-list (리스트)
      const headline = $section
        .parent()
        .find('.fds-header .sds-comps-header-left .sds-comps-text-ellipsis-1')
        .first()
        .text()
        .trim();

      const topicName = headline || '스니펫';

      const $items = $section.find(SELECTORS.snippetItem);

      $items.each((_, item) => {
        const $item = $(item);

        const $titleLink = $item.find(SELECTORS.snippetTitle).first();
        const title = $titleLink.find(SELECTORS.snippetHeadline).text().trim();
        const postHref = $titleLink.attr('href')?.trim() || '';

        const $profile = $item.find(SELECTORS.snippetProfile).first();
        const blogName = $profile.text().trim();
        const blogHref = $profile.attr('href')?.trim() || '';

        const snippet = $item
          .find(SELECTORS.snippetPreview)
          .first()
          .text()
          .trim();

        const image =
          $item.find(SELECTORS.snippetImage).first().attr('src')?.trim() || '';

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

  // Snippet Image (스이) 섹션
  const $snippetImageSections = $(SELECTORS.snippetImageList);
  if ($snippetImageSections.length > 0) {
    $snippetImageSections.each((_, section) => {
      const $section = $(section);

      // 섹션 헤더 구조:
      // .sds-comps-vertical-layout (공통 부모)
      //   └─ .fds-header .sds-comps-header-left h2.sds-comps-text-ellipsis-1 (헤더)
      //   └─ .fds-ugc-snippet-image-item-list (리스트)
      const headline = $section
        .parent()
        .find('.fds-header .sds-comps-header-left .sds-comps-text-ellipsis-1')
        .first()
        .text()
        .trim();

      const topicName = headline || '스니펫 이미지';

      const $items = $section.find(SELECTORS.snippetImageItem);

      $items.each((_, item) => {
        const $item = $(item);

        const $titleLink = $item.find(SELECTORS.snippetImageTitle).first();
        const title = $titleLink.find(SELECTORS.snippetImageHeadline).text().trim();
        const postHref = $titleLink.attr('href')?.trim() || '';

        const $profile = $item.find(SELECTORS.snippetImageProfile).first();
        const blogName = $profile.text().trim();
        const blogHref = $profile.attr('href')?.trim() || '';

        // 스니펫 이미지는 본문 미리보기 없음
        const snippet = '';

        // 이미지 추출
        const image =
          $item.find('.sds-comps-image img').first().attr('src')?.trim() || '';

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

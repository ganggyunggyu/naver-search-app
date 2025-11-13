import type { CheerioAPI } from 'cheerio';
import { loadHtml } from './html';
import { KEYWORD_HEADER_SELECTOR } from '@/constants';
import type { PopularItem } from '@/entities/naver/_types';

interface PopularSelectorConfig {
  container: string;
  item: string;
  titleLink: string;
  preview: string;
}

/**
 * AUTO-GENERATED: updated by /naver-popular-update command.
 */
export const NAVER_POPULAR_SELECTOR_CONFIG: PopularSelectorConfig = {
  container: '.fds-ugc-single-intention-item-list',
  item: '.different-item-class',
  titleLink: '.different-title-class',
  preview: '.different-preview-class .sds-comps-text-type-body1',
} as const;

const findGroupLabelNear = ($: CheerioAPI, $node: any): string => {
  let $current: any = $node;
  for (let level = 0; level < 6; level++) {
    const $container = $current.closest('section, div, article');
    if ($container.length) {
      const $header = $container.find(KEYWORD_HEADER_SELECTOR).first();
      if ($header.length) {
        const headerText = $header.text().trim();
        if (headerText && headerText.length > 1) return headerText;
      }
    }
    $current = $container.parent();
    if (!$current.length) break;
  }

  const $prevHeaders = $node.prevAll().find(KEYWORD_HEADER_SELECTOR);
  if ($prevHeaders.length) {
    const headerText = $prevHeaders.first().text().trim();
    if (headerText && headerText.length > 1) return headerText;
  }
  return '';
};

const readBlock = ($: CheerioAPI, root: any, items: PopularItem[]) => {
  let itemsAdded = 0;

  const $root = root.find(
    '.sds-comps-base-layout.sds-comps-inline-layout.fds-ugc-block-mod'
  ).length
    ? root.find(
        '.sds-comps-base-layout.sds-comps-inline-layout.fds-ugc-block-mod'
      )
    : root.find('.bx');

  const headline = $root
    .find('span.sds-comps-text.sds-comps-text-type-headline1')
    .text();

  $root.each((_i: number, el: any) => {
    const $el = $(el);

    const $blog = $el.find('.fds-info-inner-text, .name').first();
    const blogName = ($blog.text() || '').trim();
    const blogHref =
      ($blog.is('a') ? $blog : $blog.closest('a')).attr('href')?.trim() || '';

    const $post = $el.find('.sds-comps-base-layout').length
      ? $el.find('.sds-comps-base-layout')
      : $el.find('.detail_box');

    const $postTitle = $post.find('.fds-comps-right-image-text-title').length
      ? $post.find('.fds-comps-right-image-text-title')
      : $post.find('.title_link');

    const title = ($postTitle.text() || '').trim();
    const postHref = (
      $postTitle.attr('href') ||
      $el.find('.fds-comps-right-image-text-title-wrap').attr('href') ||
      ''
    ).trim();

    if (
      postHref.includes('naver.com') &&
      !postHref.includes('cafe.naver.com') &&
      !postHref.includes('ader.naver.com')
    ) {
      const group = findGroupLabelNear($, $el);

      const item = {
        title,
        link: postHref,
        snippet: '',
        image: '',
        badge: '',
        group,
        blogLink: blogHref,
        blogName,
      };

      items.push(item);
      itemsAdded++;
    }
  });
};

/**
 * 네이버 검색 결과에서 인기글 섹션을 파싱하는 함수
 *
 * 네이버 HTML 구조 (2025년 11월 6일 업데이트):
 * ```
 * <div class="fds-ugc-single-intention-item-list">  // 인기글 리스트 컨테이너
 *   <div class="NtKCZYlcjvHdeUoASy2I">              // 각 인기글 아이템 컨테이너
 *     <div class="aHkd4NTJtmGIDIV39f05">            // 아이템 래퍼
 *       <div class="sds-comps-profile">             // 프로필 섹션
 *         <a href="...">                            // 블로그 링크
 *           <span class="sds-comps-profile-info-title-text">블로그명</span>
 *         </a>
 *       </div>
 *       <div class="TB7kNW8DmeLDKZyEA8t1">         // 콘텐츠 섹션
 *         <a href="..." class="z1n21OFoYx6_tGcWKL_x"> // 제목 링크
 *           <span class="sds-comps-text-type-headline1 sds-comps-text-weight-sm">제목</span>
 *         </a>
 *         <div class="SmWZLIw6L2_IfCQ2ljbA">       // 미리보기 섹션
 *           <a href="..." class="d69hemU4DtemeWuXiq5g">
 *             <span class="sds-comps-text-type-body1">본문 미리보기...</span>
 *           </a>
 *         </div>
 *         <img src="...">                          // 썸네일 이미지
 *       </div>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * @param $ - Cheerio API 인스턴스
 * @param items - 파싱된 인기글 아이템을 저장할 배열
 */
const readPopularSection = ($: CheerioAPI, items: PopularItem[]) => {
  // 인기글 리스트 컨테이너 찾기 (.fds-ugc-single-intention-item-list)
  const { container, item, titleLink, preview } =
    NAVER_POPULAR_SELECTOR_CONFIG;

  const $popularSections = $(container);

  $popularSections.each((_i: number, section: any) => {
    const $section = $(section);

    // 카테고리명 찾기 (예: "건강·의학 인기글", "IT·컴퓨터 인기글")
    let categoryName = '';

    // 방법 1: 상위 컨테이너에서 헤더 찾기
    // 대부분의 경우 상위 .sds-comps-vertical-layout에 헤더가 있음
    const $headerInParent = $section
      .closest('.sds-comps-vertical-layout')
      .find('.sds-comps-text-type-headline1')
      .first();
    if ($headerInParent.length && $headerInParent.text().trim()) {
      categoryName = $headerInParent.text().trim();
    }

    // 방법 2: 형제 요소에서 헤더 찾기
    // 상위에서 못 찾으면 부모의 다른 자식 요소 탐색
    if (!categoryName) {
      const $headerInSibling = $section
        .parent()
        .find('.sds-comps-text-type-headline1')
        .first();
      if ($headerInSibling.length && $headerInSibling.text().trim()) {
        categoryName = $headerInSibling.text().trim();
      }
    }

    // 방법 3: 전체에서 "인기글" 키워드 포함하는 헤더 찾기
    // Fallback: 구조가 예상과 다를 경우 전체 span 탐색
    if (!categoryName) {
      $('span').each((_j: number, span: any) => {
        const spanText = $(span).text().trim();
        if (spanText.includes('인기글') && spanText.length > 3) {
          categoryName = spanText;
          return false; // break
        }
      });
    }

    // 기본값 설정: 카테고리명을 찾지 못한 경우

    if (!categoryName) {
      categoryName = '인기글';
    }

    const $popularItems = $section.find(item);

    $popularItems.each((_j: number, item: any) => {
      const $item = $(item);

      const $titleLinkNode = $item.find(titleLink).first();
      const titleText = $titleLinkNode.text().trim();
      const postHref = $titleLinkNode.attr('href')?.trim() || '';

      const title =
        titleText ||
        $item
          .find('.sds-comps-text-type-headline1.sds-comps-text-weight-sm')
          .first()
          .text()
          .trim();

      const snippetText = $item.find(preview).first().text().trim();
      const snippet =
        snippetText ||
        $item.find('.sds-comps-text-type-body1').first().text().trim();

      // 블로그 정보 추출
      // .sds-comps-profile-info-title-text: 블로그명과 링크를 포함하는 프로필 영역
      const $sourceLink = $item
        .find('.sds-comps-profile-info-title-text a')
        .first();
      const blogName = $sourceLink.text().trim();
      const blogHref = $sourceLink.attr('href')?.trim() || '';

      // 썸네일 이미지 추출
      const $image = $item.find('.sds-comps-image img').first();
      const image = $image.attr('src')?.trim() || '';

      // 유효한 데이터만 추가 (제목과 링크는 필수, 카페/광고 링크는 제외)
      if (
        postHref &&
        title &&
        !postHref.includes('cafe.naver.com') &&
        !postHref.includes('ader.naver.com')
      ) {
        const popularItem = {
          title,
          link: postHref,
          snippet,
          image,
          badge: '',
          group: categoryName,
          blogLink: blogHref,
          blogName,
        };

        items.push(popularItem);
      }
    });
  });
};

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = loadHtml(html);
  const items: PopularItem[] = [];

  readPopularSection($, items);

  readBlock($, $('body'), items);

  const unique = new Map<string, PopularItem>();
  for (const it of items) if (!unique.has(it.link)) unique.set(it.link, it);

  return Array.from(unique.values());
};

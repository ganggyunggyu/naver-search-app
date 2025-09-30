import type { CheerioAPI } from 'cheerio';
import { loadHtml } from './html';
import { KEYWORD_HEADER_SELECTOR } from '@/constants';
import type { PopularItem } from '@/entities/naver/_types';

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

const readPopularSection = ($: CheerioAPI, items: PopularItem[]) => {
  const $popularSections = $('.fds-ugc-single-intention-item-list');

  $popularSections.each((_i: number, section: any) => {
    const $section = $(section);

    // 헤더 찾기를 더 포괄적으로 개선
    let categoryName = '';

    // 방법 1: 상위에서 헤더 찾기
    const $headerInParent = $section.closest('.sds-comps-vertical-layout').find('.sds-comps-text-type-headline1').first();
    if ($headerInParent.length && $headerInParent.text().trim()) {
      categoryName = $headerInParent.text().trim();
    }

    // 방법 2: 형제 요소에서 헤더 찾기
    if (!categoryName) {
      const $headerInSibling = $section.parent().find('.sds-comps-text-type-headline1').first();
      if ($headerInSibling.length && $headerInSibling.text().trim()) {
        categoryName = $headerInSibling.text().trim();
      }
    }

    // 방법 3: 전체에서 "인기글" 포함하는 헤더 찾기
    if (!categoryName) {
      $('span').each((_j: number, span: any) => {
        const spanText = $(span).text().trim();
        if (spanText.includes('인기글') && spanText.length > 3) {
          categoryName = spanText;
          return false; // break
        }
      });
    }

    // 기본값 설정
    if (!categoryName) {
      categoryName = '인기글';
    }

    console.log('🔍 Found category:', categoryName); // 디버깅용

    const $popularItems = $section.find('.JTS3NufK1HH_Obhpw1_U .IMrIrgDRabSqMWVS0TSe');

    $popularItems.each((_j: number, item: any) => {
      const $item = $(item);

      const $titleLink = $item.find('.OwwmICzrKXneAIOVrlrA').first();
      const title = $item.find('.sds-comps-text-type-headline1').text().trim();
      const postHref = $titleLink.attr('href')?.trim() || '';

      const $preview = $item.find('.sds-comps-text-type-body1').first();
      const snippet = $preview.text().trim();

      const $sourceLink = $item.find('.sds-comps-profile-info-title-text a').first();
      const blogName = $sourceLink.text().trim();
      const blogHref = $sourceLink.attr('href')?.trim() || '';

      const $image = $item.find('.sds-comps-image img').first();
      const image = $image.attr('src')?.trim() || '';

      if (postHref && title) {
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

  readBlock($, $('body'), items);

  readPopularSection($, items);

  const unique = new Map<string, PopularItem>();
  for (const it of items) if (!unique.has(it.link)) unique.set(it.link, it);

  return Array.from(unique.values());
};

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

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = loadHtml(html);
  const items: PopularItem[] = [];

  readBlock($, $('body'), items);

  const unique = new Map<string, PopularItem>();
  for (const it of items) if (!unique.has(it.link)) unique.set(it.link, it);

  return Array.from(unique.values());
};

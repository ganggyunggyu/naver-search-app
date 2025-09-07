import type { CheerioAPI } from 'cheerio';
import { loadHtml } from './html';
import { normalizeLink } from './_links';
import { KEYWORD_HEADER_SELECTOR, POPULAR_ITEM_SELECTOR, POPULAR_SECTION_SELECTOR } from '@/constants';

export type PopularItem = {
  title: string;
  link: string;
  snippet?: string;
  image?: string;
  badge?: string;
  group?: string;
};

// selectors moved to constants

const findPopularSections = ($: CheerioAPI) => {
  const sections: Array<
    { keyword: string; container: ReturnType<CheerioAPI>; type?: 'nreview' | 'default' } & any
  > = [];

  $(POPULAR_SECTION_SELECTOR).each((_, sectionEl) => {
    const $section = $(sectionEl as any);
    const $header = $section.find(KEYWORD_HEADER_SELECTOR).first();
    if ($header.length > 0) {
      const headerText = $header.text().trim();
      if (headerText && headerText.length > 1) {
        const $items = $section.find(POPULAR_ITEM_SELECTOR);
        if ($items.length > 0)
          sections.push({
            keyword: headerText,
            container: $section,
            type: $section.is('.sp_nreview, .sc.sp_nreview, [class*="sp_nreview"]') ? 'nreview' : 'default',
          });
      }
    }
  });

  if (sections.length === 0) {
    $(KEYWORD_HEADER_SELECTOR).each((_, headerEl) => {
      const $header = $(headerEl as any);
      const headerText = $header.text().trim();
      if (!headerText || headerText.length < 2) return;

      let $container: any = $header.parent();
      for (let level = 0; level < 5; level++) {
        const $items = $container.find(POPULAR_ITEM_SELECTOR);
        if ($items.length > 0) {
          sections.push({
            keyword: headerText,
            container: $container,
            type: $container.is('.sp_nreview, .sc.sp_nreview, [class*="sp_nreview"]') ? 'nreview' : 'default',
          });
          break;
        }
        $container = $container.parent();
        if (!$container.length) break;
      }
    });
  }

  return sections;
};

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

const readNreview = (
  $: CheerioAPI,
  root: any,
  items: PopularItem[],
  fixedGroup?: string
) => {
  let added = 0;
  // 엄격한 구조: div.api_subject_bx > ul.lst_view > li.bx._slog_visible > div.view_wrap > div.detail_box
  const selector = 'div.api_subject_bx ul.lst_view li.bx._slog_visible';
  const $candidates = root.find(selector);
  const iterateTarget = $candidates.length ? $candidates : root.find('.bx._slog_visible');

  iterateTarget.each((_: string, el: any) => {
    const $li = $(el);
    const $detail = $li.find('div.view_wrap div.detail_box').first();
    if (!$detail.length) return; // detail_box 없는 카드는 패스

    const titleA = $li
      .find('a.total_tit, a[href*="blog.naver.com"]')
      .first();
    const title = (titleA.text() || '').trim();
    const link = normalizeLink(
      (titleA.attr('href') as any) || '',
      (titleA.attr('cru') as any) || ''
    );
    if (!title || !link || !link.includes('blog.naver.com')) return;

    // detail_box 텍스트만 추출
    const snippet = ($detail.text() || '').replace(/\s+/g, ' ').trim();
    const image =
      (($li.find('.thumb img, .thumb_box img, img').first().attr('src') as any) || '').trim();
    const badge = (($li.find('.badge, .tag').first().text() || '').trim());
    const group = fixedGroup || findGroupLabelNear($, $li);

    items.push({ title, link, snippet, image, badge, group });
    added++;
  });
  return added;
};

const readBlock = (
  $: CheerioAPI,
  root: any,
  items: PopularItem[],
  fixedGroup?: string
) => {
  // nreview 섹션 전용 파서 우선 적용
  if (root.is('.sp_nreview, .sc.sp_nreview, [class*="sp_nreview"]')) {
    const cnt = readNreview($, root, items, fixedGroup);
    if (cnt > 0) return;
  }

  let itemsAdded = 0;
  root.find(POPULAR_ITEM_SELECTOR).each((_: string, el: any) => {
    const $el = $(el);

    // 타이틀/요약 기본 + 폴백 선택자들
    const titleSel = [
      'a.fds-comps-right-image-text-title',
      'a.total_tit',
      'a.news_tit',
      'a.cafe_tit',
      'a.link_tit',
    ].join(', ');
    const snippetSel = [
      'a.fds-comps-right-image-text-content',
      '.dsc_txt',
      '.api_txt_lines',
      '.news_dsc',
      '.total_dsc',
    ].join(', ');

    let titleA = $el.find(titleSel).first();
    if (!titleA.length) {
      // 마지막 폴백: 블로그 링크를 가진 첫 앵커
      titleA = $el.find("a[href*='blog.naver.com']").first();
    }

    let snippetA = $el.find(snippetSel).first();

    // 이미지 기본 + 폴백
    let imageEl = $el
      .find('a.fds-comps-right-image-content-image-container-item img')
      .first();
    if (!imageEl.length) imageEl = $el.find('img').first();

    const badgeEl = $el
      .find('.fds-comps-right-image-content-image-badge span')
      .first();

    // 데이터 추출
    let title = (titleA.text() || '').trim();
    if (!title) {
      const altTitle = $el.find('strong, h3, h4, span').first().text().trim();
      if (altTitle) title = altTitle;
    }

    // 링크 정규화 (href/cru → 최종 URL)
    let linkHref = (titleA.attr('href') as any) || '';
    let linkCru = (titleA.attr('cru') as any) || '';
    if (!linkHref) {
      const altA = $el.find("a[href]").filter((_, a) => {
        const href = ($(a as any).attr('href') || '') as string;
        return href.includes('blog.naver.com');
      }).first();
      if (altA.length) {
        linkHref = altA.attr('href') as any;
        linkCru = (altA.attr('cru') as any) || '';
      }
    }
    const link = normalizeLink(linkHref as any, linkCru as any);

    let snippet = (snippetA.text() || '').trim();
    if (!snippet) {
      const altSnippet = $el.find('p, span').first().text().trim();
      if (altSnippet) snippet = altSnippet;
    }

    const image = (imageEl.attr('src') as any) || '';
    const badge = (badgeEl.text() || '').trim();
    const group = fixedGroup || findGroupLabelNear($, $el);

    if (title && link && link.includes('blog.naver.com')) {
      items.push({ title, link, snippet, image, badge, group });
      itemsAdded++;
    }
  });

  // 폴백: 카드 선택자가 매칭되지 않으면 섹션 내 블로그 앵커를 직접 스캔
  if (itemsAdded === 0) {
    root
      .find("a[href*='blog.naver.com']")
      .each((_: string, aEl: any) => {
        const $a = $(aEl);
        const title = ($a.text() || '').trim();
        const link = normalizeLink(($a.attr('href') as any) || '', ($a.attr('cru') as any) || '');
        if (!title || !link || !link.includes('blog.naver.com')) return;

        // 주변 텍스트를 요약으로 시도
        let snippet = '';
        const $candidate = $a.closest('div, li, article');
        if ($candidate.length) {
          const txt = $candidate.text().replace(title, '').trim();
          snippet = txt.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 3).join(' ');
        }

        const group = fixedGroup || findGroupLabelNear($, $a);
        items.push({ title, link, snippet, image: '', badge: '', group });
        itemsAdded++;
      });
  }
};

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = loadHtml(html);
  const items: PopularItem[] = [];
  const popularSections = findPopularSections($);

  if (popularSections.length > 0) {
    for (const section of popularSections)
      readBlock($, section.container, items, section.keyword);
  }

  if (items.length === 0) {
    const sectionHeaders = $(
      "[class*='fds-comps-header-headline'], h2, h3, span"
    ).filter((_, el) =>
      $(el as any)
        .text()
        .includes('인기글')
    );
    if (sectionHeaders.length > 0) {
      sectionHeaders.each((_, el) => {
        const container = $(el as any).closest('section,div');
        const label = $(el as any)
          .text()
          .trim();
        if (container.length) readBlock($, container, items, label);
      });
    }
  }

  if (items.length === 0) {
    readBlock($, $('body'), items);
  }

  const unique = new Map<string, PopularItem>();
  for (const it of items) if (!unique.has(it.link)) unique.set(it.link, it);
  return Array.from(unique.values()).slice(0, 30);
};

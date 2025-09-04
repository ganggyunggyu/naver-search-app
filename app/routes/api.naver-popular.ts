import type { Route } from './+types/api.naver-popular';
import * as cheerio from 'cheerio';

type PopularItem = {
  title: string;
  link: string;
  snippet?: string;
  image?: string;
  badge?: string;
  group?: string; // 섹션 헤더 텍스트 (예: 라미네이트 뜻)
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const q = url.searchParams.get('q');

  const buildSearchUrl = (query: string) =>
    `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(query)}`;

  const finalUrl = targetUrl || (q ? buildSearchUrl(q) : null);

  if (!finalUrl) {
    return Response.json(
      { error: 'URL 또는 q(검색어)가 필요합니다.', status: 400 },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(finalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    // 섹션 타이틀이 '인기글'인 블록 근처에서 아이템 탐색
    const sectionHeaders = $(
      "[class*='fds-comps-header-headline'], h2, h3, span"
    ).filter((_, el) => $(el).text().includes('인기글'));

    const items: PopularItem[] = [];

    const normalizeLink = (href?: string, cru?: string) => {
      if (cru && cru.startsWith('http')) return cru;
      if (!href) return '';
      // 네이버 리다이렉트 URL 내부의 실제 u 파라미터 추출
      try {
        const uParam = new URLSearchParams(href.split('?')[1] || '').get('u');
        if (uParam) return decodeURIComponent(uParam);
      } catch {}
      if (href.startsWith('/')) return `https://search.naver.com${href}`;
      return href;
    };

    // 인기 키워드 헤더 선택자 (분석 페이지에서 확인한 클래스명 사용)
    const KEYWORD_HEADER_SELECTOR =
      '.fds-comps-text.fds-comps-header-headline.pP6CrxLzumAlsR4_qelA, ' +
      '.fds-comps-header-headline.pP6CrxLzumAlsR4_qelA, ' +
      '.fds-comps-text.fds-comps-header-headline, ' +
      '.fds-comps-header-headline, ' +
      "[class*='fds-comps-header-headline']";

    const POPULAR_ITEM_SELECTOR = "[class*='fds-comps-right-image-desktop']";

    const findPopularSections = () => {
      const sections: Array<{
        keyword: string;
        container: cheerio.Cheerio<any>;
      }> = [];

      // 인기 키워드 헤더들 찾기
      $(KEYWORD_HEADER_SELECTOR).each((_, headerEl) => {
        const $header = $(headerEl);
        const headerText = $header.text().trim();

        // 빈 헤더는 스킵
        if (!headerText || headerText.length < 2) return;

        // 헤더 다음에 있는 인기글 컨테이너들 찾기
        let $container = $header.parent();

        // 상위 컨테이너에서 인기글 아이템들 찾기 (5단계까지 올라가면서 검색)
        for (let level = 0; level < 5; level++) {
          const $items = $container.find(POPULAR_ITEM_SELECTOR);
          if ($items.length > 0) {
            sections.push({
              keyword: headerText,
              container: $container,
            });
            break;
          }
          $container = $container.parent();
          if (!$container.length) break;
        }
      });

      return sections;
    };

    const findGroupLabelNear = ($node: cheerio.Cheerio<any>): string => {
      // 1) 직접적인 상위 컨테이너에서 헤더 찾기
      let $current = $node;
      for (let level = 0; level < 6; level++) {
        const $container = $current.closest('section, div, article');
        if ($container.length) {
          const $header = $container.find(KEYWORD_HEADER_SELECTOR).first();
          if ($header.length) {
            const headerText = $header.text().trim();
            if (headerText && headerText.length > 1) {
              return headerText;
            }
          }
        }
        $current = $container.parent();
        if (!$current.length) break;
      }

      // 2) 이전 형제 요소들 중에서 헤더 찾기
      const $prevHeaders = $node.prevAll().find(KEYWORD_HEADER_SELECTOR);
      if ($prevHeaders.length) {
        const headerText = $prevHeaders.first().text().trim();
        if (headerText && headerText.length > 1) {
          return headerText;
        }
      }

      return '';
    };

    const readBlock = (root: cheerio.Cheerio<any>, fixedGroup?: string) => {
      root.find("[class*='fds-comps-right-image-desktop']").each((_, el) => {
        const $el = $(el);
        const titleA = $el.find('a.fds-comps-right-image-text-title').first();
        const snippetA = $el
          .find('a.fds-comps-right-image-text-content')
          .first();
        const imageEl = $el
          .find('a.fds-comps-right-image-content-image-container-item img')
          .first();
        const badgeEl = $el
          .find('.fds-comps-right-image-content-image-badge span')
          .first();

        const title = titleA.text().trim();
        const link = normalizeLink(titleA.attr('href'), titleA.attr('cru'));
        const snippet = snippetA.text().trim();
        const image = imageEl.attr('src');
        const badge = badgeEl.text().trim();
        const group = fixedGroup || findGroupLabelNear($el);

        if (title && link && link.includes('blog.naver.com')) {
          items.push({ title, link, snippet, image, badge, group });
        }
      });
    };

    // 1) 개선된 키워드별 섹션 분석
    const popularSections = findPopularSections();

    if (popularSections.length > 0) {
      for (const section of popularSections) {
        readBlock(section.container, section.keyword);
      }
    }

    // 2) 개선된 방법으로도 못 찾았으면 기존 방식으로 폴백
    if (items.length === 0) {
      if (sectionHeaders.length > 0) {
        sectionHeaders.each((_, el) => {
          const container = $(el).closest('section,div');
          const label = $(el).text().trim();
          if (container.length) readBlock(container, label);
        });
      }
    }

    // 3) 그래도 못 찾았으면 페이지 전역에서 수집
    if (items.length === 0) {
      readBlock($('body'));
    }

    // 중복 제거 (link 기준)
    const unique = new Map<string, PopularItem>();
    for (const it of items) {
      if (!unique.has(it.link)) unique.set(it.link, it);
    }

    const result = Array.from(unique.values()).slice(0, 30);

    return Response.json({
      url: finalUrl,
      count: result.length,
      items: result,
      status: 200,
    });
  } catch (err) {
    console.error('Popular extraction error:', err);
    return Response.json(
      {
        error: `인기글 추출 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}

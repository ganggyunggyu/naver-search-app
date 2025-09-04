import type { Route } from "./+types/api.naver-search";
import * as cheerio from 'cheerio';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");
  const className = url.searchParams.get("class") || "fds-comps-text fds-comps-header-headline pP6CrxLzumAlsR4_qelA";

  if (!targetUrl) {
    return Response.json(
      {
        error: "URL이 필요합니다.",
        status: 400,
      },
      { status: 400 }
    );
  }

  try {
    // 네이버 모바일 검색 페이지 크롤링
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('Searching for class:', className);

    // 클래스명으로 요소 찾기
    const results: string[] = [];
    const classSelector = className.split(' ').map(c => `.${c}`).join('');
    
    console.log('Using selector:', classSelector);

    // 정확한 클래스명으로 검색
    const elements = $(classSelector);
    console.log('Found elements with exact class:', elements.length);

    elements.each((_, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 5) {
        results.push(text);
      }
    });

    // 부분 클래스명으로도 검색 시도
    if (results.length === 0) {
      const partialSelectors = [
        '.fds-comps-text',
        '.fds-comps-header-headline',
        '.pP6CrxLzumAlsR4_qelA',
        '[class*="fds-comps-text"]',
        '[class*="fds-comps-header"]',
        '[class*="pP6CrxLzumAlsR4_qelA"]'
      ];

      for (const selector of partialSelectors) {
        console.log('Trying partial selector:', selector);
        const partialElements = $(selector);
        console.log('Found elements:', partialElements.length);
        
        partialElements.each((_, element) => {
          const text = $(element).text().trim();
          if (text && text.length > 5 && !results.includes(text)) {
            results.push(text);
          }
        });

        if (results.length > 0) {
          console.log('Success with selector:', selector);
          break;
        }
      }
    }

    // 모든 텍스트 요소 검색 (최후의 수단)
    if (results.length === 0) {
      console.log('Trying fallback: searching all text elements');
      $('h1, h2, h3, h4, h5, h6, p, div, span').each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 10 && text.length < 500) {
          results.push(text);
        }
      });
    }

    // 중복 제거
    const uniqueResults = [...new Set(results)];

    console.log('Final results count:', uniqueResults.length);

    return Response.json({
      url: targetUrl,
      className: className,
      results: uniqueResults,
      count: uniqueResults.length,
      status: 200,
    });

  } catch (error) {
    console.error('Naver search scraping error:', error);
    return Response.json(
      {
        error: `페이지를 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}
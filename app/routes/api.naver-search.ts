import type { Route } from "./+types/api.naver-search";
import { fetchHtml, NAVER_MOBILE_HEADERS, jsonError, extractTextsFromSearch } from '@/utils';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");
  const className = url.searchParams.get("class") || "fds-comps-text fds-comps-header-headline pP6CrxLzumAlsR4_qelA";

  if (!targetUrl) return jsonError("URL이 필요합니다.", 400);

  try {
    const html = await fetchHtml(targetUrl, NAVER_MOBILE_HEADERS);
    const results = extractTextsFromSearch(html, className);

    // 부분 클래스명으로도 검색 시도
    if (results.length === 0) {
      // already handled in extractTextsFromSearch
    }

    // 모든 텍스트 요소 검색 (최후의 수단)
    if (results.length === 0) {
      // already handled in extractTextsFromSearch
    }

    const uniqueResults = [...new Set(results)];

    return Response.json({
      url: targetUrl,
      className: className,
      results: uniqueResults,
      count: uniqueResults.length,
      status: 200,
    });

  } catch (error) {
    console.error('Naver search scraping error:', error);
    const msg =
      error instanceof Error ? error.message : '알 수 없는 오류';
    return jsonError(`페이지를 가져오는데 실패했습니다: ${msg}`, 500);
  }
};

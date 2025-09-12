import { crawlNaverBlogSearch, logBlogCrawlResults } from '@/entities/naver';
import { jsonError } from '@/shared';
import type { Route } from './+types/api.blog-search';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || url.searchParams.get('q');
  const logResults = url.searchParams.get('log') === 'true';

  if (!query) {
    return jsonError('검색 키워드가 필요합니다.', 400);
  }

  try {
    console.log(`네이버 블로그 크롤링 시작: "${query}"`);

    const results = await crawlNaverBlogSearch(query);

    // 콘솔 로그 출력 (옵션)
    if (logResults) {
      logBlogCrawlResults(results);
    }

    return Response.json({
      success: true,
      keyword: query,
      method: 'crawling',
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('네이버 블로그 크롤링 오류:', error);
    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류';
    return jsonError(`블로그 크롤링 실패: ${errorMessage}`, 500);
  }
};

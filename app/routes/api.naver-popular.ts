import type { Route } from './+types/api.naver-popular';
import {
  fetchHtml,
  NAVER_DESKTOP_HEADERS,
  buildNaverSearchUrl,
  jsonError,
  extractPopularItems,
} from '@/utils';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const q = url.searchParams.get('q');

  const finalUrl = targetUrl || (q ? buildNaverSearchUrl(q) : null);

  if (!finalUrl) return jsonError('URL 또는 q(검색어)가 필요합니다.', 400);

  try {
    const html = await fetchHtml(finalUrl, NAVER_DESKTOP_HEADERS);
    const items = extractPopularItems(html);

    return Response.json({
      url: finalUrl,
      count: items.length,
      items,
      status: 200,
    });
  } catch (err) {
    console.error('Popular extraction error:', err);
    const msg = err instanceof Error ? err.message : '알 수 없는 오류';
    return jsonError(`인기글 추출 실패: ${msg}`, 500);
  }
};

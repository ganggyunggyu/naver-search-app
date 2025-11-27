import { fetchNaverOpenApi, jsonError } from '@/shared';
import type { Route } from './+types/api.search';

interface NaverBlogItem {
  title: string;
  link: string;
  description: string;
  bloggername?: string;
  bloggerlink?: string;
  postdate?: string;
}

interface NaverSearchApiResponse<TItem> {
  total: number;
  start: number;
  display: number;
  items: TItem[];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const display = url.searchParams.get('display') || '10';
  const start = url.searchParams.get('start') || '1';
  const sort = url.searchParams.get('sort') || 'sim';

  if (!query) return jsonError('검색어가 필요합니다.', 400);

  try {
    const data = await fetchNaverOpenApi<NaverSearchApiResponse<NaverBlogItem>>(
      'https://openapi.naver.com/v1/search/blog.json',
      { query: encodeURIComponent(query), display, start, sort }
    );
    return Response.json({
      total: data.total,
      start: data.start,
      display: data.display,
      items: data.items || [],
      query,
      status: 200,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return jsonError('검색 중 오류가 발생했습니다.', 500);
  }
};

import type { LoaderFunctionArgs } from 'react-router';
import { fetchKeywordStats } from '@/shared/utils/api/searchad';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') || '';
  const keywords = keyword ? keyword.split(',').map((k) => k.trim()) : [];

  if (keywords.length === 0) {
    return Response.json({ error: 'keyword 필요' }, { status: 400 });
  }

  try {
    const data = await fetchKeywordStats(keywords);
    return Response.json({ keywords, stats: data });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
};

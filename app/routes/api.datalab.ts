import type { LoaderFunctionArgs } from 'react-router';
import { fetchDatalabTrend } from '@/shared/utils/api/datalab';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') || '';
  const keywords = keyword ? keyword.split(',').map((k) => k.trim()) : [];

  if (keywords.length === 0) {
    return Response.json({ error: 'keyword 필요' }, { status: 400 });
  }

  try {
    const data = await fetchDatalabTrend(keywords);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
};

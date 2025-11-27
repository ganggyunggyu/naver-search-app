import type { Route } from './+types/api.naver-popular';
import {
  buildNaverSearchUrl,
  jsonError,
  matchBlogs,
  fetchAndParsePopular,
} from '@/shared';
import { crawlNaverBlogSearch } from '@/entities';
import type {
  PopularItem,
  BlogCrawlResponse,
} from '@/entities/naver/_types';
import type { ExposureCheckResult } from '@/shared/utils/_exposure';

interface PopularApiResult {
  url: string;
  count: number;
  items: PopularItem[];
  status: number;
  exposure?: ExposureCheckResult;
  blog?: BlogCrawlResponse;
  blogError?: string;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const q = url.searchParams.get('q');
  const includeBlog = url.searchParams.get('blog') === 'true';
  const checkExposure = url.searchParams.get('exposure') === 'true';

  const finalUrl = targetUrl || (q ? buildNaverSearchUrl(q) : null);

  if (!finalUrl) return jsonError('URL 또는 q(검색어)가 필요합니다.', 400);

  try {
    const items = await fetchAndParsePopular(finalUrl);

    const result: PopularApiResult = {
      url: finalUrl,
      count: items.length,
      items,
      status: 200,
    };

    if (checkExposure && q) {
      result.exposure = matchBlogs(q, items);
    }

    if (includeBlog && q) {
      try {
        const blogData = await crawlNaverBlogSearch(q);
        result.blog = blogData;
      } catch (blogErr) {
        console.error('블로그 검색 실패:', blogErr);
        result.blogError =
          blogErr instanceof Error ? blogErr.message : '블로그 검색 실패';
      }
    }

    return Response.json(result);
  } catch (err) {
    console.error('Popular extraction error:', err);
    const msg = err instanceof Error ? err.message : '알 수 없는 오류';
    return jsonError(`인기글 추출 실패: ${msg}`, 500);
  }
};

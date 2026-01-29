import type { Route } from './+types/api.blog-contents';
import {
  jsonError,
  fetchAndParsePopular,
  buildNaverSearchUrl,
  resolveNaverBlogHtml,
  extractContentFromHtml,
} from '@/shared';

interface BlogContent {
  rank: number;
  title: string;
  blogName: string;
  url: string;
  content: string;
  charCount: number;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const limitParam = url.searchParams.get('limit');
  const limit = Math.min(parseInt(limitParam || '5', 10), 10);

  if (!q) return jsonError('검색어(q)가 필요합니다.', 400);

  try {
    const searchUrl = buildNaverSearchUrl(q);
    const popularItems = await fetchAndParsePopular(searchUrl);

    if (popularItems.length === 0) {
      return Response.json({
        keyword: q,
        count: 0,
        contents: [],
        error: '인기글을 찾을 수 없습니다.',
      });
    }

    const blogUrls = popularItems
      .filter((item) => item.link && item.link.includes('blog.naver.com'))
      .slice(0, limit);

    const contentPromises = blogUrls.map(async (item, idx) => {
      try {
        const { html } = await resolveNaverBlogHtml(item.link);
        const { title, content, blogName } = extractContentFromHtml(html);

        return {
          rank: idx + 1,
          title: title || item.title,
          blogName: blogName || item.blogName || '',
          url: item.link,
          content: content || '',
          charCount: content?.length || 0,
        };
      } catch (err) {
        return {
          rank: idx + 1,
          title: item.title,
          blogName: item.blogName || '',
          url: item.link,
          content: `본문 추출 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
          charCount: 0,
        };
      }
    });

    const contents: BlogContent[] = await Promise.all(contentPromises);

    return Response.json({
      keyword: q,
      count: contents.length,
      totalChars: contents.reduce((sum, c) => sum + c.charCount, 0),
      avgChars: Math.round(contents.reduce((sum, c) => sum + c.charCount, 0) / contents.length),
      contents,
    });
  } catch (err) {
    console.error('Blog contents fetch error:', err);
    const msg = err instanceof Error ? err.message : '알 수 없는 오류';
    return jsonError(`블로그 본문 추출 실패: ${msg}`, 500);
  }
};

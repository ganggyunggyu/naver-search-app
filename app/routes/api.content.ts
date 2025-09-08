import type { Route } from './+types/api.content';
import {
  jsonError,
  resolveNaverBlogHtml,
  extractContentFromHtml,
} from '@/utils';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const blogUrl = url.searchParams.get('url');

  if (!blogUrl) return jsonError('블로그 URL이 필요합니다.', 400);

  try {
    const { html, actualUrl } = await resolveNaverBlogHtml(blogUrl);
    const { title, content, images, blogName, debug } =
      extractContentFromHtml(html);

    if (!content.trim() || content.length < 50) {
      return Response.json({
        title: title.trim(),
        blogName: blogName || undefined,
        content:
          '본문을 추출할 수 없습니다. 해당 블로그의 구조가 지원되지 않을 수 있습니다.',
        images,
        url: blogUrl,
        actualUrl,
        status: 200,
        debug,
      });
    }

    return Response.json({
      title: title.trim(),
      blogName: blogName || undefined,
      content: content.trim(),
      images,
      url: blogUrl,
      actualUrl,
      status: 200,
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    const msg = error instanceof Error ? error.message : '알 수 없는 오류';
    return jsonError(`본문을 가져오는데 실패했습니다: ${msg}`, 500);
  }
};

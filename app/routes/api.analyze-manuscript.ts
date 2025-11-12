import type { Route } from './+types/api.analyze-manuscript';
import { analyzeManuscript, jsonError } from '@/shared';

interface AnalyzeRequest {
  content: string;
  include?: string;
}

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== 'POST') {
    return jsonError('POST 메서드만 허용됩니다.', 405);
  }

  try {
    const body: AnalyzeRequest = await request.json();
    const { content, include } = body;

    if (!content || typeof content !== 'string') {
      return jsonError('content 필드가 필요합니다.', 400);
    }

    const analysis = analyzeManuscript(content, include);

    return Response.json({
      status: 200,
      data: analysis,
    });
  } catch (err) {
    console.error('Manuscript analysis error:', err);
    const msg = err instanceof Error ? err.message : '알 수 없는 오류';
    return jsonError(`원고 분석 실패: ${msg}`, 500);
  }
};

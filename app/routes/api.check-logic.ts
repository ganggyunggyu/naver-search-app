import type { Route } from './+types/api.check-logic';
import {
  buildNaverSearchUrl,
  fetchAndParsePopular,
  jsonError,
  jsonOk,
} from '@/shared';

interface CheckLogicRequest {
  keyword: string;
}

const SINGLE_TOPIC_COUNT = 1;

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== 'POST') {
    return jsonError('POST 메서드만 허용됩니다.', 405);
  }

  try {
    const body: CheckLogicRequest = await request.json();
    const rawKeyword = body?.keyword;
    const keyword = typeof rawKeyword === 'string' ? rawKeyword.trim() : '';

    if (!keyword) {
      return jsonError('keyword 필드가 필요합니다.', 400);
    }

    const url = buildNaverSearchUrl(keyword);
    const items = await fetchAndParsePopular(url);

    const topicNameSet = new Set<string>();
    const topicNameList: string[] = [];

    items.forEach((item) => {
      const groupName = item.group?.trim();
      if (!groupName) return;
      if (topicNameSet.has(groupName)) return;
      topicNameSet.add(groupName);
      topicNameList.push(groupName);
    });

    const isNewLogic = topicNameList.length === SINGLE_TOPIC_COUNT;

    return jsonOk(
      {
        ok: true,
        keyword,
        isNewLogic,
        topicNames: topicNameList,
        itemCount: items.length,
      },
      200
    );
  } catch (err) {
    console.error('Check logic error:', err);
    const msg = err instanceof Error ? err.message : '알 수 없는 오류';
    return jsonError(`로직 확인 실패: ${msg}`, 500);
  }
};

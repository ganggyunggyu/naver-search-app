import { BLOG_IDS, BLOG_ID_SET } from '@/constants';
import { extractBlogIdFromUrl } from '@/shared/utils/blog';
import type { PopularItem } from '@/entities/naver/types';

export interface ExposureResult {
  query: string;
  blogId: string;
  blogName?: string;
  postTitle: string;
  postLink: string;
  exposureType: '인기글' | '스블';
  topicName?: string;
  position: number;
}

export interface ExposureCheckResult {
  query: string;
  exposed: ExposureResult[];
  notExposed: string[];
  exposureType: '인기글' | '스블';
}

export const matchBlogs = (
  query: string,
  items: PopularItem[]
): ExposureCheckResult => {
  const exposed: ExposureResult[] = [];
  const exposedIds = new Set<string>();

  const uniqueGroups = new Set(items.map((item) => item.group));
  const isPopular = uniqueGroups.size === 1;
  const exposureType = isPopular ? '인기글' : '스블';

  items.forEach((item, index) => {
    const blogId = extractBlogIdFromUrl(item.blogLink ?? '');

    if (blogId && BLOG_ID_SET.has(blogId)) {
      exposedIds.add(blogId);

      exposed.push({
        query,
        blogId,
        blogName: item.blogName,
        postTitle: item.title,
        postLink: item.link,
        exposureType,
        topicName: isPopular ? undefined : item.group,
        position: index + 1,
      });
    }
  });

  const notExposed = BLOG_IDS.filter(
    (id) => !exposedIds.has(id.toLowerCase())
  );

  return {
    query,
    exposed,
    notExposed,
    exposureType,
  };
};

export const printExposureResult = (result: ExposureCheckResult): void => {
  const { query, exposed, notExposed, exposureType } = result;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`검색어: ${query}`);
  console.log(`타입: ${exposureType}`);
  console.log(`${'='.repeat(60)}`);

  console.log(`\n📍 미노출 (${notExposed.length}개)`);
  console.log(`${'─'.repeat(40)}`);
  if (notExposed.length === 0) {
    console.log('  ✅ 모든 블로그 노출됨!');
  } else {
    notExposed.forEach((blogId, idx) => {
      console.log(`  ${idx + 1}. ${blogId}`);
    });
  }

  console.log(`\n📍 노출 (${exposed.length}개)`);
  console.log(`${'─'.repeat(40)}`);
  if (exposed.length === 0) {
    console.log('  ❌ 노출된 블로그 없음');
  } else {
    exposed.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.blogId} (${item.position}위)`);
      console.log(`     └─ ${item.postTitle.slice(0, 40)}...`);
    });
  }

  console.log(`\n${'='.repeat(60)}\n`);
};

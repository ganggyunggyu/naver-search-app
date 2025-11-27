import type { PopularItem } from '@/entities/naver/_types';
import { BLOG_IDS } from '@/constants';

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

const extractBlogId = (blogLink: string): string | null => {
  if (!blogLink) return null;

  const urlPatterns = [
    /blog\.naver\.com\/([^/?&#]+)/,
    /in\.naver\.com\/([^/?&#]+)/,
    /m\.blog\.naver\.com\/([^/?&#]+)/,
  ];

  for (const pattern of urlPatterns) {
    const match = blogLink.match(pattern);
    if (match?.[1]) return match[1].toLowerCase();
  }

  return null;
};

export const matchBlogs = (
  query: string,
  items: PopularItem[]
): ExposureResult[] => {
  const results: ExposureResult[] = [];
  const allowedIds = new Set(BLOG_IDS.map((id) => id.toLowerCase()));

  const uniqueGroups = new Set(items.map((item) => item.group));
  const isPopular = uniqueGroups.size === 1;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`검색어: ${query}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`총 ${items.length}개 아이템, 고유 group ${uniqueGroups.size}개`);
  console.log(`구분: ${isPopular ? '인기글' : '스블 (스마트블로그)'}`);

  if (!isPopular) {
    console.log('\n인기 주제들:');
    Array.from(uniqueGroups).forEach((group, idx) => {
      const count = items.filter((item) => item.group === group).length;
      console.log(`  ${idx + 1}. ${group} (${count}개)`);
    });
  }

  console.log('\n노출 확인 중...\n');

  items.forEach((item, index) => {
    const blogId = extractBlogId(item.blogLink ?? '');

    if (blogId && allowedIds.has(blogId)) {
      const exposureType = isPopular ? '인기글' : '스블';
      const topicName = isPopular ? undefined : item.group;

      results.push({
        query,
        blogId,
        blogName: item.blogName,
        postTitle: item.title,
        postLink: item.link,
        exposureType,
        topicName,
        position: index + 1,
      });

      console.log(`✅ 노출 발견!`);
      console.log(`  블로그 ID: ${blogId}`);
      console.log(`  블로그명: ${item.blogName}`);
      console.log(`  타입: ${exposureType}`);
      if (topicName) console.log(`  주제: ${topicName}`);
      console.log(`  순위: ${index + 1}위`);
      console.log(`  제목: ${item.title}`);
      console.log(`  링크: ${item.link.substring(0, 80)}...`);
      console.log('');
    }
  });

  if (results.length === 0) {
    console.log('❌ 노출 없음');
  } else {
    console.log(`\n총 ${results.length}개 노출 발견`);
  }

  console.log('='.repeat(60));

  return results;
};

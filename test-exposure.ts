import {
  fetchHtml,
  NAVER_DESKTOP_HEADERS,
  buildNaverSearchUrl,
  extractPopularItems,
  matchBlogs,
} from './app/shared';
import { printExposureResult } from './app/shared/utils/_exposure';

async function testExposure(query: string) {
  console.log(`\n\n${'#'.repeat(70)}`);
  console.log(`# 검색어: "${query}" 테스트 시작`);
  console.log(`${'#'.repeat(70)}\n`);

  try {
    const url = buildNaverSearchUrl(query);
    const html = await fetchHtml(url, NAVER_DESKTOP_HEADERS);
    const items = extractPopularItems(html);

    const result = matchBlogs(query, items);

    printExposureResult(result);

    console.log('\n📊 요약:');
    console.log(`  노출: ${result.exposed.length}개`);
    console.log(`  미노출: ${result.notExposed.length}개`);
  } catch (err) {
    console.error('에러 발생:', err);
  }
}

async function main() {
  const keywords = ['위고비', '김포공항주차대행', '알파CD'];

  for (const keyword of keywords) {
    await testExposure(keyword);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n\n✅ 모든 테스트 완료\n');
}

main().catch(console.error);

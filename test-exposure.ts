import {
  fetchHtml,
  NAVER_DESKTOP_HEADERS,
  buildNaverSearchUrl,
  extractPopularItems,
  matchBlogs,
} from './app/shared';

async function testExposure(query: string) {
  console.log(`\n\n${'#'.repeat(70)}`);
  console.log(`# 검색어: "${query}" 테스트 시작`);
  console.log(`${'#'.repeat(70)}\n`);

  try {
    const url = buildNaverSearchUrl(query);
    const html = await fetchHtml(url, NAVER_DESKTOP_HEADERS);
    const items = extractPopularItems(html);

    const exposures = matchBlogs(query, items);

    console.log('\n\n📊 최종 결과:');
    console.log(`총 ${exposures.length}개 노출 발견\n`);

    if (exposures.length > 0) {
      exposures.forEach((exp, idx) => {
        console.log(`[${idx + 1}]`);
        console.log(`  블로그 ID: ${exp.blogId}`);
        console.log(`  블로그명: ${exp.blogName}`);
        console.log(`  타입: ${exp.exposureType}`);
        if (exp.topicName) console.log(`  주제: ${exp.topicName}`);
        console.log(`  순위: ${exp.position}위`);
        console.log(`  제목: ${exp.postTitle}`);
        console.log('');
      });
    }
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

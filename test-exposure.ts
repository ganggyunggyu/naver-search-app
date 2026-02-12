import {
  buildNaverSearchUrl,
  extractPopularItems,
  fetchHtml,
  matchBlogs,
  NAVER_DESKTOP_HEADERS,
  printExposureResult,
} from './app/shared';

const KEYWORD_LIST: string[] = ['위고비', '김포공항주차대행', '알파CD'];
const SEPARATOR_LENGTH = 70;
const DELAY_MS = 1000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const printTestStart = (query: string): void => {
  const separator = '#'.repeat(SEPARATOR_LENGTH);
  console.log(`\n\n${separator}`);
  console.log(`# 검색어: "${query}" 테스트 시작`);
  console.log(`${separator}\n`);
};

const testExposure = async (query: string): Promise<void> => {
  printTestStart(query);

  try {
    const url = buildNaverSearchUrl(query);
    const html = await fetchHtml(url, NAVER_DESKTOP_HEADERS);
    const items = extractPopularItems(html);

    const result = matchBlogs(query, items);

    printExposureResult(result);

    console.log('\n요약:');
    console.log(`  노출: ${result.exposed.length}개`);
    console.log(`  미노출: ${result.notExposed.length}개`);
  } catch (err) {
    console.error('에러 발생:', err);
  }
};

const main = async (): Promise<void> => {
  for (const keyword of KEYWORD_LIST) {
    await testExposure(keyword);
    await sleep(DELAY_MS);
  }

  console.log('\n\n모든 테스트 완료\n');
};

main().catch((err) => {
  console.error(err);
});

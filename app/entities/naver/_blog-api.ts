import type { BlogSearchResponse } from './_types';

export const searchNaverBlog = async (
  query: string,
  display: number = 10,
  start: number = 1,
  sort: 'sim' | 'date' = 'sim'
): Promise<BlogSearchResponse> => {
  const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
  const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    throw new Error('네이버 API 키가 설정되지 않았습니다');
  }

  const searchUrl = new URL('https://openapi.naver.com/v1/search/blog.json');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('display', display.toString());
  searchUrl.searchParams.set('start', start.toString());
  searchUrl.searchParams.set('sort', sort);

  try {
    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`네이버 API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const data: BlogSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('네이버 블로그 검색 API 오류:', error);
    throw error;
  }
};

export const logBlogSearchResults = (response: BlogSearchResponse, keyword: string) => {
  console.log('\n[SEARCH] ====== 네이버 블로그 검색 결과 ======');
  console.log(`[KEYWORD] 검색어: "${keyword}"`);
  console.log(`[STATS] 전체 결과: ${response.total.toLocaleString()}개`);
  console.log(`[DISPLAY] 표시 결과: ${response.items.length}개`);
  console.log(`[TIME] 검색 시간: ${response.lastBuildDate}`);
  console.log('==========================================\n');

  response.items.forEach((item, index) => {
    console.log(`${index + 1}. [TITLE] ${item.title.replace(/<\/?[^>]+(>|$)/g, '')}`);
    console.log(`   [BLOGGER] 블로거: ${item.bloggername}`);
    console.log(`   [DATE] 작성일: ${item.postdate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}`);
    console.log(`   [LINK] 링크: ${item.link}`);
    console.log(`   [DESC] 요약: ${item.description.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 100)}...`);
    console.log('   ─────────────────────────────────────────');
  });

  console.log('\n[COMPLETE] === 검색 완료 ===\n');
};
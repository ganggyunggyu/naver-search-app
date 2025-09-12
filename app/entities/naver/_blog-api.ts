import type { BlogSearchResponse } from './_types';

/**
 * 네이버 블로그 검색 API 호출 함수
 * @param query 검색 키워드
 * @param display 검색 결과 수 (기본 10개, 최대 100개)
 * @param start 검색 시작 위치 (기본 1)
 * @param sort 정렬 방식 ('sim': 정확도순, 'date': 날짜순)
 */
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

/**
 * 블로그 검색 결과를 콘솔에 예쁘게 출력하는 함수
 */
export const logBlogSearchResults = (response: BlogSearchResponse, keyword: string) => {
  console.log('\n🔍 ====== 네이버 블로그 검색 결과 ======');
  console.log(`📝 검색어: "${keyword}"`);
  console.log(`📊 전체 결과: ${response.total.toLocaleString()}개`);
  console.log(`📄 표시 결과: ${response.items.length}개`);
  console.log(`🕐 검색 시간: ${response.lastBuildDate}`);
  console.log('==========================================\n');

  response.items.forEach((item, index) => {
    console.log(`${index + 1}. 📝 ${item.title.replace(/<\/?[^>]+(>|$)/g, '')}`);
    console.log(`   👤 블로거: ${item.bloggername}`);
    console.log(`   📅 작성일: ${item.postdate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}`);
    console.log(`   🔗 링크: ${item.link}`);
    console.log(`   📄 요약: ${item.description.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 100)}...`);
    console.log('   ─────────────────────────────────────────');
  });

  console.log('\n🎯 === 검색 완료 === 🎯\n');
};
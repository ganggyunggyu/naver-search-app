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

  response.items.forEach((item, index) => {
  });

};
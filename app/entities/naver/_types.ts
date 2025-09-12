export interface PopularItem {
  title: string;
  link: string;
  blogName?: string;
  blogLink?: string;

  snippet?: string;
  image?: string;
  badge?: string;
  group?: string;
}

export interface PopularResponse {
  url: string;
  count: number;
  items: PopularItem[];
  status: number;
  error?: string;
}

// 네이버 블로그 검색 API 타입
export interface BlogSearchItem {
  title: string;          // 블로그 포스트 제목
  link: string;           // 블로그 포스트 URL
  description: string;    // 블로그 포스트 요약
  bloggername: string;    // 블로거 이름
  bloggerlink: string;    // 블로거 블로그 URL
  postdate: string;       // 포스트 작성일 (YYYYMMDD)
}

export interface BlogSearchResponse {
  lastBuildDate: string;  // 검색 결과 생성 시간
  total: number;          // 전체 검색 결과 개수
  start: number;          // 검색 시작 위치
  display: number;        // 한 번에 표시할 검색 결과 개수
  items: BlogSearchItem[]; // 검색 결과 리스트
}

// 네이버 모바일 블로그 검색 크롤링 결과 타입
export interface BlogCrawlItem {
  title: string;           // 블로그 포스트 제목
  link: string;           // 블로그 포스트 URL  
  description: string;    // 블로그 포스트 요약
  blogName?: string;      // 블로그 이름
  blogLink?: string;      // 블로그 홈페이지 URL
  author?: string;        // 작성자
  date?: string;          // 작성일
  thumbnail?: string;     // 썸네일 이미지
}

export interface BlogCrawlResponse {
  keyword: string;        // 검색 키워드
  items: BlogCrawlItem[]; // 크롤링 결과 리스트
  total: number;          // 추출된 결과 개수
  url: string;            // 크롤링한 URL
}

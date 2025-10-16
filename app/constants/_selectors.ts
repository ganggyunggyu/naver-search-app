/**
 * 네이버 검색 결과에서 키워드 헤더를 찾기 위한 기본 셀렉터
 * 예: "건강·의학 인기글", "IT·컴퓨터 인기글" 등의 카테고리 헤더
 */
export const KEYWORD_HEADER_SELECTOR = '.fds-comps-header-headline';
// export const KEYWORD_HEADER_SELECTOR = '.sds-comps-text';

/**
 * 네이버 검색 결과 파싱 시 Fallback 셀렉터 목록
 *
 * 네이버가 HTML 구조를 자주 변경하기 때문에,
 * 기본 셀렉터로 찾지 못할 경우 순차적으로 시도할 셀렉터들
 *
 * - `.fds-comps-text`: 일반 텍스트 컴포넌트 (기존 구조)
 * - `.fds-ugc-single-intention-item-list`: 인기글 리스트 컨테이너 (2025년 10월 추가)
 * - `.sds-comps-text-type-headline1`: 헤드라인 타입 텍스트 (제목, 헤더)
 */
export const SEARCH_PARTIAL_SELECTORS = [
  '.fds-comps-text',
  '.fds-ugc-single-intention-item-list',
  '.sds-comps-text-type-headline1',
];

// Popular section selectors (Naver, 2024)
// 여러 구조를 대비해 다중 셀렉터를 사용 (정확 + 부분일치)
export const POPULAR_SECTION_SELECTOR = [
  // 기존 fds 컬렉션 루트(정확 매칭)
  '.sds-comps-base-layout.sds-comps-inline-layout.fds-collection-root.EkB_nKxG9b8hIoLEinrJ.MWH0090w2CU4WBvp6C_G',
  // 리뷰 섹션(정확 매칭): sc sp_nreview _fe_view_root _prs_ugB_bsR _slog_visible
  '.sc.sp_nreview._fe_view_root._prs_ugB_bsR._slog_visible',
  // 리뷰 섹션(부분일치 매칭)
  "[class*='sp_nreview'][class*='_fe_view_root'][class*='_prs_'][class*='_slog_visible']",
].join(', ');

export const KEYWORD_HEADER_SELECTOR =
  '.cRDU8rdDgYK5R0AXfuCy .fds-comps-text.fds-comps-header-headline.pP6CrxLzumAlsR4_qelA, ' +
  '.fds-comps-header-headline.pP6CrxLzumAlsR4_qelA, ' +
  '.fds-comps-text.fds-comps-header-headline, ' +
  '.fds-comps-header-headline, ' +
  "[class*='fds-comps-header-headline']";

// 인기글 카드 아이템 선택자 (변형 대비)
export const POPULAR_ITEM_SELECTOR = ["[class*='img']"].join(', ');

// Search fallback selectors
export const SEARCH_PARTIAL_SELECTORS = [
  '.fds-comps-text',
  '.fds-comps-header-headline',
  '.pP6CrxLzumAlsR4_qelA',
  "[class*='fds-comps-text']",
  "[class*='fds-comps-header']",
  "[class*='pP6CrxLzumAlsR4_qelA']",
];

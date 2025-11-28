# Naver Search Engine - 네이버 검색 결과 파싱 도구

## 프로젝트 개요

네이버 블로그 검색 결과에서 인기글을 추출하고 분석하는 도구다. 처음엔 특정 키워드로 내 블로그가 인기글에 노출되는지 확인하려고 만들었는데, 네이버가 HTML 구조를 자주 바꿔서 유지보수가 주요 작업이 됐다.

**주요 기능:**
- 네이버 검색 결과 페이지에서 인기글 추출
- 특정 블로그 ID의 노출 여부 확인
- 블로그 본문 콘텐츠 추출
- 원고 분석 (글자수, 키워드 빈도 등)

**기술 스택:**
- Frontend: React 19, React Router v7 (SSR)
- Language: TypeScript (strict mode)
- Styling: TailwindCSS v4
- State: Jotai
- Parsing: Cheerio

---

## 기술적 도전과제 및 해결

### 1. 네이버 HTML 구조 변경 대응

가장 큰 문제는 네이버가 HTML 클래스명을 주기적으로 바꾼다는 점이다. 해시 기반 클래스명이라 `w0FkNRfc2K6rffX0LJFd` 같은 식으로 되어 있어서, 변경되면 파싱이 완전히 깨진다.

**변경 히스토리:**
| 날짜 | 변경 내용 |
|------|----------|
| 2025-10-16 | 아이템 컨테이너 클래스 전면 교체 |
| 2025-10-23 | 제목 링크 셀렉터 변경 |
| 2025-10-30 | 미리보기 영역 구조 변경 |
| 2025-11-06 | 추가 셀렉터 변경 |
| 2025-11-24 | 최신 셀렉터 적용 |

처음에는 변경될 때마다 클래스명을 수동으로 업데이트했다. 한 달에 2~3번은 수정해야 했다.

**해결책: data-attribute 기반 셀렉터로 전환**

[app/shared/utils/parser/selectors/index.ts](app/shared/utils/parser/selectors/index.ts#L15-L25)

```typescript
// 변경 전: 해시 클래스명 (네이버가 바꿀 때마다 수정 필요)
intentionItem: '.oIxNPKojSTvxvkjdwXVC'

// 변경 후: data-attribute 기반 (더 안정적)
intentionItem: '[data-template-id="ugcItem"]'
intentionTitle: 'a[data-heatmap-target=".link"]'
```

네이버가 클래스명은 자주 바꿔도 data-attribute는 잘 안 바꾸더라. 이 변경 이후로 셀렉터 업데이트 빈도가 확 줄었다.

---

### 2. 두 가지 HTML 레이아웃 동시 지원

네이버 검색 결과에는 두 가지 형태의 인기글 표시 방식이 있다:
- **Collection (블록형)**: 썸네일이 큰 카드 형태
- **Single Intention (리스트형)**: 일반적인 리스트 형태

같은 검색어인데도 시간대나 기기에 따라 다른 레이아웃이 나온다. 하나만 파싱하면 절반을 놓치게 된다.

[app/shared/utils/parser/popular-parser/index.ts](app/shared/utils/parser/popular-parser/index.ts#L20-L40)

```typescript
export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = loadHtml(html);
  const items: PopularItem[] = [];

  // 1. 블록형 레이아웃 파싱
  const $collectionRoots = $(SELECTORS.collectionRoot);
  $collectionRoots.each((_, root) => {
    // 블로그명, 제목, 링크 추출
  });

  // 2. 리스트형 레이아웃 파싱
  const $singleIntentionSections = $(SELECTORS.singleIntentionList);
  $singleIntentionSections.each((_, section) => {
    // 제목, 스니펫, 이미지 추출
  });

  // 중복 제거 (같은 글이 두 레이아웃에 나올 수 있음)
  const unique = new Map<string, PopularItem>();
  for (const item of items) {
    if (!unique.has(item.link)) {
      unique.set(item.link, item);
    }
  }

  return Array.from(unique.values());
};
```

**결과**: 두 레이아웃을 모두 파싱하면서도 중복은 `Map`으로 제거해서 데이터 무결성을 유지한다.

---

### 3. 제목 링크 추출 문제

네이버 HTML에서 제목 링크가 있는 위치가 일정하지 않다. 어떤 경우엔 `postTitle` 요소 자체가 `<a>` 태그고, 어떤 경우엔 `postTitleWrap`이라는 래퍼가 `<a>` 태그다.

[app/shared/utils/parser/popular-parser/index.ts](app/shared/utils/parser/popular-parser/index.ts#L55-L65)

```typescript
// 링크를 포함하는 요소 찾기 (우선순위 적용)
let postHref = '';
if ($titleWrap.length > 0 && $titleWrap.is('a')) {
  // 래퍼가 링크인 경우
  postHref = $titleWrap.attr('href')?.trim() || '';
} else if ($postTitle.is('a')) {
  // 제목 자체가 링크인 경우 (fallback)
  postHref = $postTitle.attr('href')?.trim() || '';
}
```

**이 문제를 발견한 계기**: 파싱된 데이터 중 일부만 링크가 누락되는 현상이 있었는데, 디버깅해보니 두 패턴이 혼재되어 있었다.

---

### 4. Bot 탐지 우회

네이버가 봇으로 판단하면 다른 HTML을 내려준다. 일반 브라우저처럼 보이도록 헤더를 설정해야 한다.

[app/constants/_headers.ts](app/constants/_headers.ts#L1-L20)

```typescript
export const NAVER_DESKTOP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
  'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142"',
  'sec-ch-ua-platform': '"macOS"',
  'Accept': 'text/html,application/xhtml+xml...',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
};

export const NAVER_MOBILE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0...',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"iOS"',
};
```

**용도 구분**:
- Desktop 헤더: 인기글 파싱 (데스크톱 레이아웃 기준 셀렉터 사용)
- Mobile 헤더: 블로그 크롤링 (모바일 페이지가 더 가벼움)

---

## 성능 최적화

### 1. 반복 Set 생성 제거

블로그 ID 목록에서 특정 ID가 있는지 확인하는 로직이 있다. 처음엔 호출될 때마다 Set을 새로 만들었다.

**Before:**
```typescript
// 매 호출마다 Set 생성 (비효율적)
const blogIdSet = new Set(BLOG_IDS.map((id) => id.toLowerCase()));
if (blogIdSet.has(targetId)) { /* ... */ }
```

**After:**

[app/constants/_blog-ids.ts](app/constants/_blog-ids.ts#L100-L102)

```typescript
// 상수로 한 번만 생성
export const BLOG_ID_SET = new Set(BLOG_IDS.map((id) => id.toLowerCase()));

// 사용처에서는 O(1) 룩업만
if (BLOG_ID_SET.has(targetId.toLowerCase())) { /* ... */ }
```

**효과**: Set 생성 오버헤드 제거, 블로그 ID가 200개 이상이라 체감되는 차이가 있다.

### 2. 이중 중복 제거 (블로그 크롤링)

블로그 검색 결과에서 같은 블로그의 글이 연속으로 나오는 경우가 많다. 두 단계로 중복을 제거한다.

[app/entities/naver/_blog-crawler.ts](app/entities/naver/_blog-crawler.ts#L80-L100)

```typescript
// 1단계: 링크 기준 중복 제거
const uniqueItems = items.filter(
  (item, index, self) =>
    index === self.findIndex((t) => t.link === item.link)
);

// 2단계: 같은 블로그 연속 항목 제거
const deduplicatedItems: BlogCrawlItem[] = [];
let lastBlogId = '';

for (const item of uniqueItems) {
  const currentBlogId = extractBlogIdFromUrl(item.link);
  if (currentBlogId && currentBlogId === lastBlogId) {
    continue;  // 같은 블로그면 스킵
  }
  deduplicatedItems.push(item);
  lastBlogId = currentBlogId;
}
```

**이유**: 검색 결과에서 다양한 블로그의 글을 보여주고 싶었다. 한 블로그 글이 4~5개씩 나오면 의미가 없으니까.

---

## 트러블슈팅 사례

### 1. blogName 필수 조건으로 인한 데이터 누락

**문제**: 일부 인기글이 파싱되지 않았다.

**원인**: `blogName`이 없으면 해당 항목을 건너뛰는 로직이 있었는데, 네이버가 블로그명을 표시하지 않는 경우도 있었다.

**해결** ([커밋: aea6723](https://github.com)):
```typescript
// 변경 전
if (!blogName) return null;

// 변경 후
blogName = blogName || '';  // 빈 문자열로 처리
```

### 2. URL 파싱 실패 시 조용한 에러

**문제**: 특정 링크에서 블로그 ID 추출이 안 됐다.

**원인**: URL 형식이 예상과 달라서 파싱 에러가 발생했는데, try-catch 없이 throw되면서 전체 처리가 중단됐다.

**해결** ([app/shared/utils/parser/index.ts](app/shared/utils/parser/index.ts#L5-L20)):
```typescript
export const normalizeLink = (href?: string, cru?: string): string => {
  if (cru && cru.startsWith('http')) return cru;
  if (!href) return '';

  try {
    const uParam = new URLSearchParams(href.split('?')[1] || '').get('u');
    if (uParam) return decodeURIComponent(uParam);
  } catch {
    // URL 파싱 실패해도 계속 진행
  }

  if (href.startsWith('/')) return `https://search.naver.com${href}`;
  return href;
};
```

### 3. 블로그 ID 추출 로직 중복

**문제**: 같은 `getBlogId` 함수가 3군데에 복붙되어 있었다. 버그 수정하려면 3곳을 다 고쳐야 했다.

**해결**: 공통 유틸 함수로 추출

[app/shared/utils/_blog.ts](app/shared/utils/_blog.ts#L1-L30)

```typescript
export const extractBlogIdFromUrl = (url: string): string => {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (isNaverBlogHost(parsed.hostname)) {
      const pathSegment = parsed.pathname.replace(/^\//, '').split('/')[0];
      return (pathSegment ?? '').toLowerCase();
    }
  } catch {
    // URL 파싱 실패 시 정규식으로 fallback
    const patterns = [
      /blog\.naver\.com\/([^/?&#]+)/,
      /m\.blog\.naver\.com\/([^/?&#]+)/,
      /in\.naver\.com\/([^/?&#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1].toLowerCase();
    }
  }

  return '';
};
```

**추가 이점**: 정규식 fallback으로 비정상적인 URL도 처리 가능해졌다.

---

## 아키텍처 설계 결정

### FSD (Feature-Sliced Design) 채택

**이유**: 기능별로 관련 코드를 모아두고 싶었다. `naver-popular` 기능의 컴포넌트, 훅, 스토어, 타입이 한 폴더에 있으면 찾기 쉽다.

```
features/naver-popular/
├── components/     # UI 컴포넌트 (8개)
├── hooks/          # usePopularActions, useViewerActions
├── store/          # Jotai atoms
├── lib/            # 비즈니스 로직
└── index.ts        # public API
```

**Trade-off**: 폴더 깊이가 깊어지지만, 기능 단위로 파일을 찾기 쉬워서 유지보수가 편하다.

### Jotai 선택 이유

Redux나 Zustand 대신 Jotai를 선택한 이유:
- **atomic 단위로 상태 분리**: 검색어, 결과 목록, 로딩 상태가 독립적
- **boilerplate 적음**: atom 하나 만들면 바로 사용 가능
- **React 친화적**: useSyncExternalStore 기반이라 concurrent mode와 잘 맞음

[app/features/naver-popular/store/_atoms.ts](app/features/naver-popular/store/_atoms.ts)

```typescript
export const keywordAtom = atom<string>('');
export const popularResultAtom = atom<PopularItem[]>([]);
export const isLoadingAtom = atom<boolean>(false);

// 파생 상태
export const exposedBlogsAtom = atom((get) =>
  get(popularResultAtom).filter(item =>
    BLOG_ID_SET.has(extractBlogIdFromUrl(item.blogLink ?? ''))
  )
);
```

### 에러 응답 통일

모든 API에서 같은 형식으로 에러를 반환한다. 프론트엔드에서 처리하기 편하다.

[app/shared/utils/_response.ts](app/shared/utils/_response.ts)

```typescript
export const jsonError = (message: string, status = 400) =>
  Response.json({ error: message, status }, { status });

export const jsonOk = (data: Record<string, any>, status = 200) =>
  Response.json({ ...data, status });
```

---

## 향후 개선 계획

1. **파싱 실패 자동 감지**: 결과가 0개면 Slack 알림 보내기
2. **Fallback 셀렉터 자동 시도**: 현재는 정의만 해두고 안 쓰고 있음
3. **테스트 코드 추가**: 셀렉터 변경 시 회귀 테스트 필요
4. **캐싱**: 같은 키워드 반복 검색 시 결과 캐싱

---

## 프로젝트 정보

- **기간**: 2024.11 ~ 현재
- **역할**: 1인 개발
- **GitHub**: (비공개)

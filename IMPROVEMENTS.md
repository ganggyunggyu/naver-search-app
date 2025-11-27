# 코드 개선점 분석 보고서

> 분석일: 2025-11-27
> 분석 대상: 전체 프로젝트

## 요약

- 🔴 Critical: 1건
- 🟠 High: 5건
- 🟡 Medium: 6건
- 🟢 Low: 5건

---

## 🔴 Critical Issues

### [CRIT-001] Dead Code - 빈 함수 정의

**위치**: [_blog-crawler.ts:167](app/entities/naver/_blog-crawler.ts#L167)

**문제**:
`logBlogCrawlResults` 함수가 빈 함수로 정의되어 있어 호출해도 아무 동작도 하지 않음.

**현재 코드**:
```typescript
export const logBlogCrawlResults = (_response: BlogCrawlResponse) => {};
```

**영향**:
- `api.blog-search.ts:19-21`에서 `logResults` 옵션이 `true`일 때 호출되지만 실제로 아무것도 출력하지 않음
- 사용자가 로그 기능을 기대하지만 동작하지 않아 디버깅 시 혼란 유발

**해결 방안**:
```typescript
// 옵션 1: 실제 로깅 구현
export const logBlogCrawlResults = (response: BlogCrawlResponse) => {
  console.log(`[BlogCrawl] 키워드: ${response.keyword}`);
  console.log(`[BlogCrawl] 총 ${response.total}개 결과 발견`);
  response.items.forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${item.title}`);
  });
};

// 옵션 2: 함수 및 관련 호출부 삭제
```

**검증 방법**:
```bash
# log=true 파라미터로 API 호출하여 콘솔 출력 확인
curl "http://localhost:4001/api/blog-search?q=테스트&log=true"
```

---

## 🟠 High Priority Issues

### [HIGH-001] any 타입 과다 사용

**위치**:
- [api.naver-popular.ts:24](app/routes/api.naver-popular.ts#L24)
- [naver-popular.tsx:52, 82, 113](app/routes/naver-popular.tsx#L52)
- [_usePopularActions.ts:43, 69](app/features/naver-popular/hooks/_usePopularActions.ts#L43)

**문제**:
타입 안전성을 우회하는 `any` 타입이 여러 곳에서 사용됨.

**현재 코드**:
```typescript
// api.naver-popular.ts:24
const result: any = {
  url: finalUrl,
  count: items.length,
  ...
};

// naver-popular.tsx:52
const keyword = (((params as any) || {}).keyword || '').trim();

// naver-popular.tsx:113
if ((json as any)?.error) {
```

**영향**:
- 컴파일 시 타입 에러를 잡지 못해 런타임 에러 발생 가능
- IDE 자동완성 및 리팩토링 지원 불가

**해결 방안**:
```typescript
// api.naver-popular.ts - 명시적 타입 정의
interface PopularApiResult {
  url: string;
  count: number;
  items: PopularItem[];
  status: number;
  exposures?: ExposureResult[];
  exposureCount?: number;
  blog?: BlogCrawlResponse;
  blogError?: string;
}

const result: PopularApiResult = { ... };

// naver-popular.tsx - Route 타입 활용
export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const keyword = params.keyword?.trim() ?? '';
  // ...
};
```

---

### [HIGH-002] 미사용 Import

**위치**: [api.search.ts:1](app/routes/api.search.ts#L1)

**문제**:
`extractPopularItems`가 import되었지만 파일 내에서 사용되지 않음.

**현재 코드**:
```typescript
import { extractPopularItems, fetchNaverOpenApi, jsonError } from '@/shared';
```

**영향**:
- 번들 사이즈 증가 (tree-shaking 안될 경우)
- 코드 가독성 저하

**해결 방안**:
```typescript
import { fetchNaverOpenApi, jsonError } from '@/shared';
```

---

### [HIGH-003] 미사용 함수 정의

**위치**: [_usePopularActions.ts:24-28](app/features/naver-popular/hooks/_usePopularActions.ts#L24)

**문제**:
`generateNaverUrl` 함수가 정의되고 return되지만 실제로 사용되지 않음. 또한 `parser/index.ts`의 `buildNaverSearchUrl`과 기능이 중복됨.

**현재 코드**:
```typescript
const generateNaverUrl = useCallback(
  (q: string) =>
    `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(q)}`,
  []
);
// ...
return { fetchPopular, generateNaverUrl, searchWithQuery };
```

**영향**:
- 불필요한 코드로 인한 유지보수 복잡성 증가
- 비슷한 기능의 함수가 여러 개 존재해 혼란 유발

**해결 방안**:
```typescript
// 옵션 1: 삭제
return { fetchPopular, searchWithQuery };

// 옵션 2: parser/index.ts의 buildNaverSearchUrl 사용
import { buildNaverSearchUrl } from '@/shared';
// generateNaverUrl 제거
```

---

### [HIGH-004] DESKTOP/MOBILE 헤더 동일

**위치**: [_headers.ts:1-17](app/constants/_headers.ts)

**문제**:
`NAVER_DESKTOP_HEADERS`와 `NAVER_MOBILE_HEADERS`가 완전히 동일한 내용을 가지고 있음.

**현재 코드**:
```typescript
export const NAVER_DESKTOP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...',
  'sec-ch-ua': 'Chromium";v="142", ...',
  'sec-ch-ua-platform': 'macOS',
} as const;

export const NAVER_MOBILE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...',  // 동일!
  'sec-ch-ua': 'Chromium";v="142", ...',
  'sec-ch-ua-platform': 'macOS',  // 동일!
} as const;
```

**영향**:
- 모바일 전용 크롤링이 제대로 동작하지 않을 수 있음
- 코드 중복으로 인한 유지보수 어려움

**해결 방안**:
```typescript
export const NAVER_DESKTOP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
  'sec-ch-ua-platform': '"macOS"',
} as const;

export const NAVER_MOBILE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"iOS"',
} as const;
```

---

### [HIGH-005] params 타입 불안전성

**위치**: [naver-popular.tsx:51-52](app/routes/naver-popular.tsx#L51)

**문제**:
Route params를 `any`로 캐스팅하여 타입 안전성 상실.

**현재 코드**:
```typescript
export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const keyword = (((params as any) || {}).keyword || '').trim();
```

**영향**:
- params의 타입이 보장되지 않아 런타임 에러 가능
- 리팩토링 시 타입 체크 불가

**해결 방안**:
```typescript
// React Router v7 타입 시스템 활용
export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const keyword = (params.keyword ?? '').trim();
  // 또는 routes.ts에서 params 타입 정의
};
```

---

## 🟡 Medium Priority Issues

### [MED-001] getBlogId 함수 중복

**위치**:
- [naver-popular.tsx:138-150](app/routes/naver-popular.tsx#L138)
- [_PopularResults.tsx:20-32](app/features/naver-popular/components/_PopularResults.tsx#L20)
- [_blog-crawler.ts:37-46](app/entities/naver/_blog-crawler.ts#L37)

**문제**:
동일한 로직의 `getBlogId` 함수가 3곳에 중복 정의됨.

**현재 코드**:
```typescript
// 3곳에서 거의 동일한 코드
const getBlogId = (url: string): string => {
  try {
    const u = new URL(url);
    if (
      u.hostname.includes('blog.naver.com') ||
      u.hostname.includes('m.blog.naver.com')
    ) {
      const seg = u.pathname.replace(/^\//, '').split('/')[0];
      return (seg || '').toLowerCase();
    }
  } catch {}
  return '';
};
```

**영향**:
- 버그 수정 시 3곳 모두 수정 필요
- 동작 불일치 위험

**해결 방안**:
```typescript
// app/shared/utils/_blog.ts 생성
export const extractBlogIdFromUrl = (url: string): string => {
  if (!url) return '';
  try {
    const u = new URL(url);
    const isNaverBlog =
      u.hostname.includes('blog.naver.com') ||
      u.hostname.includes('m.blog.naver.com') ||
      u.hostname.includes('in.naver.com');

    if (isNaverBlog) {
      return u.pathname.replace(/^\//, '').split('/')[0]?.toLowerCase() ?? '';
    }
  } catch {}
  return '';
};

// 기존 중복 코드를 import로 대체
import { extractBlogIdFromUrl } from '@/shared';
```

---

### [MED-002] extractBlogId와 getBlogId 함수 유사

**위치**:
- [_exposure.ts:15-30](app/shared/utils/_exposure.ts#L15)
- 위 MED-001의 getBlogId 함수들

**문제**:
`_exposure.ts`의 `extractBlogId`와 다른 파일들의 `getBlogId`가 유사한 기능을 수행하지만 약간 다른 구현.

**영향**:
- 패턴 매칭 방식 불일치로 인한 동작 차이 가능

**해결 방안**:
MED-001과 통합하여 하나의 유틸 함수로 관리.

---

### [MED-003] BLOG_IDS.map 패턴 중복

**위치**:
- [naver-popular.tsx:157](app/routes/naver-popular.tsx#L157)
- [_PopularResults.tsx:36](app/features/naver-popular/components/_PopularResults.tsx#L36)
- [_exposure.ts:37](app/shared/utils/_exposure.ts#L37)
- [naver-popular.tsx:336-337](app/routes/naver-popular.tsx#L336)

**문제**:
`BLOG_IDS.map((v) => v.toLowerCase())`가 여러 곳에서 반복됨.

**현재 코드**:
```typescript
// 여러 파일에서 반복
const allowedIds = new Set(BLOG_IDS.map((v) => v.toLowerCase()));
```

**영향**:
- 매번 새로운 Set 생성으로 불필요한 메모리/CPU 사용
- 코드 중복

**해결 방안**:
```typescript
// app/constants/_blog-ids.ts에 추가
export const BLOG_IDS = [ ... ] as const;

// 소문자 변환된 Set을 상수로 정의
export const BLOG_ID_SET = new Set(
  BLOG_IDS.map((id) => id.toLowerCase())
);

// 사용처에서
import { BLOG_ID_SET } from '@/constants';
if (BLOG_ID_SET.has(blogId)) { ... }
```

---

### [MED-004] URL 빌드 함수 중복

**위치**:
- [parser/index.ts:15-18](app/shared/utils/parser/index.ts#L15)
- [_usePopularActions.ts:24-28](app/features/naver-popular/hooks/_usePopularActions.ts#L24)

**문제**:
네이버 검색 URL을 생성하는 함수가 2곳에 존재.

**현재 코드**:
```typescript
// parser/index.ts
export const buildNaverSearchUrl = (query: string): string =>
  `https://m.search.naver.com/search.naver?where=nexearch&...`;

// _usePopularActions.ts
const generateNaverUrl = useCallback(
  (q: string) =>
    `https://search.naver.com/search.naver?where=nexearch&...`,
  []
);
```

**영향**:
- 데스크톱(`search.naver.com`) vs 모바일(`m.search.naver.com`) URL 불일치
- 유지보수 시 혼란

**해결 방안**:
```typescript
// parser/index.ts 하나로 통일
export const buildNaverSearchUrl = (query: string, mobile = true): string => {
  const baseUrl = mobile
    ? 'https://m.search.naver.com'
    : 'https://search.naver.com';
  return `${baseUrl}/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(query)}`;
};
```

---

### [MED-005] SRP 위반 - naver-popular.tsx 과도한 책임

**위치**: [naver-popular.tsx](app/routes/naver-popular.tsx) (전체)

**문제**:
하나의 페이지 컴포넌트(458줄)가 너무 많은 역할을 담당:
- 데이터 fetching
- 블로그 ID 매칭 로직
- 상태 관리
- UI 렌더링
- 토스트 알림

**영향**:
- 테스트 어려움
- 코드 이해 및 유지보수 복잡성 증가
- 재사용 불가

**해결 방안**:
```typescript
// 1. 커스텀 훅으로 데이터 fetching 분리
// hooks/_usePopularLoader.ts
export const usePopularLoader = (loaderData: LoaderData) => {
  // 기존 useEffect 로직 이동
};

// 2. 매칭 로직 분리
// hooks/_useBlogMatching.ts
export const useBlogMatching = (items: PopularItem[]) => {
  // matchedIdList 로직 이동
};

// 3. 페이지 컴포넌트 간소화
const NaverPopularPage = ({ loaderData }: Props) => {
  const { data, error, isLoading } = usePopularLoader(loaderData);
  const { matchedIdList } = useBlogMatching(data?.items);

  return (
    <Layout>
      <PopularSearchForm />
      <MatchedBlogSection matchedIdList={matchedIdList} />
      <PopularResults />
      <BlogResultList />
    </Layout>
  );
};
```

---

### [MED-006] FSD 아키텍처 위반

**위치**:
- [naver-popular.tsx:33](app/routes/naver-popular.tsx#L33)
- [_PopularResults.tsx:10](app/features/naver-popular/components/_PopularResults.tsx#L10)
- [_exposure.ts:2](app/shared/utils/_exposure.ts#L2)

**문제**:
routes와 features에서 constants를 직접 import하고 있음. FSD 아키텍처에서는 shared를 통해 re-export하는 것이 권장됨.

**현재 코드**:
```typescript
// routes에서 직접 import
import { BLOG_IDS } from '@/constants';

// features에서 직접 import
import { BLOG_IDS } from '@/constants';
```

**영향**:
- 계층 간 의존성 규칙 위반
- 리팩토링 시 수정 범위 증가

**해결 방안**:
```typescript
// app/shared/index.ts에 추가
export { BLOG_IDS, BLOG_ID_SET } from '@/constants';

// 사용처에서
import { BLOG_IDS, BLOG_ID_SET } from '@/shared';
```

---

## 🟢 Low Priority Issues

### [LOW-001] 셀렉터 설정 분산

**위치**:
- [app/constants/_selectors.ts](app/constants/_selectors.ts)
- [app/shared/utils/parser/selectors/index.ts](app/shared/utils/parser/selectors/index.ts)

**문제**:
셀렉터 관련 코드가 두 곳에 분산되어 있음.

**해결 방안**:
parser/selectors로 통합하고, constants에서 re-export하거나 역할을 명확히 문서화.

---

### [LOW-002] console.log 남용

**위치**: [_exposure.ts:42-94](app/shared/utils/_exposure.ts#L42)

**문제**:
프로덕션 코드에 디버깅용 console.log가 다수 포함.

**현재 코드**:
```typescript
console.log(`\n${'='.repeat(60)}`);
console.log(`검색어: ${query}`);
console.log(`${'='.repeat(60)}`);
// ... 더 많은 console.log
```

**해결 방안**:
```typescript
// 로깅 유틸 사용 또는 조건부 로깅
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log(...);
}

// 또는 로깅 라이브러리 도입
import { logger } from '@/shared/lib/logger';
logger.debug(`검색어: ${query}`);
```

---

### [LOW-003] 매직 넘버

**위치**:
- [_blog-crawler.ts:56](app/entities/naver/_blog-crawler.ts#L56): `display=500`
- [_blog-crawler.ts:112](app/entities/naver/_blog-crawler.ts#L112): `title.length <= 10`

**문제**:
의미가 불명확한 숫자가 하드코딩됨.

**해결 방안**:
```typescript
// 상수로 정의
const BLOG_SEARCH_CONFIG = {
  MAX_DISPLAY: 500,
  MIN_TITLE_LENGTH: 10,
} as const;

// 사용
const searchUrl = `...&display=${BLOG_SEARCH_CONFIG.MAX_DISPLAY}`;
if (title.length <= BLOG_SEARCH_CONFIG.MIN_TITLE_LENGTH) return;
```

---

### [LOW-004] 타입 불일치 - PopularItem vs ExposureResult

**위치**:
- [_types.ts:6](app/entities/naver/_types.ts#L6): `blogName?: string`
- [_exposure.ts:7](app/shared/utils/_exposure.ts#L7): `blogName: string`

**문제**:
PopularItem의 `blogName`은 optional이지만 ExposureResult는 required로 정의됨.

**해결 방안**:
```typescript
// ExposureResult도 optional로 변경
export interface ExposureResult {
  blogName?: string;  // 또는 blogName: string | undefined;
  // ...
}

// 또는 매핑 시 기본값 제공
blogName: item.blogName ?? '',
```

---

### [LOW-005] Empty catch block

**위치**:
- [_blog-crawler.ts:32-34, 44](app/entities/naver/_blog-crawler.ts#L32)
- [naver-popular.tsx:148, 364](app/routes/naver-popular.tsx#L148)

**문제**:
빈 catch 블록으로 에러가 무시됨.

**현재 코드**:
```typescript
try {
  // ...
} catch {}  // 에러 무시
```

**해결 방안**:
```typescript
// 최소한 에러 로깅
try {
  // ...
} catch (err) {
  console.warn('URL 파싱 실패:', err);
}

// 또는 의도적인 무시라면 주석 추가
try {
  // ...
} catch {
  // URL이 유효하지 않은 경우 빈 문자열 반환 (의도된 동작)
}
```

---

## 개선 로드맵

### Phase 1: 긴급 수정 (Critical + High)
1. [ ] CRIT-001: `logBlogCrawlResults` 함수 구현 또는 제거
2. [ ] HIGH-001: any 타입을 명시적 타입으로 교체
3. [ ] HIGH-002: 미사용 import `extractPopularItems` 제거
4. [ ] HIGH-003: 미사용 함수 `generateNaverUrl` 제거
5. [ ] HIGH-004: 모바일 헤더를 실제 모바일 User-Agent로 변경
6. [ ] HIGH-005: params 타입 안전하게 처리

### Phase 2: 품질 개선 (Medium)
1. [ ] MED-001, MED-002: `extractBlogIdFromUrl` 공통 유틸 생성
2. [ ] MED-003: `BLOG_ID_SET` 상수 생성 및 적용
3. [ ] MED-004: URL 빌드 함수 통합
4. [ ] MED-005: naver-popular.tsx 커스텀 훅으로 분리
5. [ ] MED-006: shared를 통한 re-export 패턴 적용

### Phase 3: 리팩토링 (Low)
1. [ ] LOW-001: 셀렉터 관련 코드 위치 정리
2. [ ] LOW-002: 로깅 시스템 도입 또는 console.log 정리
3. [ ] LOW-003: 매직 넘버 상수화
4. [ ] LOW-004: ExposureResult 타입 정리
5. [ ] LOW-005: Empty catch block 개선

---

## 참고 사항

### 분석 방법론
- 코드 구조 분석 (FSD 아키텍처 관점)
- 타입 안전성 검증
- 중복 코드 패턴 탐지
- 단일 책임 원칙(SRP) 검토
- 의존성 방향 검증

### 추가 권장 사항
1. **ESLint 규칙 강화**: `@typescript-eslint/no-explicit-any` 규칙 활성화
2. **Pre-commit Hook**: 타입 체크 및 린트 자동 실행
3. **유닛 테스트 도입**: 공통 유틸 함수에 대한 테스트 작성
4. **문서화**: 주요 유틸 함수에 JSDoc 추가

---

**분석 완료! 나는! 나는..! 코드를..!! 분석했다!!** 🎯

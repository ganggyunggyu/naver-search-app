# 네이버 검색 결과 파싱 및 인기글/스마트블로그 구분 알고리즘

## 문서 정보

- **작성일**: 2025-11-07
- **HTML 구조 기준일**: 2025-11-06
- **목적**: 네이버 검색 결과에서 인기글 섹션을 파싱하고, 인기글과 스마트블로그를 정확히 구분하는 방법론 정립

---

## 1. 개요

### 1.1 배경

네이버 검색 결과 페이지는 사용자의 검색 의도에 따라 다양한 형태의 인기 콘텐츠를 제공한다. 이러한 콘텐츠는 크게 두 가지 유형으로 분류된다:

1. **인기글 (Popular Posts)**: 특정 검색어와 직접적으로 관련된 인기 게시글들
2. **스마트블로그 (Smart Blog)**: 검색어와 간접적으로 관련된 다양한 주제의 인기 게시글들

이 두 유형을 정확히 구분하는 것은 검색 결과 분석, SEO 모니터링, 콘텐츠 트렌드 파악 등에 필수적이다.

### 1.2 핵심 개념

네이버 검색 결과는 다음과 같은 계층 구조를 가진다:

```
검색 결과 페이지
└── 인기글 섹션 (Section) [1개 이상]
    ├── 카테고리명 (Category Name)
    └── 아이템 (Items) [1개 이상]
        ├── 제목
        ├── 블로그명
        ├── 링크
        └── 기타 메타데이터
```

**핵심 원리**:
- 각 섹션은 하나의 카테고리명을 가진다
- 같은 섹션 내의 모든 아이템은 동일한 카테고리명을 공유한다
- 카테고리명의 고유 개수로 인기글과 스마트블로그를 구분한다

---

## 2. HTML 구조 분석

### 2.1 섹션 컨테이너

네이버는 인기글 섹션을 `.fds-ugc-single-intention-item-list` 클래스로 식별한다.

```html
<div class="fds-ugc-single-intention-item-list">
  <!-- 인기글 아이템들 -->
</div>
```

**중요**: 하나의 검색 결과 페이지에 여러 개의 섹션이 존재할 수 있다.

### 2.2 카테고리명 위치

카테고리명은 섹션의 상위 컨테이너에 위치한다:

```html
<div class="sds-comps-vertical-layout">
  <span class="sds-comps-text-type-headline1">
    {카테고리명}
  </span>
  <div class="fds-ugc-single-intention-item-list">
    <!-- 아이템들 -->
  </div>
</div>
```

### 2.3 아이템 구조

각 아이템은 다음과 같은 구조를 가진다:

```html
<div class="NtKCZYlcjvHdeUoASy2I">
  <!-- 블로그 프로필 -->
  <div class="sds-comps-profile">
    <a href="https://blog.naver.com/{블로그ID}">
      <span class="sds-comps-profile-info-title-text">블로그명</span>
    </a>
  </div>

  <!-- 게시글 제목 -->
  <a href="{게시글URL}" class="z1n21OFoYx6_tGcWKL_x">
    <span class="sds-comps-text-type-headline1 sds-comps-text-weight-sm">
      게시글 제목
    </span>
  </a>

  <!-- 본문 미리보기 -->
  <div class="SmWZLIw6L2_IfCQ2ljbA">
    <a href="{게시글URL}" class="d69hemU4DtemeWuXiq5g">
      <span class="sds-comps-text-type-body1">
        본문 미리보기 텍스트
      </span>
    </a>
  </div>

  <!-- 썸네일 이미지 -->
  <img src="{이미지URL}" class="sds-comps-image">
</div>
```

---

## 3. 인기글과 스마트블로그의 차이

### 3.1 정의

**인기글 (Popular Posts)**
- 하나의 통일된 주제로 구성된 인기 게시글 목록
- 모든 아이템이 동일한 카테고리명을 공유
- 검색어와 직접적으로 관련됨

**스마트블로그 (Smart Blog)**
- 여러 개의 서로 다른 주제로 구성된 인기 게시글 목록
- 아이템들이 서로 다른 카테고리명을 가짐
- 검색어와 간접적으로 관련된 다양한 주제 제공

### 3.2 실제 데이터 비교

#### 케이스 1: 인기글 (검색어: "알파CD")

**섹션 구성**:
```
섹션 1
├── 카테고리명: "알파CD 시작"
└── 아이템 4개
```

**파싱 결과**:
```json
{
  "count": 4,
  "items": [
    { "group": "알파CD 시작", "title": "알파CD 효능 후기", ... },
    { "group": "알파CD 시작", "title": "알파CD 부작용 정보", ... },
    { "group": "알파CD 시작", "title": "알파CD 체중 감량", ... },
    { "group": "알파CD 시작", "title": "알파CD 섭취 방법", ... }
  ]
}
```

**분석**:
- 고유한 카테고리명: 1개 ("알파CD 시작")
- 모든 아이템이 동일한 주제로 그룹화
- 결론: **인기글**

#### 케이스 2: 스마트블로그 (검색어: "김포공항주차대행")

**섹션 구성**:
```
섹션 1
├── 카테고리명: "김포공항 주차대행 비용"
└── 아이템 2개

섹션 2
├── 카테고리명: "김포공항공식주차대행"
└── 아이템 2개

섹션 3
├── 카테고리명: "김포공항 주차대행 내돈내산"
└── 아이템 2개
```

**파싱 결과**:
```json
{
  "count": 6,
  "items": [
    { "group": "김포공항 주차대행 비용", "title": "공항 주차 비용 후기", ... },
    { "group": "김포공항 주차대행 비용", "title": "주차대행 비용 비교", ... },
    { "group": "김포공항공식주차대행", "title": "공식 주차대행 예약", ... },
    { "group": "김포공항공식주차대행", "title": "공식 주차장 이용", ... },
    { "group": "김포공항 주차대행 내돈내산", "title": "주차대행 내돈내산", ... },
    { "group": "김포공항 주차대행 내돈내산", "title": "실제 이용 후기", ... }
  ]
}
```

**분석**:
- 고유한 카테고리명: 3개
  1. "김포공항 주차대행 비용"
  2. "김포공항공식주차대행"
  3. "김포공항 주차대행 내돈내산"
- 아이템들이 서로 다른 주제로 그룹화
- 각 카테고리명이 하나의 "인기 주제"를 나타냄
- 결론: **스마트블로그**

---

## 4. 파싱 알고리즘

### 4.1 전체 프로세스

```
1. HTML 로드
   ↓
2. 모든 인기글 섹션 찾기 (.fds-ugc-single-intention-item-list)
   ↓
3. 각 섹션마다 반복:
   3-1. 해당 섹션의 카테고리명 추출
   3-2. 섹션 내 모든 아이템 파싱
   3-3. 각 아이템에 카테고리명 할당 (group 필드)
   ↓
4. 모든 아이템 수집 완료
   ↓
5. 고유한 카테고리명 개수 확인
   ↓
6. 구분 로직 적용:
   - 고유 카테고리명 = 1개 → 인기글
   - 고유 카테고리명 ≥ 2개 → 스마트블로그
```

### 4.2 카테고리명 추출 전략

카테고리명은 다음 우선순위로 추출한다:

**우선순위 1**: 상위 컨테이너에서 헤더 찾기

```typescript
const $headerInParent = $section
  .closest('.sds-comps-vertical-layout')
  .find('.sds-comps-text-type-headline1')
  .first();

if ($headerInParent.length && $headerInParent.text().trim()) {
  categoryName = $headerInParent.text().trim();
}
```

**우선순위 2**: 형제 요소에서 헤더 찾기

```typescript
if (!categoryName) {
  const $headerInSibling = $section
    .parent()
    .find('.sds-comps-text-type-headline1')
    .first();

  if ($headerInSibling.length && $headerInSibling.text().trim()) {
    categoryName = $headerInSibling.text().trim();
  }
}
```

**우선순위 3**: 전체 스캔 (Fallback)

```typescript
if (!categoryName) {
  $('span').each((_, span) => {
    const spanText = $(span).text().trim();
    if (spanText.includes('인기글') && spanText.length > 3) {
      categoryName = spanText;
      return false; // break
    }
  });
}
```

**기본값**:

```typescript
if (!categoryName) {
  categoryName = '인기글';
}
```

### 4.3 섹션별 순회의 중요성

**잘못된 방법**:
```typescript
// 모든 아이템을 한 번에 찾아서 처리
const $allItems = $('.NtKCZYlcjvHdeUoASy2I');
$allItems.each((_, item) => {
  // 카테고리명을 어떻게 할당할 것인가?
  // 섹션 정보가 없으므로 정확한 할당 불가능
});
```

**올바른 방법**:
```typescript
// 섹션별로 순회하면서 처리
$('.fds-ugc-single-intention-item-list').each((_, section) => {
  const $section = $(section);

  // 1. 이 섹션의 카테고리명 추출
  const categoryName = extractCategoryName($section);

  // 2. 이 섹션 내의 아이템들 처리
  $section.find('.NtKCZYlcjvHdeUoASy2I').each((_, item) => {
    // 모든 아이템에 동일한 categoryName 할당
    items.push({
      // ...
      group: categoryName, // 섹션별로 통일된 카테고리명
      // ...
    });
  });
});
```

---

## 5. 구분 알고리즘 상세

### 5.1 알고리즘 로직

```typescript
interface PopularItem {
  title: string;
  link: string;
  snippet: string;
  image: string;
  badge: string;
  group: string;      // 카테고리명
  blogLink: string;
  blogName: string;
}

function classifyPopularType(items: PopularItem[]): 'popular' | 'smart-blog' {
  // 1. 모든 아이템의 카테고리명 수집
  const groups = items.map(item => item.group);

  // 2. 중복 제거하여 고유한 카테고리명만 추출
  const uniqueGroups = new Set(groups);

  // 3. 고유한 카테고리명의 개수로 판단
  if (uniqueGroups.size === 1) {
    return 'popular';      // 인기글
  } else {
    return 'smart-blog';   // 스마트블로그
  }
}
```

### 5.2 수학적 표현

```
N = 전체 아이템 개수
G = 각 아이템의 카테고리명 집합
U = G의 고유 원소 개수

분류 규칙:
  U = 1 → 인기글
  U ≥ 2 → 스마트블로그
```

### 5.3 결정 트리

```
파싱된 아이템 목록
    |
    ↓
고유 카테고리명 추출
    |
    ↓
카테고리명 개수 확인
    |
    ├─→ 1개 → [인기글]
    |         - 단일 주제
    |         - 통일된 카테고리
    |
    └─→ 2개 이상 → [스마트블로그]
                   - 다양한 주제
                   - 각 카테고리가 인기 주제
```

---

## 6. 구현 코드

### 6.1 전체 파싱 함수

```typescript
import * as cheerio from 'cheerio';

interface PopularItem {
  title: string;
  link: string;
  snippet: string;
  image: string;
  badge: string;
  group: string;
  blogLink: string;
  blogName: string;
}

export function extractPopularItems(html: string): PopularItem[] {
  const $ = cheerio.load(html);
  const items: PopularItem[] = [];

  // 모든 인기글 섹션 찾기
  const $popularSections = $('.fds-ugc-single-intention-item-list');

  // 각 섹션마다 처리
  $popularSections.each((sectionIndex, section) => {
    const $section = $(section);

    // 1. 카테고리명 추출
    let categoryName = '';

    // 우선순위 1: 상위 컨테이너
    const $headerInParent = $section
      .closest('.sds-comps-vertical-layout')
      .find('.sds-comps-text-type-headline1')
      .first();

    if ($headerInParent.length && $headerInParent.text().trim()) {
      categoryName = $headerInParent.text().trim();
    }

    // 우선순위 2: 형제 요소
    if (!categoryName) {
      const $headerInSibling = $section
        .parent()
        .find('.sds-comps-text-type-headline1')
        .first();

      if ($headerInSibling.length && $headerInSibling.text().trim()) {
        categoryName = $headerInSibling.text().trim();
      }
    }

    // 우선순위 3: Fallback
    if (!categoryName) {
      $('span').each((_, span) => {
        const spanText = $(span).text().trim();
        if (spanText.includes('인기글') && spanText.length > 3) {
          categoryName = spanText;
          return false;
        }
      });
    }

    // 기본값
    if (!categoryName) {
      categoryName = '인기글';
    }

    // 2. 이 섹션의 모든 아이템 파싱
    const $popularItems = $section.find('.NtKCZYlcjvHdeUoASy2I');

    $popularItems.each((itemIndex, item) => {
      const $item = $(item);

      // 제목 추출
      const $titleLink = $item.find('.z1n21OFoYx6_tGcWKL_x').first();
      const title = $item
        .find('.sds-comps-text-type-headline1.sds-comps-text-weight-sm')
        .text()
        .trim();
      const postHref = $titleLink.attr('href')?.trim() || '';

      // 본문 미리보기
      const snippet = $item
        .find('.d69hemU4DtemeWuXiq5g .sds-comps-text-type-body1')
        .first()
        .text()
        .trim();

      // 블로그 정보
      const $sourceLink = $item
        .find('.sds-comps-profile-info-title-text a')
        .first();
      const blogName = $sourceLink.text().trim();
      const blogHref = $sourceLink.attr('href')?.trim() || '';

      // 썸네일
      const image = $item
        .find('.sds-comps-image img')
        .first()
        .attr('src')
        ?.trim() || '';

      // 유효성 검사 및 아이템 추가
      if (
        postHref &&
        title &&
        !postHref.includes('cafe.naver.com') &&
        !postHref.includes('ader.naver.com')
      ) {
        items.push({
          title,
          link: postHref,
          snippet,
          image,
          badge: '',
          group: categoryName,  // 섹션의 카테고리명 할당
          blogLink: blogHref,
          blogName,
        });
      }
    });
  });

  // 중복 제거 (link 기준)
  const unique = new Map<string, PopularItem>();
  for (const item of items) {
    if (!unique.has(item.link)) {
      unique.set(item.link, item);
    }
  }

  return Array.from(unique.values());
}
```

### 6.2 구분 및 매칭 함수

```typescript
interface ExposureResult {
  query: string;
  blogId: string;
  blogName: string;
  postTitle: string;
  postLink: string;
  exposureType: 'popular' | 'smart-blog';
  topicName: string;
  position: number;
}

export function matchBlogs(
  query: string,
  items: PopularItem[],
  allowedBlogIds: Set<string>
): ExposureResult[] {
  const results: ExposureResult[] = [];

  // 고유한 카테고리명 추출
  const uniqueGroups = new Set(items.map(item => item.group));

  // 인기글 vs 스마트블로그 판단
  const isPopular = uniqueGroups.size === 1;
  const exposureType = isPopular ? 'popular' : 'smart-blog';

  // 각 아이템 처리
  items.forEach((item, index) => {
    const blogId = extractBlogId(item.blogLink);

    // 허용된 블로그 ID인 경우만 처리
    if (blogId && allowedBlogIds.has(blogId.toLowerCase())) {
      results.push({
        query,
        blogId,
        blogName: item.blogName,
        postTitle: item.title,
        postLink: item.link,
        exposureType,
        topicName: isPopular ? '' : item.group,  // 스마트블로그인 경우 주제명 포함
        position: index + 1,
      });
    }
  });

  return results;
}

function extractBlogId(blogUrl: string): string {
  try {
    const url = new URL(blogUrl);
    if (url.hostname.includes('blog.naver.com')) {
      const segments = url.pathname.replace(/^\//, '').split('/');
      return segments[0] || '';
    }
  } catch (error) {
    // URL 파싱 실패
  }
  return '';
}
```

---

## 7. 테스트 케이스

### 7.1 테스트 데이터

#### 테스트 케이스 1: 인기글

**입력**:
```typescript
const items = [
  { group: "알파CD 시작", title: "제목1", ... },
  { group: "알파CD 시작", title: "제목2", ... },
  { group: "알파CD 시작", title: "제목3", ... },
  { group: "알파CD 시작", title: "제목4", ... }
];
```

**처리**:
```typescript
const uniqueGroups = new Set(items.map(item => item.group));
// uniqueGroups = Set { "알파CD 시작" }
// uniqueGroups.size = 1
```

**예상 결과**:
```typescript
{
  exposureType: 'popular',
  uniqueGroupCount: 1,
  groups: ["알파CD 시작"]
}
```

#### 테스트 케이스 2: 스마트블로그

**입력**:
```typescript
const items = [
  { group: "김포공항 주차대행 비용", title: "제목1", ... },
  { group: "김포공항 주차대행 비용", title: "제목2", ... },
  { group: "김포공항공식주차대행", title: "제목3", ... },
  { group: "김포공항공식주차대행", title: "제목4", ... },
  { group: "김포공항 주차대행 내돈내산", title: "제목5", ... },
  { group: "김포공항 주차대행 내돈내산", title: "제목6", ... }
];
```

**처리**:
```typescript
const uniqueGroups = new Set(items.map(item => item.group));
// uniqueGroups = Set {
//   "김포공항 주차대행 비용",
//   "김포공항공식주차대행",
//   "김포공항 주차대행 내돈내산"
// }
// uniqueGroups.size = 3
```

**예상 결과**:
```typescript
{
  exposureType: 'smart-blog',
  uniqueGroupCount: 3,
  groups: [
    "김포공항 주차대행 비용",
    "김포공항공식주차대행",
    "김포공항 주차대행 내돈내산"
  ]
}
```

### 7.2 검증 방법

```typescript
function validateClassification(items: PopularItem[]): boolean {
  const uniqueGroups = new Set(items.map(item => item.group));
  const classification = uniqueGroups.size === 1 ? 'popular' : 'smart-blog';

  console.log('검증 정보:');
  console.log(`- 전체 아이템 수: ${items.length}`);
  console.log(`- 고유 카테고리 수: ${uniqueGroups.size}`);
  console.log(`- 카테고리 목록: ${JSON.stringify([...uniqueGroups])}`);
  console.log(`- 분류 결과: ${classification}`);

  // 추가 검증: 각 카테고리별 아이템 수 확인
  uniqueGroups.forEach(group => {
    const count = items.filter(item => item.group === group).length;
    console.log(`  - "${group}": ${count}개`);
  });

  return true;
}
```

---

## 8. 주의사항 및 예외 처리

### 8.1 HTML 구조 변경

네이버는 주기적으로 HTML 구조를 변경한다. 셀렉터가 작동하지 않을 경우:

1. 브라우저 개발자 도구로 현재 HTML 구조 확인
2. 변경된 클래스명 식별
3. 셀렉터 업데이트
4. 테스트 후 배포

### 8.2 카테고리명 추출 실패

카테고리명을 찾지 못한 경우 기본값 "인기글"이 할당된다. 이 경우:

```typescript
// 모든 아이템이 "인기글"로 그룹화됨
// uniqueGroups.size = 1
// → 인기글로 분류됨
```

실제로는 스마트블로그일 수 있으므로, 로그를 통해 이러한 케이스를 모니터링해야 한다.

### 8.3 엣지 케이스

**케이스 1**: 아이템이 0개인 경우
```typescript
if (items.length === 0) {
  return {
    exposureType: null,
    message: '파싱된 아이템 없음'
  };
}
```

**케이스 2**: 빈 카테고리명
```typescript
// 빈 문자열이나 공백은 유효하지 않은 카테고리명
if (!categoryName || categoryName.trim() === '') {
  categoryName = '인기글'; // 기본값 적용
}
```

**케이스 3**: 카페/광고 링크 필터링
```typescript
// 유효하지 않은 링크는 파싱 단계에서 제외
if (
  !postHref.includes('cafe.naver.com') &&
  !postHref.includes('ader.naver.com')
) {
  // 유효한 아이템만 추가
  items.push(item);
}
```

### 8.4 성능 고려사항

**중복 제거 최적화**:
```typescript
// Map 사용으로 O(n) 시간 복잡도
const unique = new Map<string, PopularItem>();
for (const item of items) {
  if (!unique.has(item.link)) {
    unique.set(item.link, item);
  }
}
return Array.from(unique.values());
```

**메모리 사용**:
- Cheerio는 전체 HTML을 메모리에 로드
- 대용량 HTML 처리 시 메모리 사용량 모니터링 필요

---

## 9. 셀렉터 참조표

### 9.1 주요 셀렉터 (2025-11-06 기준)

| 역할 | 셀렉터 | 설명 |
|------|--------|------|
| 섹션 컨테이너 | `.fds-ugc-single-intention-item-list` | 인기글 섹션을 감싸는 최상위 컨테이너 |
| 카테고리 헤더 | `.sds-comps-text-type-headline1` | 섹션의 카테고리명을 포함하는 헤더 |
| 레이아웃 컨테이너 | `.sds-comps-vertical-layout` | 섹션과 헤더를 포함하는 레이아웃 |
| 아이템 컨테이너 | `.NtKCZYlcjvHdeUoASy2I` | 개별 인기글 아이템 |
| 제목 링크 | `.z1n21OFoYx6_tGcWKL_x` | 게시글 제목 링크 요소 |
| 제목 텍스트 | `.sds-comps-text-type-headline1.sds-comps-text-weight-sm` | 실제 제목 텍스트 |
| 미리보기 컨테이너 | `.d69hemU4DtemeWuXiq5g` | 본문 미리보기를 감싸는 컨테이너 |
| 미리보기 텍스트 | `.sds-comps-text-type-body1` | 본문 미리보기 텍스트 |
| 블로그 프로필 | `.sds-comps-profile-info-title-text a` | 블로그명과 링크 |
| 썸네일 이미지 | `.sds-comps-image img` | 게시글 썸네일 이미지 |

### 9.2 Fallback 전략

셀렉터가 작동하지 않을 경우를 대비한 대체 전략:

1. **카테고리 헤더**:
   - 1순위: `.sds-comps-vertical-layout > .sds-comps-text-type-headline1`
   - 2순위: 부모/형제 요소에서 `.sds-comps-text-type-headline1` 검색
   - 3순위: "인기글" 키워드를 포함하는 모든 span 검색
   - 기본값: "인기글"

2. **아이템 요소**:
   - 1순위: `.NtKCZYlcjvHdeUoASy2I`
   - 2순위: 레거시 셀렉터 (`.bx`, `.detail_box` 등)

---

## 10. 출력 형식

### 10.1 JSON 출력

```json
{
  "query": "김포공항주차대행",
  "totalCount": 6,
  "exposureType": "smart-blog",
  "uniqueGroups": [
    "김포공항 주차대행 비용",
    "김포공항공식주차대행",
    "김포공항 주차대행 내돈내산"
  ],
  "items": [
    {
      "title": "김포공항 공식 주차대행 비용 최저가 할인 후기",
      "link": "https://blog.naver.com/binyyeri/224062738148",
      "group": "김포공항 주차대행 비용",
      "blogName": "제주비야",
      "blogLink": "https://blog.naver.com/binyyeri"
    }
  ],
  "matches": [
    {
      "query": "김포공항주차대행",
      "blogId": "binyyeri",
      "blogName": "제주비야",
      "postTitle": "김포공항 공식 주차대행 비용 최저가 할인 후기",
      "postLink": "https://blog.naver.com/binyyeri/224062738148",
      "exposureType": "smart-blog",
      "topicName": "김포공항 주차대행 비용",
      "position": 1
    }
  ]
}
```

### 10.2 CSV 출력

```csv
검색어,블로그ID,블로그명,게시글제목,게시글링크,노출타입,주제명,순위
"김포공항주차대행",binyyeri,"제주비야","김포공항 공식 주차대행 비용 최저가 할인 후기",https://blog.naver.com/binyyeri/224062738148,smart-blog,"김포공항 주차대행 비용",1
"김포공항주차대행",ikiss8,"and daily,","김포공항 공식 주차대행 비용 요금 할인 후기",https://blog.naver.com/ikiss8/224067384659,smart-blog,"김포공항 주차대행 비용",2
```

**CSV 생성 시 주의사항**:
- UTF-8 BOM 추가 (Excel 한글 깨짐 방지)
- 큰따옴표 이스케이프 처리
- 줄바꿈 문자 처리

---

## 11. 실전 적용 예시

### 11.1 단일 검색어 처리

```typescript
async function processSingleQuery(query: string): Promise<ExposureResult[]> {
  // 1. HTML 크롤링
  const url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url, HEADERS);

  // 2. 파싱
  const items = extractPopularItems(html);

  // 3. 분석
  const uniqueGroups = new Set(items.map(item => item.group));
  const exposureType = uniqueGroups.size === 1 ? 'popular' : 'smart-blog';

  console.log(`검색어: ${query}`);
  console.log(`전체 아이템: ${items.length}개`);
  console.log(`고유 카테고리: ${uniqueGroups.size}개`);
  console.log(`분류: ${exposureType}`);

  if (exposureType === 'smart-blog') {
    console.log('인기 주제:');
    uniqueGroups.forEach((group, idx) => {
      const count = items.filter(item => item.group === group).length;
      console.log(`  ${idx + 1}. "${group}" (${count}개)`);
    });
  }

  // 4. 매칭
  const allowedBlogIds = new Set(BLOG_IDS);
  const results = matchBlogs(query, items, allowedBlogIds);

  return results;
}
```

### 11.2 배치 처리

```typescript
async function processBatchQueries(queries: string[]): Promise<Map<string, ExposureResult[]>> {
  const allResults = new Map<string, ExposureResult[]>();

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`\n[${i + 1}/${queries.length}] "${query}" 처리 중...`);

    try {
      const results = await processSingleQuery(query);
      allResults.set(query, results);

      // Rate limiting
      if (i < queries.length - 1) {
        await delay(2000); // 2초 대기
      }
    } catch (error) {
      console.error(`"${query}" 처리 실패:`, error);
      allResults.set(query, []);
    }
  }

  return allResults;
}
```

---

## 12. 결론

### 12.1 핵심 요약

1. **섹션별 순회가 필수**: 각 섹션의 카테고리명을 정확히 추출하기 위해 섹션 단위로 반복 처리
2. **카테고리명이 핵심**: 아이템의 `group` 필드에 저장되는 카테고리명으로 구분
3. **고유 개수로 판단**: `Set`을 사용하여 고유한 카테고리명 개수를 계산하고 분류
4. **단순하고 명확한 규칙**:
   - 고유 카테고리 1개 = 인기글
   - 고유 카테고리 2개 이상 = 스마트블로그

### 12.2 장점

- **간단한 알고리즘**: 복잡한 휴리스틱 없이 명확한 규칙 적용
- **확장 가능**: 새로운 HTML 구조에도 셀렉터만 업데이트하면 적용 가능
- **정확도**: 네이버의 실제 데이터 구조를 기반으로 한 명확한 구분

### 12.3 제한사항

- HTML 구조 변경 시 셀렉터 업데이트 필요
- 카테고리명 추출 실패 시 오분류 가능성
- 네이버의 내부 로직 변경 시 재검증 필요

### 12.4 향후 개선사항

1. 셀렉터 변경 감지 자동화
2. 다양한 검색어 패턴에 대한 테스트 케이스 확대
3. 카테고리명 추출 실패 케이스 모니터링 및 개선
4. 성능 최적화 (대용량 처리)

---

## 참고 문서

- 네이버 검색 API 공식 문서
- Cheerio 공식 문서: https://cheerio.js.org/
- TypeScript 공식 문서: https://www.typescriptlang.org/

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-07
**작성자**: Development Team

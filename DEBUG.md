# 파싱 로직 디버그 분석

## 분석 일시
2025-11-07

## 개요
현재 `extractPopularItems` 함수의 구현이 문서(NAVER_POPULAR_PARSING_GUIDE.md)에 명시된 원칙을 위반하고 있어, 인기글/스마트블로그 구분이 제대로 작동하지 않을 가능성이 높습니다.

---

## 핵심 원칙 (문서 기준)

1. **섹션별 순회**: `.fds-ugc-single-intention-item-list` 섹션을 순회
2. **섹션 레벨 카테고리명 추출**: 각 섹션마다 하나의 카테고리명을 추출
3. **통일된 할당**: 같은 섹션 내 모든 아이템은 동일한 카테고리명(group)을 가져야 함
4. **고유 개수로 구분**: 고유 group 개수로 인기글(1개) vs 스블(2개 이상) 구분

---

## 문제점 분석

### 문제 1: 아이템별 카테고리명 추출 (치명적)

**현재 코드 (잘못됨)**:
```typescript
$popularItems.each((_, item) => {
  const $item = $(item);

  // ... 제목, 링크 등 추출 ...

  const groupLabel = findGroupLabelNear($, $item);  // ❌ 각 아이템마다 호출

  items.push({
    // ...
    group: groupLabel || categoryName,  // ❌ 아이템마다 다른 값 가능
    // ...
  });
});
```

**문제점**:
- `findGroupLabelNear($, $item)`를 **각 아이템마다** 호출
- 같은 섹션 내에서도 아이템마다 **다른 group 값**을 가질 수 있음
- 이로 인해 고유 group 개수 계산이 부정확해짐

**예시 (잘못된 결과)**:
```
섹션 1: "알파CD 시작"
  - 아이템 1: group = "알파CD 시작"
  - 아이템 2: group = ""  (findGroupLabelNear 실패)
  - 아이템 3: group = "알파CD 시작"
  - 아이템 4: group = ""  (findGroupLabelNear 실패)

→ 고유 group: 2개 ("알파CD 시작", "")
→ 잘못된 구분: 스블로 분류됨 (실제로는 인기글)
```

**올바른 방법**:
```typescript
// 섹션 레벨에서 한 번만 추출
let categoryName = '';
// ... 카테고리명 추출 로직 ...

console.log(`인기글: ${categoryName}`);  // 섹션당 한 번

$popularItems.each((_, item) => {
  // ...
  items.push({
    // ...
    group: categoryName,  // ✅ 모든 아이템이 동일한 값
    // ...
  });
});
```

---

### 문제 2: findGroupLabelNear 함수의 부적절한 사용

**현재 코드**:
```typescript
const findGroupLabelNear = (
  $: CheerioAPI,
  $el: cheerio.Cheerio<any>  // 아이템 요소를 받음
): string => {
  // 아이템 요소로부터 상위로 올라가며 카테고리명 찾기
  let group = '';

  const $closestLayout = $el.closest('.sds-comps-base-layout...');
  // ...

  console.log(group);  // ❌ 각 아이템마다 출력
  return group || '인기글';
};
```

**문제점**:
1. **설계 자체가 잘못됨**: 아이템 요소(`$el`)로부터 카테고리명을 찾으려 시도
   - 문서에 따르면 카테고리명은 **섹션의 상위 컨테이너**에 위치
   - 아이템 레벨에서 찾는 것은 비효율적이고 부정확

2. **로그 위치 문제**: 각 아이템마다 `console.log(group)` 실행
   - 문서에서는 섹션당 한 번만 출력되어야 함
   - 로그가 과도하게 많고 혼란스러움

3. **반환값 불확실성**: 같은 섹션 내 아이템이라도 다른 값을 반환할 수 있음
   - DOM 구조에 따라 어떤 아이템은 찾고 어떤 아이템은 못 찾을 수 있음

**올바른 방법**:
```typescript
// 섹션 레벨에서 추출 (아이템 레벨이 아님)
$popularSections.each((_, section) => {
  const $section = $(section);

  // 1. 이 섹션의 카테고리명 추출
  let categoryName = '';

  const $headerInParent = $section
    .closest('.sds-comps-vertical-layout')
    .find('.sds-comps-text-type-headline1')
    .first();

  if ($headerInParent.length && $headerInParent.text().trim()) {
    categoryName = $headerInParent.text().trim();
  }

  // 기본값
  if (!categoryName) {
    categoryName = '인기글';
  }

  console.log(`인기글: ${categoryName}`);  // ✅ 섹션당 한 번

  // 2. 이 섹션의 모든 아이템에 동일하게 할당
  $section.find('.NtKCZYlcjvHdeUoASy2I').each((_, item) => {
    items.push({
      // ...
      group: categoryName,  // ✅ 모든 아이템 동일
    });
  });
});
```

---

### 문제 3: 중복된 파싱 로직

**현재 코드**:
```typescript
// 파싱 1: 표준 섹션 (.fds-ugc-single-intention-item-list)
$popularSections.each((sectionIdx, section) => {
  // ... 파싱 ...
});

// 파싱 2: 대체 블록 (.sds-comps-base-layout...)
$alternativeBlocks.each((blockIdx, block) => {
  // ... findGroupLabelNear 사용 ...
});

// 파싱 3: 레거시 블록 (.bx)
$legacyBlocks.each((_, block) => {
  // ... 파싱 ...
});
```

**문제점**:
1. **세 가지 다른 방식**으로 파싱
   - 각각 다른 로직, 다른 group 할당 방식
   - 일관성 없음

2. **중복 가능성**:
   - 같은 아이템이 여러 파싱 로직에서 추출될 수 있음
   - 각각 다른 group 값을 가질 수 있음
   - 중복 제거 로직(`unique.has(item.link)`)이 있지만, 먼저 추가된 것만 유지하므로 group 값이 부정확할 수 있음

3. **목적 불명확**:
   - 왜 세 가지 방식이 필요한지 불분명
   - 문서에서는 `.fds-ugc-single-intention-item-list` 섹션 파싱만 설명
   - 대체 블록과 레거시 블록은 언제 사용되는지 명확하지 않음

**권장 사항**:
- **표준 섹션 파싱만 사용** (`.fds-ugc-single-intention-item-list`)
- HTML 구조가 변경된 경우에만 대체 로직 추가
- 각 파싱 로직이 필요한 이유를 명확히 문서화

---

### 문제 4: 콘솔 로그 과다

**현재 코드**:
```typescript
// findGroupLabelNear 내부
console.log(group);  // 각 아이템마다 출력

// extractPopularItems 내부
console.log('\n📦 파싱 시작...\n');
console.log(`섹션 ${sectionIdx + 1}: "${categoryName}"`);
console.log(`  → 아이템 ${$popularItems.length}개 발견`);

// 대체 블록 파싱 내부
console.log(headline);
console.log(`    - 블로그명: "${blogName}"`);
console.log(`    - 블로그링크: "${blogHref}"`);
console.log(`    - 제목: "${title}"`);
console.log(`    - 포스트링크: "${postHref}"`);

console.log(`\n✅ 총 ${items.length}개 아이템 파싱 완료\n`);
```

**문제점**:
- 과도하게 많은 로그 출력
- 디버그 정보와 일반 정보가 혼재
- 프로덕션 환경에서 성능 저하 가능

**권장 사항**:
```typescript
// 디버그 플래그 사용
const DEBUG = process.env.DEBUG_PARSING === 'true';

if (DEBUG) {
  console.log(`섹션 ${sectionIdx + 1}: "${categoryName}"`);
}

// 중요한 로그만 유지
console.log(`인기글: ${categoryName}`);  // 문서에 명시된 로그
```

---

## 예상되는 버그 시나리오

### 시나리오 1: 인기글이 스블로 잘못 분류

**상황**:
- 검색어: "알파CD"
- 실제: 인기글 (섹션 1개, 카테고리 "알파CD 시작")

**현재 코드 실행 결과**:
```
파싱된 아이템:
- 아이템 1: group = "알파CD 시작" (findGroupLabelNear 성공)
- 아이템 2: group = ""           (findGroupLabelNear 실패)
- 아이템 3: group = "알파CD 시작" (findGroupLabelNear 성공)
- 아이템 4: group = ""           (findGroupLabelNear 실패)

고유 group: 2개 ("알파CD 시작", "")
구분 결과: 스블 ❌ (실제로는 인기글)
```

### 시나리오 2: 중복 파싱으로 인한 혼란

**상황**:
- 같은 아이템이 표준 섹션과 대체 블록에서 모두 파싱됨

**현재 코드 실행 결과**:
```
파싱 1 (표준 섹션):
- 아이템 A: group = "주제 1"

파싱 2 (대체 블록):
- 아이템 A: group = "주제 2" (다른 group 값)

중복 제거 후:
- 아이템 A: group = "주제 1" (먼저 추가된 것 유지)
  하지만 "주제 2"도 유효한 카테고리명일 수 있음
```

---

## 수정 방안

### 수정 1: 섹션 레벨 카테고리명 추출로 변경

**Before (잘못됨)**:
```typescript
$popularItems.each((_, item) => {
  const $item = $(item);
  const groupLabel = findGroupLabelNear($, $item);  // ❌

  items.push({
    group: groupLabel || categoryName,
  });
});
```

**After (올바름)**:
```typescript
// 섹션 레벨에서 한 번만 추출
let categoryName = '';

const $headerInParent = $section
  .closest('.sds-comps-vertical-layout')
  .find('.sds-comps-text-type-headline1')
  .first();

if ($headerInParent.length && $headerInParent.text().trim()) {
  categoryName = $headerInParent.text().trim();
}

if (!categoryName) {
  categoryName = '인기글';
}

console.log(`인기글: ${categoryName}`);  // 섹션당 한 번

// 모든 아이템에 동일하게 할당
$popularItems.each((_, item) => {
  items.push({
    group: categoryName,  // ✅ 모든 아이템 동일
  });
});
```

### 수정 2: findGroupLabelNear 함수 제거 또는 용도 변경

**Option 1: 완전 제거** (권장)
- 섹션 레벨에서 카테고리명을 추출하므로 불필요

**Option 2: Fallback 전용으로 변경**
```typescript
// 섹션 레벨에서 카테고리명을 찾지 못한 경우에만 사용
if (!categoryName) {
  categoryName = findCategoryNameFallback($, $section);
}

function findCategoryNameFallback(
  $: CheerioAPI,
  $section: cheerio.Cheerio<any>  // 섹션 요소 (아이템이 아님)
): string {
  // 전체 스캔 등 Fallback 로직
  // ...
  return '인기글';
}
```

### 수정 3: 대체 블록/레거시 블록 파싱 제거 또는 조건부 실행

**Option 1: 제거** (권장)
- 표준 섹션 파싱으로 충분한 경우

**Option 2: 조건부 실행**
```typescript
// 표준 섹션에서 아이템을 찾지 못한 경우에만 실행
if (items.length === 0) {
  console.log('표준 섹션에서 아이템 없음, 대체 방식 시도...');
  // 대체 블록 파싱
}
```

### 수정 4: 로그 정리

```typescript
const DEBUG = process.env.DEBUG_PARSING === 'true';

export function extractPopularItems(html: string): PopularItem[] {
  const $ = cheerio.load(html);
  const items: PopularItem[] = [];

  const $popularSections = $('.fds-ugc-single-intention-item-list');

  $popularSections.each((sectionIdx, section) => {
    const $section = $(section);

    // 카테고리명 추출
    let categoryName = '';
    // ...

    // 필수 로그 (문서 명시)
    console.log(`인기글: ${categoryName}`);

    // 디버그 로그
    if (DEBUG) {
      console.log(`섹션 ${sectionIdx + 1}: "${categoryName}"`);
      console.log(`  → 아이템 ${$popularItems.length}개 발견`);
    }

    // ...
  });

  if (DEBUG) {
    console.log(`\n✅ 총 ${items.length}개 아이템 파싱 완료\n`);
  }

  return Array.from(unique.values());
}
```

---

## 테스트 방법

### 1. 단위 테스트
```typescript
describe('extractPopularItems', () => {
  it('같은 섹션 내 모든 아이템은 동일한 group을 가져야 함', () => {
    const html = `/* 테스트 HTML */`;
    const items = extractPopularItems(html);

    // 섹션 1의 모든 아이템 추출
    const section1Items = items.slice(0, 4);  // 가정: 첫 4개가 섹션 1

    // 모든 group 값이 동일한지 확인
    const groups = section1Items.map(item => item.group);
    const uniqueGroups = new Set(groups);

    expect(uniqueGroups.size).toBe(1);  // ✅ 하나의 고유 group만 존재
  });
});
```

### 2. 통합 테스트
```typescript
// 실제 검색어로 테스트
const queries = ['알파CD', '김포공항주차대행', '위고비'];

for (const query of queries) {
  const html = await fetchNaverSearch(query);
  const items = extractPopularItems(html);

  const uniqueGroups = new Set(items.map(item => item.group));

  console.log(`검색어: ${query}`);
  console.log(`고유 group 수: ${uniqueGroups.size}`);
  console.log(`group 목록:`, Array.from(uniqueGroups));

  // 빈 문자열 group이 있는지 확인
  const hasEmptyGroup = items.some(item => !item.group || item.group.trim() === '');
  if (hasEmptyGroup) {
    console.error('❌ 빈 문자열 group 발견!');
  }
}
```

---

## 우선순위

1. **최우선 (치명적)**: 문제 1 수정 - 섹션 레벨 카테고리명 추출
2. **높음**: 문제 2 수정 - findGroupLabelNear 제거 또는 변경
3. **중간**: 문제 3 검토 - 대체 파싱 로직 필요성 확인
4. **낮음**: 문제 4 개선 - 로그 정리

---

## 참고 문서

- `NAVER_POPULAR_PARSING_GUIDE.md` - 섹션 4.3 "섹션별 순회의 중요성"
- `NAVER_POPULAR_PARSING_GUIDE.md` - 섹션 6.1 "전체 파싱 함수"

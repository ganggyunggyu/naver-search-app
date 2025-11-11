# 네이버 인기글/스블 파싱 로직 완벽 가이드

## 🎯 핵심 개념

네이버는 검색 결과에서 **여러 개의 인기글 섹션**을 제공합니다.
- 각 섹션은 `.fds-ugc-single-intention-item-list` 컨테이너로 감싸져 있습니다.
- 각 섹션마다 **하나의 카테고리명(categoryName)**이 할당됩니다.
- 이 카테고리명이 `item.group`에 저장됩니다.

---

## 📊 HTML 구조 이해

### 케이스 1: 인기글 (알파CD)
```html
<!-- 섹션 1 -->
<div class="sds-comps-vertical-layout">
  <span class="sds-comps-text-type-headline1">알파CD 시작</span>  ← 카테고리명
  <div class="fds-ugc-single-intention-item-list">
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 1</div>
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 2</div>
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 3</div>
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 4</div>
  </div>
</div>

→ 모든 아이템의 group = "알파CD 시작" (동일)
→ 고유 group 1개 → 인기글
```

### 케이스 2: 스블 (김포공항주차대행)
```html
<!-- 섹션 1 -->
<div class="sds-comps-vertical-layout">
  <span class="sds-comps-text-type-headline1">김포공항 주차대행 비용</span>  ← 카테고리명 1
  <div class="fds-ugc-single-intention-item-list">
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 1</div>
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 2</div>
  </div>
</div>

<!-- 섹션 2 -->
<div class="sds-comps-vertical-layout">
  <span class="sds-comps-text-type-headline1">김포공항공식주차대행</span>  ← 카테고리명 2
  <div class="fds-ugc-single-intention-item-list">
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 3</div>
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 4</div>
  </div>
</div>

<!-- 섹션 3 -->
<div class="sds-comps-vertical-layout">
  <span class="sds-comps-text-type-headline1">김포공항 주차대행 내돈내산</span>  ← 카테고리명 3
  <div class="fds-ugc-single-intention-item-list">
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 5</div>
    <div class="NtKCZYlcjvHdeUoASy2I">아이템 6</div>
  </div>
</div>

→ 아이템 1,2의 group = "김포공항 주차대행 비용"
→ 아이템 3,4의 group = "김포공항공식주차대행"
→ 아이템 5,6의 group = "김포공항 주차대행 내돈내산"
→ 고유 group 3개 → 스블 (각 group이 인기 주제)
```

---

## 💻 실제 파싱 코드 (TypeScript + Cheerio)

```typescript
import * as cheerio from 'cheerio';

interface PopularItem {
  title: string;
  link: string;
  snippet: string;
  image: string;
  badge: string;
  group: string;       // ⭐ 카테고리명이 저장됨
  blogLink: string;
  blogName: string;
}

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = cheerio.load(html);
  const items: PopularItem[] = [];

  // ⭐⭐⭐ 핵심! 모든 인기글 섹션을 찾음 (여러 개일 수 있음)
  const $popularSections = $('.fds-ugc-single-intention-item-list');

  console.log(`\n📦 발견된 인기글 섹션: ${$popularSections.length}개\n`);

  // 각 섹션마다 반복
  $popularSections.each((sectionIndex, section) => {
    const $section = $(section);

    // ========================================
    // 1️⃣ 각 섹션의 카테고리명(categoryName) 찾기
    // ========================================
    let categoryName = '';

    // 방법 1: 상위 컨테이너에서 헤더 찾기
    const $headerInParent = $section
      .closest('.sds-comps-vertical-layout')
      .find('.sds-comps-text-type-headline1')
      .first();

    if ($headerInParent.length && $headerInParent.text().trim()) {
      categoryName = $headerInParent.text().trim();
    }

    // 방법 2: 형제 요소에서 헤더 찾기 (방법 1 실패 시)
    if (!categoryName) {
      const $headerInSibling = $section
        .parent()
        .find('.sds-comps-text-type-headline1')
        .first();

      if ($headerInSibling.length && $headerInSibling.text().trim()) {
        categoryName = $headerInSibling.text().trim();
      }
    }

    // 방법 3: 전체에서 "인기글" 키워드 포함하는 헤더 찾기 (Fallback)
    if (!categoryName) {
      $('span').each((_, span) => {
        const spanText = $(span).text().trim();
        if (spanText.includes('인기글') && spanText.length > 3) {
          categoryName = spanText;
          return false; // break
        }
      });
    }

    // 기본값 설정
    if (!categoryName) {
      categoryName = '인기글';
    }

    // 🔍 이 로그가 중요! 각 섹션의 카테고리명이 출력됨
    console.log(`인기글: ${categoryName}`);

    // ========================================
    // 2️⃣ 이 섹션 내의 모든 아이템 파싱
    // ========================================
    const $popularItems = $section.find('.NtKCZYlcjvHdeUoASy2I');

    console.log(`  → 이 섹션의 아이템 수: ${$popularItems.length}개\n`);

    $popularItems.each((itemIndex, item) => {
      const $item = $(item);

      // 제목 링크 추출
      const $titleLink = $item.find('.z1n21OFoYx6_tGcWKL_x').first();
      const title = $item
        .find('.sds-comps-text-type-headline1.sds-comps-text-weight-sm')
        .text()
        .trim();
      const postHref = $titleLink.attr('href')?.trim() || '';

      // 본문 미리보기 추출
      const snippet = $item
        .find('.d69hemU4DtemeWuXiq5g .sds-comps-text-type-body1')
        .first()
        .text()
        .trim();

      // 블로그 정보 추출
      const $sourceLink = $item
        .find('.sds-comps-profile-info-title-text a')
        .first();
      const blogName = $sourceLink.text().trim();
      const blogHref = $sourceLink.attr('href')?.trim() || '';

      // 썸네일 이미지 추출
      const image = $item
        .find('.sds-comps-image img')
        .first()
        .attr('src')
        ?.trim() || '';

      // 유효한 데이터만 추가 (제목과 링크는 필수, 카페/광고 링크는 제외)
      if (
        postHref &&
        title &&
        !postHref.includes('cafe.naver.com') &&
        !postHref.includes('ader.naver.com')
      ) {
        const popularItem: PopularItem = {
          title,
          link: postHref,
          snippet,
          image,
          badge: '',
          group: categoryName,  // ⭐ 이 섹션의 카테고리명 할당!
          blogLink: blogHref,
          blogName,
        };

        items.push(popularItem);
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
};
```

---

## 🎯 인기글 vs 스블 구분 로직

```typescript
export const matchBlogs = (
  query: string,
  items: PopularItem[]
): ExposureResult[] => {
  const results: ExposureResult[] = [];
  const allowedIds = new Set(BLOG_IDS.map(id => id.toLowerCase()));

  // ⭐⭐⭐ 핵심! 고유한 group 개수로 "인기글" vs "스블" 구분
  const uniqueGroups = new Set(items.map(item => item.group));
  const isPopular = uniqueGroups.size === 1;

  console.log(`\n🔍 검색어: ${query}`);
  console.log(`📊 총 ${items.length}개 아이템, 고유 group ${uniqueGroups.size}개`);
  console.log(`✅ 구분: ${isPopular ? '인기글' : '스블 (스마트블로그)'}`);

  if (!isPopular) {
    console.log('📌 인기 주제들:');
    Array.from(uniqueGroups).forEach((group, idx) => {
      const count = items.filter(item => item.group === group).length;
      console.log(`   ${idx + 1}. "${group}" (${count}개 아이템)`);
    });
  }

  items.forEach((item, index) => {
    const blogId = extractBlogId(item.blogLink);

    if (blogId && allowedIds.has(blogId)) {
      const exposureType = isPopular ? '인기글' : '스블';
      const topicName = isPopular ? '' : item.group;

      results.push({
        query,
        blogId,
        blogName: item.blogName,
        postTitle: item.title,
        postLink: item.link,
        exposureType,
        topicName,
        position: index + 1,
      });
    }
  });

  return results;
};
```

---

## 📋 셀렉터 정리 (2025-11-06 기준)

| 요소 | 셀렉터 | 설명 |
|------|--------|------|
| 인기글 섹션 컨테이너 | `.fds-ugc-single-intention-item-list` | 여러 개 존재 가능 |
| 카테고리 헤더 | `.sds-comps-text-type-headline1` | 섹션 상위에 있음 |
| 아이템 컨테이너 | `.NtKCZYlcjvHdeUoASy2I` | 각 섹션 내의 개별 아이템 |
| 제목 링크 | `.z1n21OFoYx6_tGcWKL_x` | 게시글 제목 링크 |
| 제목 텍스트 | `.sds-comps-text-type-headline1.sds-comps-text-weight-sm` | 실제 제목 텍스트 |
| 미리보기 | `.d69hemU4DtemeWuXiq5g .sds-comps-text-type-body1` | 본문 미리보기 |
| 블로그 정보 | `.sds-comps-profile-info-title-text a` | 블로그명 + 링크 |
| 썸네일 | `.sds-comps-image img` | 썸네일 이미지 |

---

## 🔥 실제 실행 예시

### 예시 1: 인기글 (알파CD)

**콘솔 출력:**
```
📦 발견된 인기글 섹션: 1개

인기글: 알파CD 시작
  → 이 섹션의 아이템 수: 4개

🔍 검색어: 알파CD
📊 총 4개 아이템, 고유 group 1개
✅ 구분: 인기글
```

**결과:**
- 모든 아이템의 `group = "알파CD 시작"`
- 고유 group 1개 → **인기글**

---

### 예시 2: 스블 (김포공항주차대행)

**콘솔 출력:**
```
📦 발견된 인기글 섹션: 3개

인기글: 김포공항 주차대행 비용
  → 이 섹션의 아이템 수: 2개

인기글: 김포공항공식주차대행
  → 이 섹션의 아이템 수: 2개

인기글: 김포공항 주차대행 내돈내산
  → 이 섹션의 아이템 수: 2개

🔍 검색어: 김포공항주차대행
📊 총 6개 아이템, 고유 group 3개
✅ 구분: 스블 (스마트블로그)
📌 인기 주제들:
   1. "김포공항 주차대행 비용" (2개 아이템)
   2. "김포공항공식주차대행" (2개 아이템)
   3. "김포공항 주차대행 내돈내산" (2개 아이템)
```

**결과:**
- 아이템들의 group이 3가지로 나뉨
- 고유 group 3개 → **스블** (각 group이 인기 주제)

---

## ⚠️ 주의사항

### 1. 섹션 순회가 핵심!
```typescript
// ❌ 잘못된 방법: 모든 아이템을 한 번에 찾음
const $allItems = $('.NtKCZYlcjvHdeUoASy2I');

// ✅ 올바른 방법: 섹션별로 찾음
$('.fds-ugc-single-intention-item-list').each((_, section) => {
  const categoryName = /* 이 섹션의 카테고리명 찾기 */;
  $(section).find('.NtKCZYlcjvHdeUoASy2I').each((_, item) => {
    // 이 아이템의 group = categoryName
  });
});
```

### 2. 카테고리명 찾기 전략
1. **우선순위 1**: 상위 `.sds-comps-vertical-layout` 내의 `.sds-comps-text-type-headline1`
2. **우선순위 2**: 형제 요소 중 `.sds-comps-text-type-headline1`
3. **우선순위 3**: 전체에서 "인기글" 포함하는 span (Fallback)
4. **기본값**: "인기글"

### 3. 고유 group 개수로 구분
```typescript
const uniqueGroups = new Set(items.map(item => item.group));

if (uniqueGroups.size === 1) {
  // 인기글
} else {
  // 스블 (각 group이 인기 주제)
}
```

---

## 📊 CSV 출력 형식

```csv
검색어,블로그ID,블로그명,게시글제목,게시글링크,노출타입,스블주제명,순위
"알파CD",surreal805,"윤우story","알파CD 효능 후기",https://...,인기글,"",1
"김포공항주차대행",binyyeri,"제주비야","공항 주차 후기",https://...,스블,"김포공항 주차대행 비용",1
"김포공항주차대행",ikiss8,"and daily,","주차대행 비교",https://...,스블,"김포공항 주차대행 비용",2
"김포공항주차대행",lovope,"일상정리","주차장 할인",https://...,스블,"김포공항공식주차대행",3
```

---

## 🚀 완성된 크론 봇 로직

```typescript
async function main() {
  const queries = ['알파CD', '김포공항주차대행', '위고비'];
  const allResults: ExposureResult[] = [];

  for (const query of queries) {
    // 1. HTML 크롤링
    const url = buildNaverSearchUrl(query);
    const html = await fetchHtml(url, NAVER_DESKTOP_HEADERS);

    // 2. 인기글/스블 파싱 (섹션별로!)
    const items = extractPopularItems(html);

    // 3. 블로그 ID 매칭 + 인기글/스블 구분
    const matches = matchBlogs(query, items);

    // 4. 결과 누적
    allResults.push(...matches);

    // 5. 딜레이
    await delay(2000);
  }

  // 6. CSV 저장
  saveToCSV(allResults, `results_${timestamp}.csv`);
}
```

---

**이 로직을 크론 봇에 그대로 사용하면 인기 주제까지 완벽하게 가져올 수 있습니다! 🎯**

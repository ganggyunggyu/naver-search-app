# 네이버 검색 노출 크론 봇 - 개발 명세서

## 📋 프로젝트 개요

네이버 검색 결과에서 특정 블로그 ID들의 노출 여부를 자동으로 검증하는 Node.js 크론 봇입니다.

### 주요 기능
- ✅ 검색어별 네이버 인기글 크롤링
- ✅ 블로그 노출 여부 체크
- ✅ 인기글 vs 스블(스마트블로그) 구분
- ✅ 스블 주제명 추출
- ✅ CSV 결과 파일 생성
- ✅ 에러 발생 시 30초 텀 재시도

---

## 🔍 핵심 로직 흐름

```
1. 검색어 입력
   ↓
2. 네이버 검색 URL 생성
   ↓
3. HTML 크롤링 (User-Agent 포함 헤더)
   ↓
4. Cheerio로 HTML 파싱
   ↓
5. 인기글 섹션 추출
   ├─ 단순 인기글 (group: 검색어 포함)
   └─ 스블 (group: "건강·의학 인기글" 등)
   ↓
6. 블로그 ID 추출 및 매칭
   ↓
7. 결과를 CSV로 저장
   ↓
8. 콘솔 출력 (검증용)
```

---

## 📂 프로젝트 구조

```
naver-exposure-bot/
├── src/
│   ├── index.ts              # 메인 실행 파일
│   ├── crawler.ts            # 크롤링 로직
│   ├── parser.ts             # HTML 파싱 로직
│   ├── matcher.ts            # 블로그 ID 매칭
│   ├── csv-writer.ts         # CSV 저장
│   └── constants.ts          # 상수 (헤더, 셀렉터, 블로그 ID)
├── output/
│   └── results_{timestamp}.csv
├── package.json
├── tsconfig.json
└── .env
```

---

## 🧩 상세 구현 가이드

### 1. 검색 URL 생성

**함수:** `buildNaverSearchUrl(query: string): string`

```typescript
export const buildNaverSearchUrl = (query: string): string => {
  return `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(query)}`;
};
```

**설명:**
- `where=nexearch` - 통합검색 결과
- `query` - 검색어 (URL 인코딩 필수)

---

### 2. HTML 크롤링

**함수:** `fetchHtml(url: string, headers: Record<string, string>): Promise<string>`

```typescript
const NAVER_DESKTOP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

export const fetchHtml = async (url: string, headers: Record<string, string>): Promise<string> => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.text();
};
```

**중요:**
- User-Agent는 **필수** (봇 차단 방지)
- 데스크톱 헤더 사용 (모바일은 구조가 다름)

---

### 3. HTML 파싱 (Cheerio)

**함수:** `extractPopularItems(html: string): PopularItem[]`

---

**⚠️ 중요! 반드시 읽어보세요:**

네이버는 검색 결과 페이지에서 **여러 개의 인기글 섹션**을 제공합니다.
각 섹션은 `.fds-ugc-single-intention-item-list` 컨테이너로 감싸져 있습니다.

**핵심 개념:**
1. 각 섹션마다 **하나의 카테고리명(categoryName)**이 할당됩니다.
2. 같은 섹션 내의 모든 아이템은 **동일한 categoryName**을 `group`으로 가집니다.
3. **여러 섹션**이 있으면 → 여러 개의 서로 다른 `group` → **스블** (각 group이 인기 주제)
4. **한 섹션**만 있으면 → 하나의 동일한 `group` → **인기글**

**따라서 섹션별로 순회하면서 파싱해야 합니다!**

```
인기글 (알파CD):
  섹션 1 → categoryName: "알파CD 시작" → 아이템 4개
  → 고유 group 1개 → 인기글

스블 (김포공항주차대행):
  섹션 1 → categoryName: "김포공항 주차대행 비용" → 아이템 2개
  섹션 2 → categoryName: "김포공항공식주차대행" → 아이템 2개
  섹션 3 → categoryName: "김포공항 주차대행 내돈내산" → 아이템 2개
  → 고유 group 3개 → 스블
```

---

#### 3-1. 네이버 HTML 구조 (2025년 11월 6일 기준)

```html
<!-- 인기글 리스트 컨테이너 -->
<div class="fds-ugc-single-intention-item-list">

  <!-- 각 인기글 아이템 -->
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
          본문 미리보기 텍스트...
        </span>
      </a>
    </div>

    <!-- 썸네일 이미지 -->
    <img src="{이미지URL}" class="sds-comps-image">

  </div>
</div>
```

#### 3-2. 카테고리명 (group) 찾기 ⭐ 핵심!

**🔥 중요:** `console.log('인기글:', categoryName)` 이 분기에서 추출한 `categoryName` 값으로 "인기글" vs "스블"을 구분합니다!

**로직 설명:**

```typescript
// 인기글 섹션의 상위 컨테이너에서 헤더 텍스트를 찾는 과정

const $section = $('.fds-ugc-single-intention-item-list');  // 인기글 리스트 컨테이너

// ⭐ 방법 1: 상위 컨테이너에서 헤더 찾기
// .sds-comps-vertical-layout 상위로 올라가서
// .sds-comps-text-type-headline1 클래스를 가진 첫 번째 헤더를 찾음
const $headerInParent = $section
  .closest('.sds-comps-vertical-layout')
  .find('.sds-comps-text-type-headline1')
  .first();

let categoryName = '';

if ($headerInParent.length && $headerInParent.text().trim()) {
  categoryName = $headerInParent.text().trim();
}

// ⭐ 방법 2: 형제 요소에서 헤더 찾기 (방법 1 실패 시)
if (!categoryName) {
  const $headerInSibling = $section
    .parent()
    .find('.sds-comps-text-type-headline1')
    .first();

  if ($headerInSibling.length && $headerInSibling.text().trim()) {
    categoryName = $headerInSibling.text().trim();
  }
}

// 기본값 설정
if (!categoryName) {
  categoryName = '인기글';
}

// 🔍 이 분기가 핵심! 여기서 출력된 categoryName 값으로 인기글/스블 구분!
console.log('인기글:', categoryName);

// 이후 각 아이템의 item.group에 이 categoryName이 저장됨
```

**실제 파싱 결과 예시:**

**예시 1) 인기글 - 검색어: "알파CD"**
```
console.log('인기글:', "알파CD 시작");  // ← 섹션 1
console.log('인기글:', "알파CD 시작");  // ← 섹션 1 (동일)
console.log('인기글:', "알파CD 시작");  // ← 섹션 1 (동일)
console.log('인기글:', "알파CD 시작");  // ← 섹션 1 (동일)

→ 고유한 group: 1개 ("알파CD 시작")
→ 구분: 인기글
```

**예시 2) 스블 - 검색어: "김포공항주차대행"**
```
console.log('인기글:', "김포공항 주차대행 비용");      // ← 인기 주제 1
console.log('인기글:', "김포공항 주차대행 비용");      // ← 인기 주제 1
console.log('인기글:', "김포공항공식주차대행");        // ← 인기 주제 2
console.log('인기글:', "김포공항공식주차대행");        // ← 인기 주제 2
console.log('인기글:', "김포공항 주차대행 내돈내산");  // ← 인기 주제 3
console.log('인기글:', "김포공항 주차대행 내돈내산");  // ← 인기 주제 3

→ 고유한 group: 3개 (각각 다른 인기 주제)
→ 구분: 스블 (스마트블로그)
```

**⭐ 핵심 구분 로직:**

| 검색어 | 고유 group 개수 | group 값 예시 | 구분 |
|--------|----------------|--------------|------|
| "알파CD" | **1개** | "알파CD 시작" | **인기글** |
| "위고비" | **1개** | "'위고비' 인기글" | **인기글** |
| "김포공항주차대행" | **3개** | "김포공항 주차대행 비용"<br>"김포공항공식주차대행"<br>"김포공항 주차대행 내돈내산" | **스블** |

```typescript
// matchBlogs 함수에서 이렇게 구분함:
const uniqueGroups = new Set(items.map(item => item.group));

if (uniqueGroups.size === 1) {
  // 하나의 동일한 group → 인기글
  console.log('✅ 인기글');
} else {
  // 여러 개의 서로 다른 group → 스블 (각 group이 인기 주제)
  console.log('✅ 스블 (스마트블로그)');
  console.log('📌 인기 주제들:', Array.from(uniqueGroups));
}
```

#### 3-3. 파싱 코드 예시

```typescript
import * as cheerio from 'cheerio';

interface PopularItem {
  title: string;          // 게시글 제목
  link: string;           // 게시글 URL
  snippet: string;        // 본문 미리보기
  image: string;          // 썸네일 이미지
  badge: string;          // 배지 (사용 안 함)
  group: string;          // 카테고리명 ⭐ 중요!
  blogLink: string;       // 블로그 홈 URL
  blogName: string;       // 블로그명
}

export const extractPopularItems = (html: string): PopularItem[] => {
  const $ = cheerio.load(html);
  const items: PopularItem[] = [];

  // 인기글 섹션 찾기
  const $popularSections = $('.fds-ugc-single-intention-item-list');

  $popularSections.each((_, section) => {
    const $section = $(section);

    // ⭐⭐⭐ 1. 카테고리명 찾기 (인기글 vs 스블 구분의 핵심!)
    let categoryName = '';

    // 방법 1: 상위 컨테이너에서 헤더 찾기
    // HTML 구조: .fds-ugc-single-intention-item-list의 상위에 있는 헤더 텍스트 추출
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

    // 기본값
    if (!categoryName) {
      categoryName = '인기글';
    }

    // 🔍🔍🔍 이 분기가 핵심!
    // 각 섹션마다 하나의 categoryName이 출력됨!
    // 여러 섹션이 있으면 서로 다른 categoryName → 스블 (각 categoryName이 인기 주제)
    // 한 섹션만 있으면 하나의 동일한 categoryName → 인기글
    console.log('인기글:', categoryName);

    // 2. 각 인기글 아이템 파싱
    const $popularItems = $section.find('.NtKCZYlcjvHdeUoASy2I');

    $popularItems.each((_, item) => {
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

      // 유효성 체크 (카페, 광고 제외)
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
          group: categoryName,  // ⭐ 인기글 vs 스블 구분
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
};
```

---

### 4. 블로그 ID 추출 및 매칭

**함수:** `extractBlogId(blogUrl: string): string`

```typescript
export const extractBlogId = (blogUrl: string): string => {
  try {
    const url = new URL(blogUrl);

    // blog.naver.com/{블로그ID} 형식
    if (
      url.hostname.includes('blog.naver.com') ||
      url.hostname.includes('m.blog.naver.com')
    ) {
      const segments = url.pathname.replace(/^\//, '').split('/');
      return (segments[0] || '').toLowerCase();
    }
  } catch {}

  return '';
};
```

**체크할 블로그 ID 목록:**

```typescript
export const BLOG_IDS = [
  'im_tang',
  'solantoro',
  'busansmart',
  'mygury1',
  'rscwsixrc',
  'surreal805',
  'dreamclock33',
  'minpilates',
  'dnation09',
  'snk92789',
  'i_thinkkkk',
  'sw078',
  'godqhr5528',
  'alstjs9711',
  'jjs216',
  'megatattoo',
  'odori2007',
  'vegetable10517',
  'rational4640',
  'hugeda14713',
  'boy848',
  'ecjroe6558',
  'dhtksk1p',
  'dhfosk1p',
  'dlfgydnjs1p',
  'eqsdxv2863',
  'ags2oigb',
  'vocabulary1215',
  'zoeofx5611',
  'tjthtjs5p',
  'wd6edn3b',
  'ihut9094',
  '3goc9xkq',
  'tube24575',
  'cookie4931',
  'wound12567',
  'precede1451',
  '0902ab',
  'by9996',
  'ziniz77',
  'taraswati',
  'vividoasis',
  'gray00jy',
  'skidrow5246',
  'kainn',
  'yaves0218',
  'idoenzang',
  'wsnarin',
  'an970405',
  'kangcs4162',
  'skycomps',
  'hotelelena',
  'bullim91',
  'hyzhengyin',
  'kisemo777',
  'mw_mj',
  'ccgakoreains',
  'sjyh86',
  'guselvkvk',
  'adorableash',
  'yevencho',
  'dlsdo9495',
  'ddo_ddi_appa',
  'gnggnggyu_',
  'mm__mm984',
  'seowoo7603',
];
```

**실제 API 응답 예시로 이해하기:**

**예시 1) 스블 (스마트블로그) - 검색어: "김포공항주차대행"**
```json
{
  "count": 8,
  "items": [
    { "group": "김포공항 주차대행 비용", "title": "...", "blogLink": "..." },
    { "group": "김포공항 주차대행 비용", "title": "...", "blogLink": "..." },
    { "group": "김포공항공식주차대행", "title": "...", "blogLink": "..." },
    { "group": "김포공항공식주차대행", "title": "...", "blogLink": "..." },
    { "group": "김포공항 주차대행 내돈내산", "title": "...", "blogLink": "..." },
    { "group": "김포공항 주차대행 내돈내산", "title": "...", "blogLink": "..." }
  ]
}
```
→ **고유한 group 3개** → **스블** (각 group이 인기 주제)

**예시 2) 인기글 - 검색어: "알파CD"**
```json
{
  "count": 4,
  "items": [
    { "group": "알파CD 시작", "title": "...", "blogLink": "..." },
    { "group": "알파CD 시작", "title": "...", "blogLink": "..." },
    { "group": "알파CD 시작", "title": "...", "blogLink": "..." },
    { "group": "알파CD 시작", "title": "...", "blogLink": "..." }
  ]
}
```
→ **고유한 group 1개** → **인기글**

---

**매칭 로직:**

```typescript
interface ExposureResult {
  query: string;           // 검색어
  blogId: string;          // 매칭된 블로그 ID
  blogName: string;        // 블로그명
  postTitle: string;       // 게시글 제목
  postLink: string;        // 게시글 링크
  exposureType: string;    // "인기글" or "스블"
  topicName: string;       // 스마트블로그 주제명 (스블인 경우)
  position: number;        // 순위 (몇 번째 노출)
}

export const matchBlogs = (
  query: string,
  items: PopularItem[]
): ExposureResult[] => {
  const results: ExposureResult[] = [];
  const allowedIds = new Set(BLOG_IDS.map(id => id.toLowerCase()));

  // ⭐⭐⭐ 핵심! 고유한 group 개수로 "인기글" vs "스블" 구분
  //
  // 구분 로직:
  // 1. 고유한 group이 1개만 존재 (모든 아이템이 동일한 group)
  //    → 인기글
  //    예: 모든 아이템의 group이 "알파CD 시작"
  //
  // 2. 고유한 group이 2개 이상 존재 (여러 개의 서로 다른 group)
  //    → 스블 (스마트블로그)
  //    예: "김포공항 주차대행 비용", "김포공항공식주차대행", "김포공항 주차대행 내돈내산"
  //        각 group이 "인기 주제"가 됨

  const uniqueGroups = new Set(items.map(item => item.group));
  const isPopular = uniqueGroups.size === 1;

  console.log(`\n🔍 검색어: ${query}`);
  console.log(`📊 총 ${items.length}개 아이템, 고유 group ${uniqueGroups.size}개`);
  console.log(`✅ 구분: ${isPopular ? '인기글' : '스블 (스마트블로그)'}`);

  if (!isPopular) {
    console.log('📌 인기 주제들:', Array.from(uniqueGroups));
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
        position: index + 1,  // 1부터 시작
      });
    }
  });

  return results;
};
```

---

### 5. CSV 저장

**함수:** `saveToCSV(results: ExposureResult[], filename: string): void`

```typescript
import * as fs from 'fs';
import * as path from 'path';

export const saveToCSV = (results: ExposureResult[], filename: string): void => {
  const outputDir = path.join(__dirname, '../output');

  // output 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, filename);

  // CSV 헤더
  const header = [
    '검색어',
    '블로그ID',
    '블로그명',
    '게시글제목',
    '게시글링크',
    '노출타입',
    '스블주제명',
    '순위'
  ].join(',');

  // CSV 데이터 행
  const rows = results.map(result => {
    return [
      `"${result.query}"`,
      result.blogId,
      `"${result.blogName}"`,
      `"${result.postTitle.replace(/"/g, '""')}"`,  // 큰따옴표 이스케이프
      result.postLink,
      result.exposureType,
      `"${result.topicName}"`,
      result.position
    ].join(',');
  });

  const csvContent = [header, ...rows].join('\n');

  fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8');  // BOM 추가 (엑셀 한글 깨짐 방지)

  console.log(`✅ CSV 저장 완료: ${filePath}`);
};
```

**CSV 출력 예시:**

```csv
검색어,블로그ID,블로그명,게시글제목,게시글링크,노출타입,스블주제명,순위
"라미네이트",surreal805,"윤우story","라미네이트 시공 후기",https://blog.naver.com/surreal805/123456,인기글,"",1
"라미네이트",im_tang,"탕의 블로그","라미네이트 가격 비교",https://blog.naver.com/im_tang/789012,스블,"건강·의학 인기글",3
```

---

### 6. 에러 핸들링 (30초 재시도)

```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const crawlWithRetry = async (
  query: string,
  maxRetries: number = 3
): Promise<PopularItem[]> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [시도 ${attempt}/${maxRetries}] 검색어: ${query}`);

      const url = buildNaverSearchUrl(query);
      const html = await fetchHtml(url, NAVER_DESKTOP_HEADERS);
      const items = extractPopularItems(html);

      console.log(`✅ 성공! 인기글 ${items.length}개 추출`);

      return items;
    } catch (error) {
      console.error(`❌ 실패 (시도 ${attempt}/${maxRetries}):`, error);

      if (attempt < maxRetries) {
        console.log('⏳ 30초 후 재시도...');
        await delay(30000);  // 30초 대기
      } else {
        console.error('❌ 최대 재시도 횟수 초과');
        throw error;
      }
    }
  }

  return [];
};
```

---

### 7. 메인 실행 로직

```typescript
import * as path from 'path';

interface Config {
  queries: string[];      // 검색어 목록
  maxRetries: number;     // 최대 재시도 횟수
  delayBetweenQueries: number;  // 검색어 간 딜레이 (ms)
}

const config: Config = {
  queries: [
    '라미네이트',
    '카펫',
    '벽지',
    // ... 더 추가
  ],
  maxRetries: 3,
  delayBetweenQueries: 2000,  // 2초
};

async function main() {
  console.log('🚀 네이버 검색 노출 크론 봇 시작');
  console.log(`📋 검색어 ${config.queries.length}개 처리 예정\n`);

  const allResults: ExposureResult[] = [];

  for (let i = 0; i < config.queries.length; i++) {
    const query = config.queries[i];

    console.log(`\n[${i + 1}/${config.queries.length}] "${query}" 검색 시작...`);

    try {
      // 1. 크롤링 (재시도 로직 포함)
      const items = await crawlWithRetry(query, config.maxRetries);

      // 2. 블로그 매칭
      const matches = matchBlogs(query, items);

      // 3. 결과 출력 (콘솔)
      if (matches.length > 0) {
        console.log(`\n🎯 "${query}" 노출 발견! (${matches.length}개)`);
        matches.forEach(match => {
          console.log(`  - ${match.blogId} (${match.blogName})`);
          console.log(`    타입: ${match.exposureType}`);
          if (match.topicName) {
            console.log(`    주제: ${match.topicName}`);
          }
          console.log(`    순위: ${match.position}위`);
          console.log(`    제목: ${match.postTitle}`);
          console.log('');
        });
      } else {
        console.log(`❌ "${query}" 노출 없음`);
      }

      // 4. 결과 누적
      allResults.push(...matches);

      // 5. 다음 검색어 전 딜레이 (마지막 제외)
      if (i < config.queries.length - 1) {
        console.log(`⏳ ${config.delayBetweenQueries / 1000}초 대기...`);
        await delay(config.delayBetweenQueries);
      }
    } catch (error) {
      console.error(`❌ "${query}" 처리 실패:`, error);
      // 실패해도 다음 검색어 계속 진행
    }
  }

  // 6. CSV 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `results_${timestamp}.csv`;

  saveToCSV(allResults, filename);

  // 7. 요약 출력
  console.log('\n' + '='.repeat(50));
  console.log('📊 크롤링 완료 요약');
  console.log('='.repeat(50));
  console.log(`✅ 총 검색어: ${config.queries.length}개`);
  console.log(`✅ 총 노출 발견: ${allResults.length}개`);
  console.log(`✅ 인기글: ${allResults.filter(r => r.exposureType === '인기글').length}개`);
  console.log(`✅ 인기주제: ${allResults.filter(r => r.exposureType === '인기주제').length}개`);
  console.log('='.repeat(50) + '\n');
}

// 실행
main().catch(error => {
  console.error('❌ 프로그램 오류:', error);
  process.exit(1);
});
```

---

## 📦 패키지 설치

**package.json:**

```json
{
  "name": "naver-exposure-bot",
  "version": "1.0.0",
  "description": "네이버 검색 노출 크론 봇",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "cheerio": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**설치 명령어:**

```bash
npm install
npm run dev  # 개발 모드 실행
npm run build  # 빌드
npm start  # 프로덕션 실행
```

---

## ⚙️ 크론 설정 (선택)

**crontab 예시 (매일 오전 9시 실행):**

```bash
0 9 * * * cd /path/to/naver-exposure-bot && npm start >> /path/to/logs/cron.log 2>&1
```

---

## ⚠️ 주의사항

### 1. 네이버 차단 방지
- ✅ User-Agent 헤더 **필수**
- ✅ 검색어 간 2초 이상 딜레이 권장
- ✅ 동일 IP에서 과도한 요청 금지
- ⚠️ VPN/프록시 사용 권장 (장기 운영 시)

### 2. HTML 구조 변경
- 네이버는 HTML 구조를 **자주 변경**합니다
- 파싱 실패 시 셀렉터 업데이트 필요
- 현재 셀렉터는 **2025년 11월 6일** 기준

### 3. 에러 처리
- ✅ 30초 재시도 로직 구현
- ✅ 실패한 검색어도 로그 기록
- ✅ CSV 저장은 마지막에 한 번만

### 4. CSV 인코딩
- UTF-8 BOM 추가 필수 (엑셀 한글 깨짐 방지)
- 큰따옴표 이스케이프 처리

---

## 🔧 커스터마이징 가능 항목

1. **검색어 목록** (`config.queries`)
2. **블로그 ID 목록** (`BLOG_IDS`)
3. **재시도 횟수** (`config.maxRetries`)
4. **검색어 간 딜레이** (`config.delayBetweenQueries`)
5. **CSV 출력 경로** (`outputDir`)

---

## 📋 체크리스트

작업 전 확인:
- [ ] Node.js 18+ 설치
- [ ] TypeScript 설치
- [ ] 검색어 목록 준비
- [ ] 블로그 ID 목록 확인
- [ ] User-Agent 헤더 설정
- [ ] CSV 출력 디렉토리 생성
- [ ] 에러 핸들링 테스트

---

## 🚀 시작하기

1. 프로젝트 생성
   ```bash
   mkdir naver-exposure-bot
   cd naver-exposure-bot
   npm init -y
   ```

2. 패키지 설치
   ```bash
   npm install cheerio
   npm install -D typescript @types/node ts-node
   ```

3. 파일 구조 생성
   ```bash
   mkdir -p src output
   touch src/index.ts src/crawler.ts src/parser.ts src/matcher.ts src/csv-writer.ts src/constants.ts
   ```

4. 코드 작성 (위 가이드 참고)

5. 실행
   ```bash
   npm run dev
   ```

---

## 📊 예상 결과 예시

**콘솔 출력:**

```
🚀 네이버 검색 노출 크론 봇 시작
📋 검색어 3개 처리 예정

[1/3] "알파CD" 검색 시작...
🔄 [시도 1/3] 검색어: 알파CD
인기글: 알파CD 시작
인기글: 알파CD 시작
인기글: 알파CD 시작
인기글: 알파CD 시작
✅ 성공! 인기글 4개 추출

🔍 검색어: 알파CD
📊 총 4개 아이템, 고유 group 1개
✅ 구분: 인기글

🎯 "알파CD" 노출 발견! (1개)
  - surreal805 (윤우story)
    타입: 인기글
    순위: 1위
    제목: 알파CD 효능 부작용 정보 감량 성공 후기

⏳ 2초 대기...

[2/3] "김포공항주차대행" 검색 시작...
🔄 [시도 1/3] 검색어: 김포공항주차대행
인기글: 김포공항 주차대행 비용
인기글: 김포공항 주차대행 비용
인기글: 김포공항공식주차대행
인기글: 김포공항공식주차대행
인기글: 김포공항 주차대행 내돈내산
인기글: 김포공항 주차대행 내돈내산
✅ 성공! 인기글 8개 추출

🔍 검색어: 김포공항주차대행
📊 총 8개 아이템, 고유 group 3개
✅ 구분: 스블 (스마트블로그)
📌 인기 주제들: ["김포공항 주차대행 비용", "김포공항공식주차대행", "김포공항 주차대행 내돈내산"]

🎯 "김포공항주차대행" 노출 발견! (2개)
  - binyyeri (제주비야)
    타입: 스블
    주제: 김포공항 주차대행 비용
    순위: 1위
    제목: 김포공항 공식 주차대행 비용 최저가 할인 후기

  - ikiss8 (and daily,)
    타입: 스블
    주제: 김포공항 주차대행 비용
    순위: 2위
    제목: 김포공항 공식 주차대행 비용 요금 할인 후기

⏳ 2초 대기...

[3/3] "위고비" 검색 시작...
🔄 [시도 1/3] 검색어: 위고비
인기글: 위고비알약
인기글: 위고비알약
인기글: 위고비 처방
인기글: 위고비 처방
인기글: '위고비' 인기글
인기글: '위고비' 인기글
✅ 성공! 인기글 6개 추출

🔍 검색어: 위고비
📊 총 6개 아이템, 고유 group 3개
✅ 구분: 스블 (스마트블로그)
📌 인기 주제들: ["위고비알약", "위고비 처방", "'위고비' 인기글"]

❌ "위고비" 노출 없음

==================================================
📊 크롤링 완료 요약
==================================================
✅ 총 검색어: 3개
✅ 총 노출 발견: 3개
✅ 인기글: 1개
✅ 스블: 2개
==================================================

✅ CSV 저장 완료: /path/to/output/results_2025-11-07T12-30-00.csv
```

---

## 📞 문의 및 개선

- 셀렉터 업데이트 필요 시 `parser.ts` 수정
- 새로운 블로그 ID 추가 시 `constants.ts` 수정
- 에러 로그는 `logs/` 디렉토리에 저장 권장

---

**이 명세서를 Claude Code에게 전달하면 바로 작업 가능합니다! 🚀**

# 네이버 인기글 셀렉터 모니터링 가이드

## 개요

네이버 검색 결과의 "인기글" 섹션은 주기적으로 HTML 구조가 변경됩니다.
이 가이드는 노출 체크 시 셀렉터 변경을 감지하고 대응하는 방법을 설명합니다.

---

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `app/shared/utils/parser.ts` | 인기글 파싱 로직 + 셀렉터 정의 |
| `app/shared/utils/_popular.ts` | 셀렉터 설정값 export |
| `scripts/naver-popular-update.ts` | 셀렉터 자동 업데이트 스크립트 |

---

## 현재 셀렉터 구조 (2025-11-24 기준)

```typescript
// app/shared/utils/_popular.ts
export const NAVER_POPULAR_SELECTOR_CONFIG = {
  container: '.fds-ugc-single-intention-item-list',  // 인기글 컨테이너
  item: '.oIxNPKojSTvxvkjdwXVC',                     // 각 인기글 아이템
  titleLink: '.yUgjyAT8hsQKswX75JB4',               // 제목 링크
  preview: '.q_Caq4prL1xTKuKsMjDN .sds-comps-text-type-body1',  // 미리보기
};
```

```typescript
// app/shared/utils/parser.ts (SELECTORS 객체)
const SELECTORS = {
  // 인기글 섹션
  singleIntentionList: '.fds-ugc-single-intention-item-list',
  intentionItem: '.oIxNPKojSTvxvkjdwXVC',
  intentionTitle: 'a.yUgjyAT8hsQKswX75JB4',
  intentionHeadline: '.sds-comps-text.sds-comps-text-type-headline1',
  intentionPreview: '.q_Caq4prL1xTKuKsMjDN .sds-comps-text-type-body1',
  intentionProfile: '.sds-comps-profile-info-title-text a',
  intentionImage: '.sds-comps-image img',

  // 레거시 블록 (collection-root 패턴)
  collectionRoot: '.fds-collection-root',
  blockMod: '.fds-ugc-block-mod',
  // ...
};
```

---

## 노출 체크 시 확인 포인트

### 1. 파싱 실패 감지

```typescript
const items = await fetchAndParsePopular(url);

// 파싱 결과가 0개면 셀렉터 변경 의심
if (items.length === 0) {
  console.warn('[ALERT] 인기글 파싱 실패 - 셀렉터 변경 의심');
  // cronbot에 알림 전송
}
```

### 2. 비정상 결과 감지

```typescript
// 평소 대비 결과 수가 현저히 적으면 의심
const MINIMUM_EXPECTED_ITEMS = 3;

if (items.length < MINIMUM_EXPECTED_ITEMS) {
  console.warn(`[ALERT] 인기글 ${items.length}개만 파싱됨 - 확인 필요`);
}
```

### 3. 필수 필드 누락 체크

```typescript
const hasInvalidItems = items.some(item =>
  !item.title || !item.link || item.title === '' || item.link === ''
);

if (hasInvalidItems) {
  console.warn('[ALERT] 인기글 데이터 불완전 - 셀렉터 확인 필요');
}
```

---

## 셀렉터 변경 대응 프로세스

### 자동 업데이트 (스크립트 사용)

```bash
# 1. 네이버에서 인기글 HTML 복사
# 2. 스크립트에 stdin으로 전달
cat copied_html.html | npx tsx scripts/naver-popular-update.ts

# 또는 /naver-popular-update 커맨드 사용
```

### 수동 업데이트

1. **브라우저에서 HTML 구조 확인**
   ```
   네이버 검색 → F12 개발자 도구 → 인기글 섹션 검사
   ```

2. **새 클래스명 추출**
   - 컨테이너: `fds-ugc-single-intention-item-list` (보통 유지됨)
   - 아이템 래퍼: 해시 형태 클래스 (예: `oIxNPKojSTvxvkjdwXVC`)
   - 제목 링크: 해시 형태 클래스 (예: `yUgjyAT8hsQKswX75JB4`)
   - 미리보기: 해시 형태 클래스 (예: `q_Caq4prL1xTKuKsMjDN`)

3. **파일 수정**
   - `app/shared/utils/parser.ts` - SELECTORS 객체 업데이트
   - `app/shared/utils/_popular.ts` - NAVER_POPULAR_SELECTOR_CONFIG 업데이트

4. **테스트**
   ```bash
   npm run dev
   # http://localhost:4001 에서 검색 테스트
   ```

5. **커밋**
   ```bash
   git add app/shared/utils/parser.ts app/shared/utils/_popular.ts
   git commit -m "fix(naver): update popular items selector (YYYY-MM-DD)"
   ```

---

## 클래스명 패턴 특징

네이버는 두 가지 클래스명 패턴을 사용합니다:

### 1. 고정 클래스 (잘 안 바뀜)
```
fds-ugc-single-intention-item-list  // 인기글 컨테이너
sds-comps-text-type-headline1       // 헤드라인 텍스트
sds-comps-text-type-body1           // 본문 텍스트
sds-comps-profile-info-title-text   // 프로필 정보
sds-comps-image                     // 이미지
```

### 2. 해시 클래스 (자주 바뀜)
```
oIxNPKojSTvxvkjdwXVC   // 아이템 래퍼
yUgjyAT8hsQKswX75JB4   // 제목 링크
q_Caq4prL1xTKuKsMjDN   // 미리보기 링크
```

> **Tip**: 해시 클래스는 빌드마다 변경될 수 있으므로, 모니터링 주기를 짧게 가져가는 것이 좋습니다.

---

## 모니터링 권장 주기

| 체크 항목 | 주기 | 방법 |
|----------|------|------|
| 파싱 결과 유효성 | 매 요청 | API 응답에서 items.length 체크 |
| 셀렉터 동작 여부 | 1시간 | 테스트 키워드로 인기글 조회 |
| HTML 구조 변경 | 1일 | 개발자 도구로 수동 확인 |

---

## 알림 트리거 조건

cronbot이 다음 조건에서 알림을 보내야 합니다:

1. **Critical**: 파싱 결과 0개 (3회 연속)
2. **Warning**: 파싱 결과 3개 미만
3. **Warning**: 필수 필드(title, link) 누락
4. **Info**: 24시간 내 셀렉터 업데이트 발생

---

## API 엔드포인트

```
GET /api/naver-popular?q={keyword}
GET /api/naver-popular?q={keyword}&exposure=true  // 노출 체크 포함
```

### 응답 예시

```json
{
  "url": "https://m.search.naver.com/...",
  "count": 7,
  "items": [
    {
      "title": "인기글 제목",
      "link": "https://m.blog.naver.com/...",
      "snippet": "미리보기 텍스트...",
      "image": "https://...",
      "blogName": "블로그명",
      "blogLink": "https://m.blog.naver.com/blogid"
    }
  ],
  "status": 200
}
```

---

## 관련 함수

| 함수 | 위치 | 설명 |
|------|------|------|
| `extractPopularItems(html)` | parser.ts | HTML에서 인기글 추출 |
| `fetchAndParsePopular(url)` | parser.ts | URL fetch + 파싱 통합 |
| `searchPopularItems(keyword)` | parser.ts | 키워드로 검색 + 파싱 |
| `matchBlogs(keyword, items)` | _exposure.ts | 블로그 노출 매칭 |

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2025-11-24 | intentionItem: `.oIxNPKojSTvxvkjdwXVC` |
| 2025-11-24 | intentionTitle: `a.yUgjyAT8hsQKswX75JB4` |
| 2025-11-24 | intentionPreview: `.q_Caq4prL1xTKuKsMjDN` |
| 2025-10-16 | 최초 셀렉터 설정 |

---

## 문의

셀렉터 업데이트 필요 시:
1. `/naver-popular-update` 커맨드 실행
2. 또는 수동으로 parser.ts, _popular.ts 수정

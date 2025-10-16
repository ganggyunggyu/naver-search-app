# CLAUDE.md - Naver Search Engine 프로젝트 지침

## 🔍 프로젝트 개요
**네이버 검색 API 기반 검색 엔진** - React Router v7(Remix 스타일) + TypeScript + TailwindCSS

## 🏗️ 기술 스택 & 아키텍처

### Core Stack
- **Frontend**: React 19 + React Router v7 (SSR 지원)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4
- **State**: Jotai (atomic state management)
- **Build**: Vite + TSConfig Paths
- **Icons**: Lucide React

### 프로젝트 구조 (FSD 기반)
```
app/
├── components/        # 공통 컴포넌트
├── constants/         # 상수 (headers, selectors, blog-ids)
├── entities/          # 도메인 엔티티
├── features/          # 기능별 모듈 (FSD)
│   └── naver-popular/ # 네이버 인기검색어 기능 (메인)
├── routes/           # 페이지 라우트
├── shared/           # 공유 유틸리티
├── utils/            # 헬퍼 함수
└── .utils/           # 내부 유틸리티
```

## 🛠️ 개발 지침

### 1. 컴포넌트 작성 규칙
```typescript
// ✅ 올바른 컴포넌트 구조
interface ComponentProps {
  searchTerm: string;
  resultList: SearchResult[];
  isLoading: boolean;
}

export const SearchComponent = ({ searchTerm, resultList, isLoading }: ComponentProps) => {
  return (
    <React.Fragment>
      {/* 컴포넌트 내용 */}
    </React.Fragment>
  );
};
```

### 2. API 라우트 패턴
```typescript
// routes/api.*.ts 패턴 준수
import type { LoaderFunctionArgs } from 'react-router';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  
  // Naver API 호출 로직
  return Response.json(data);
};
```

### 3. Feature 모듈 구조 (FSD)
```
features/feature-name/
├── components/       # UI 컴포넌트
├── hooks/           # 커스텀 훅
├── lib/            # 비즈니스 로직
├── store/          # Jotai atoms
└── index.ts        # public API
```

### 4. 상태 관리 (Jotai)
```typescript
// store/_atoms.ts
export const searchTermAtom = atom<string>('');
export const searchResultListAtom = atom<SearchResult[]>([]);
export const isLoadingAtom = atom<boolean>(false);

// 파생 상태
export const filteredResultListAtom = atom((get) => 
  get(searchResultListAtom).filter(result => result.isVisible)
);
```

### 5. 스타일링 가이드
- **TailwindCSS v4** 사용
- 반응형 디자인 적용
- 일관된 색상/간격 시스템 유지
- `app.css`에서 글로벌 스타일 관리

## 🔧 개발 명령어

```bash
# 개발 서버 (포트 4001)
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run typecheck

# 서버 실행
npm run start
```

## 📋 API 엔드포인트

### 검색 API
- `GET /api/search` - 블로그 검색
- `GET /api/news` - 뉴스 검색
- `GET /api/content` - 콘텐츠 검색
- `GET /api/naver-search` - 네이버 통합 검색 (HTML 파싱)
- `GET /api/naver-popular` - 인기검색어 (HTML 파싱)

### 페이지 라우트
- `/` - 네이버 인기검색어 (홈)
- `/search` - 검색 페이지
- `/url-search` - URL 검색
- `/doc-analyzer` - 문서 분석
- `/doc-compare` - 문서 비교
- `/:keyword` - 다이나믹 키워드 검색
- `/url/:encoded` - 다이나믹 URL 검색

## 🎯 네이버 인기글 파싱 구조

### HTML 구조 변경 히스토리

네이버는 검색 결과 HTML을 주기적으로 변경합니다. 변경 이력:

**2025년 10월 16일 업데이트:**
- **변경 이유**: 네이버의 인기글 섹션 HTML 클래스명 변경
- **주요 변경 사항**:
  - 인기글 컨테이너: `.fds-ugc-single-intention-item-list` (신규)
  - 아이템 컨테이너: `.w0FkNRfc2K6rffX0LJFd` (신규)
  - 제목 링크: `.Pcw4FFPrGxhURyUmBGxh` (신규)
  - 미리보기: `.XEJeYBY31zkS37HszIeB` (신규)

### 현재 사용 중인 셀렉터 (2025-10-16 기준)

```typescript
// app/shared/utils/_popular.ts - readPopularSection()

// 인기글 섹션 찾기
$('.fds-ugc-single-intention-item-list')

// 각 인기글 아이템
.find('.w0FkNRfc2K6rffX0LJFd')

// 제목 & 링크
.find('.Pcw4FFPrGxhURyUmBGxh')  // 제목 링크
.find('.sds-comps-text-type-headline1.sds-comps-text-weight-sm')  // 제목 텍스트

// 본문 미리보기
.find('.XEJeYBY31zkS37HszIeB .sds-comps-text-type-body1')

// 블로그 정보
.find('.sds-comps-profile-info-title-text a')

// 썸네일
.find('.sds-comps-image img')
```

### Fallback 셀렉터 전략

HTML 구조 변경에 대응하기 위한 Fallback 목록:

```typescript
// app/constants/_selectors.ts
export const SEARCH_PARTIAL_SELECTORS = [
  '.fds-comps-text',                      // 기본 텍스트 컴포넌트
  '.fds-ugc-single-intention-item-list',  // 인기글 컨테이너 (현재)
  '.sds-comps-text-type-headline1',       // 헤드라인 텍스트
];
```

### 파싱 로직 위치

- **메인 로직**: `app/shared/utils/_popular.ts`
  - `readPopularSection()`: 인기글 섹션 파싱 (주요 함수)
  - `readBlock()`: 레거시 블록 파싱 (하위 호환)
  - `extractPopularItems()`: 최종 export 함수

- **셀렉터 상수**: `app/constants/_selectors.ts`
  - `KEYWORD_HEADER_SELECTOR`: 카테고리 헤더 선택자
  - `SEARCH_PARTIAL_SELECTORS`: Fallback 선택자 목록

- **HTML 유틸리티**: `app/shared/utils/html.ts`
  - `loadHtml()`: Cheerio 로더
  - `extractTextsBySelector()`: 텍스트 추출 헬퍼
  - `buildClassSelector()`: 클래스 선택자 빌더

### 구조 변경 시 대응 방법

네이버 HTML 구조가 변경되어 파싱이 안 될 경우:

1. **브라우저에서 HTML 구조 확인**
   - 개발자 도구로 인기글 섹션 검사
   - 새로운 클래스명 확인

2. **셀렉터 업데이트**
   ```typescript
   // app/shared/utils/_popular.ts - readPopularSection()
   const $popularItems = $section.find('.새로운클래스명');
   ```

3. **Fallback 셀렉터 추가**
   ```typescript
   // app/constants/_selectors.ts
   export const SEARCH_PARTIAL_SELECTORS = [
     '.기존클래스',
     '.새로운클래스',  // 추가
   ];
   ```

4. **테스트 확인**
   ```bash
   # 개발 서버에서 실제 검색 결과로 테스트
   npm run dev
   # http://localhost:4001 접속 후 검색
   ```

5. **문서 업데이트**
   - `CLAUDE.md`: 변경 이력 기록
   - `README.md`: 셀렉터 테이블 업데이트
   - 코드 주석: 날짜와 변경 사유 명시

## ⚠️ 주의사항

### 환경변수 필수
```env
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

### API 제한사항
- 네이버 검색 API: 25,000건/일 제한
- 에러 핸들링 필수 구현

### 코드 품질
- `any` 타입 사용 금지
- 매직넘버 → 상수화
- 중복 로직 → 유틸리티 함수로 추출
- 컴포넌트는 단일 책임 원칙 준수

## 🚀 추천 개발 패턴

### 1. 새 기능 추가 시
1. `features/` 하위에 FSD 구조로 생성
2. Jotai atoms으로 상태 관리
3. API 라우트는 `routes/api.*` 패턴
4. 컴포넌트는 Props interface 필수 정의

### 2. 리팩토링 우선순위
- [ ] `features/naverPopular/` 삭제 (naver-popular만 사용)
- [ ] 공통 타입 정의 `shared/types/`로 이동
- [ ] API 응답 타입 통일
- [ ] 에러 바운더리 구현

---

**네이버 검색 엔진 프로젝트에서 코딩할 때는 이 지침을 반드시 준수하세요! 🎯**
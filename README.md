# Naver Search Engine

네이버 검색 결과를 크롤링하여 인기글을 추출하는 도구입니다.

**배포 URL**: https://naver-search-app-xu8w.vercel.app/

## 주요 기능

- **네이버 인기글 추출**: 검색 결과 페이지를 크롤링하여 인기글(블로그) 섹션 파싱
- **블로그 노출 확인**: 특정 블로그 ID가 인기글에 노출되었는지 자동 확인 + 폭죽 효과
- **최근 검색어 관리**: 검색 히스토리 저장 및 노출 상태(노출/미노출/미확인) 표시
- **블로그 검색 크롤링**: 네이버 블로그 검색 결과 크롤링
- **문서 분석/비교**: 원고 분석 및 문서 비교 기능

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, React Router v7 (SSR) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS v4 |
| State | Jotai (atomic state management) |
| Build | Vite |
| Icons | Lucide React |
| Parsing | Cheerio (HTML parsing/크롤링) |

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버: `http://localhost:4001`

### 3. 프로덕션 빌드

```bash
npm run build
npm run start
```

## 프로젝트 구조

```
app/
├── constants/          # 상수 (headers, selectors, blog-ids)
├── entities/           # 도메인 엔티티
│   └── naver/          # 네이버 관련 타입 및 크롤러
├── features/           # 기능별 모듈 (FSD)
│   ├── naver-popular/  # 인기글 추출 기능 (메인)
│   ├── search/         # 검색 기능
│   ├── doc/            # 문서 분석 기능
│   └── theme/          # 테마 기능
├── routes/             # 페이지 및 API 라우트
├── shared/             # 공유 유틸리티
│   ├── lib/            # 비즈니스 로직
│   ├── store/          # 공통 Jotai atoms
│   ├── ui/             # 공통 UI 컴포넌트
│   └── utils/          # 헬퍼 함수 (파서 포함)
├── widgets/            # 위젯 컴포넌트
├── app.css             # 글로벌 스타일
├── root.tsx            # 루트 레이아웃
└── routes.ts           # 라우트 정의
```

## API 엔드포인트

### 네이버 인기글 크롤링

```
GET /api/naver-popular?q=검색어
GET /api/naver-popular?q=검색어&blog=true
```

**파라미터:**
- `q`: 검색어 (필수)
- `blog`: 블로그 검색 결과 포함 여부 (true/false)
- `url`: 직접 URL 지정 (선택적)

**응답 예시:**
```json
{
  "url": "https://search.naver.com/search.naver?query=검색어",
  "count": 15,
  "items": [
    {
      "title": "게시글 제목",
      "link": "https://blog.naver.com/...",
      "snippet": "본문 미리보기...",
      "group": "건강·의학 인기글",
      "blogLink": "https://blog.naver.com/블로그아이디",
      "blogName": "블로그명"
    }
  ]
}
```

### 블로그 검색 크롤링

```
GET /api/blog-search?q=검색어
```

## 페이지 라우트

| 경로 | 설명 |
|------|------|
| `/` | 네이버 인기글 검색 (홈) |
| `/:keyword` | 키워드 직접 검색 |
| `/search` | 블로그 검색 |
| `/url-search` | URL 검색 |
| `/doc-analyzer` | 문서 분석 |
| `/doc-compare` | 문서 비교 |

## 네이버 인기글 파싱

### 현재 셀렉터 (2025-11-24 기준)

| 셀렉터 | 설명 |
|--------|------|
| `.fds-ugc-single-intention-item-list` | 인기글 리스트 컨테이너 |
| `.oIxNPKojSTvxvkjdwXVC` | 각 인기글 아이템 |
| `a.yUgjyAT8hsQKswX75JB4` | 제목 링크 |
| `.sds-comps-text-type-headline1` | 제목 텍스트 |
| `.q_Caq4prL1xTKuKsMjDN .sds-comps-text-type-body1` | 본문 미리보기 |
| `.sds-comps-profile-info-title-text a` | 블로그 정보 |

### HTML 구조 변경 시 대응

네이버는 검색 결과 HTML을 주기적으로 변경합니다. 파싱이 안 될 경우:

1. 브라우저 개발자 도구로 인기글 섹션 검사
2. `app/shared/utils/parser/selectors/index.ts`에서 셀렉터 업데이트
3. `app/constants/_selectors.ts`에 Fallback 셀렉터 추가
4. `CLAUDE.md` 문서에 변경 이력 기록

## 개발 명령어

```bash
npm run dev        # 개발 서버 (포트 4001)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버
npm run typecheck  # 타입 체크
```

## Docker 배포

```bash
docker build -t naver-search-engine .
docker run -p 3000:3000 naver-search-engine
```

## 라이선스

Private

---

Built with React Router v7

# Naver Search Engine

네이버 검색 API를 사용한 기본적인 검색 엔진 프론트엔드입니다.

- https://naver-search-app-xu8w.vercel.app/

## 설정 방법

1. 네이버 개발자센터에서 애플리케이션 등록
   - https://developers.naver.com/apps/
   - 검색 API 사용 설정

2. 환경변수 설정

   ```bash
   cp .env.example .env
   ```

   `.env` 파일에 네이버 API 키 입력:

   ```
   NAVER_CLIENT_ID=your_client_id
   NAVER_CLIENT_SECRET=your_client_secret
   ```

## Features

- 🔍 네이버 블로그 검색 API 연동
- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📱 반응형 디자인

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## API 엔드포인트

### 블로그 검색

```
GET /api/search?q=검색어&display=10&start=1&sort=sim
```

### 뉴스 검색

```
GET /api/news?q=검색어&display=10&start=1&sort=sim
```

**파라미터:**

- `q`: 검색어 (필수)
- `display`: 검색 결과 개수 (1-100, 기본값: 10)
- `start`: 검색 시작 위치 (1-1000, 기본값: 1)
- `sort`: 정렬 방식 (sim=정확도순, date=날짜순, 기본값: sim)

**응답 예시:**

```json
{
  "total": 12345,
  "start": 1,
  "display": 10,
  "items": [...],
  "query": "검색어",
  "status": 200
}
```

### 네이버 인기글 검색 (웹 스크래핑)

```
GET /api/naver-popular?q=검색어
GET /api/naver-popular?q=검색어&blog=true
```

네이버 검색 결과 페이지에서 "인기글" 섹션을 파싱하여 추출합니다.

**파라미터:**

- `q`: 검색어 (필수)
- `blog`: 블로그 검색 결과 포함 여부 (true/false, 기본값: false)
- `url`: 직접 URL 지정 (선택적, q 대신 사용 가능)

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
      "image": "썸네일 이미지 URL",
      "badge": "",
      "group": "건강·의학 인기글",
      "blogLink": "https://blog.naver.com/블로그아이디",
      "blogName": "블로그명"
    }
  ],
  "status": 200
}
```

### 네이버 검색 결과 텍스트 추출

```
GET /api/naver-search?url=URL&class=클래스명
```

지정된 URL의 HTML에서 특정 클래스명을 가진 요소의 텍스트를 추출합니다.

**파라미터:**

- `url`: 파싱할 URL (필수)
- `class`: 추출할 요소의 클래스명 (선택적, 기본값: `fds-comps-text fds-comps-header-headline pP6CrxLzumAlsR4_qelA`)

**응답 예시:**

```json
{
  "url": "https://search.naver.com/...",
  "className": "fds-comps-text",
  "results": ["텍스트1", "텍스트2", ...],
  "count": 10,
  "status": 200
}
```

## 네이버 인기글 파싱 구조

### HTML 구조 (2025년 10월 기준)

네이버는 검색 결과 페이지의 HTML 구조를 주기적으로 변경합니다. 현재 인기글 섹션 구조:

```html
<div class="fds-ugc-single-intention-item-list">  <!-- 인기글 리스트 컨테이너 -->
  <div class="w0FkNRfc2K6rffX0LJFd">              <!-- 각 인기글 아이템 -->
    <div class="sds-comps-profile">                <!-- 프로필 섹션 -->
      <a href="...">                               <!-- 블로그 링크 -->
        <span class="sds-comps-profile-info-title-text">블로그명</span>
      </a>
    </div>
    <div class="Amt3vrw2_QBkqaI0FchU">            <!-- 콘텐츠 섹션 -->
      <a href="..." class="Pcw4FFPrGxhURyUmBGxh"> <!-- 제목 링크 -->
        <span class="sds-comps-text-type-headline1 sds-comps-text-weight-sm">제목</span>
      </a>
      <div class="XEJeYBY31zkS37HszIeB">          <!-- 미리보기 섹션 -->
        <span class="sds-comps-text-type-body1">본문 미리보기...</span>
      </div>
      <img src="...">                             <!-- 썸네일 이미지 -->
    </div>
  </div>
</div>
```

### 주요 셀렉터

| 셀렉터 | 설명 |
|--------|------|
| `.fds-ugc-single-intention-item-list` | 인기글 리스트 컨테이너 |
| `.w0FkNRfc2K6rffX0LJFd` | 각 인기글 아이템 |
| `.Pcw4FFPrGxhURyUmBGxh` | 제목 링크 엘리먼트 |
| `.sds-comps-text-type-headline1.sds-comps-text-weight-sm` | 제목 텍스트 |
| `.XEJeYBY31zkS37HszIeB` | 본문 미리보기 컨테이너 |
| `.sds-comps-profile-info-title-text a` | 블로그명과 링크 |

### 파싱 로직

파싱 로직은 `app/shared/utils/_popular.ts`의 `readPopularSection` 함수에서 처리됩니다:

1. **인기글 섹션 찾기**: `.fds-ugc-single-intention-item-list` 클래스로 컨테이너 탐색
2. **카테고리명 추출**: 상위 요소에서 "건강·의학 인기글" 같은 헤더 찾기
3. **각 아이템 파싱**: 제목, 링크, 미리보기, 블로그 정보, 썸네일 추출
4. **유효성 검사**: 필수 필드(제목, 링크) 확인 후 결과에 추가

### Fallback 전략

네이버의 HTML 구조 변경에 대응하기 위한 Fallback 셀렉터 목록:

```typescript
// app/constants/_selectors.ts
export const SEARCH_PARTIAL_SELECTORS = [
  '.fds-comps-text',                      // 일반 텍스트 컴포넌트
  '.fds-ugc-single-intention-item-list',  // 인기글 컨테이너 (현재)
  '.sds-comps-text-type-headline1',       // 헤드라인 타입 텍스트
];
```

기본 셀렉터로 찾지 못할 경우 위 목록을 순차적으로 시도합니다.

## API 사용량 제한

네이버 검색 API는 하루 25,000건의 호출 제한이 있습니다.

## 기술 스택

- React Router v7 (Remix 스타일)
- TypeScript
- Tailwind CSS
- Naver Search API

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

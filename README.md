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

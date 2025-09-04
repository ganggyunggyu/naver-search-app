import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/naver-popular.tsx'),
  route('/search', 'routes/search.tsx'),
  route('/naver-extractor', 'routes/naver-extractor.tsx'),
  route('/naver-popular', 'routes/naver-popular.tsx'),

  // API 엔드포인트
  route('/api/search', 'routes/api.search.ts'),
  route('/api/news', 'routes/api.news.ts'),
  route('/api/content', 'routes/api.content.ts'),
  route('/api/naver-search', 'routes/api.naver-search.ts'),
  route('/api/naver-popular', 'routes/api.naver-popular.ts'),
] satisfies RouteConfig;

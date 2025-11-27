import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/naver-popular.tsx'),
  route('/search', 'routes/search.tsx'),
  route('/url-search', 'routes/url-search.tsx'),
  route('/doc-analyzer', 'routes/doc-analyzer.tsx'),
  route('/doc-compare', 'routes/doc-compare.tsx'),

  route('/api/search', 'routes/api.search.ts'),
  route('/api/news', 'routes/api.news.ts'),
  route('/api/content', 'routes/api.content.ts'),
  route('/api/naver-search', 'routes/api.naver-search.ts'),
  route('/api/naver-popular', 'routes/api.naver-popular.ts'),
  route('/api/blog-search', 'routes/api.blog-search.ts'),
  route('/api/analyze-manuscript', 'routes/api.analyze-manuscript.ts'),

  route('/url/:encoded', 'routes/url-search.dynamic.tsx'),
  route('/:keyword', 'routes/naver-popular.dynamic.tsx'),
] satisfies RouteConfig;

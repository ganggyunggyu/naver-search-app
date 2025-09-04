import type { Route } from './+types/naver-popular';
import { useState } from 'react';
import { useToast } from '~/components/Toast';

interface PopularItem {
  title: string;
  link: string;
  snippet?: string;
  image?: string;
  badge?: string;
  group?: string;
}

interface PopularResponse {
  url: string;
  count: number;
  items: PopularItem[];
  status: number;
  error?: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Naver 인기글 추출' },
    {
      name: 'description',
      content: '네이버 검색 결과의 인기글(블로그) 요소를 추출합니다.',
    },
  ];
}

export default function NaverPopularPage() {
  const [query, setQuery] = useState('');
  const [useAutoUrl, setUseAutoUrl] = useState(true);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PopularResponse | null>(null);
  const [error, setError] = useState<string>('');
  const { show } = useToast();

  const generateNaverUrl = (q: string) =>
    `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(q)}`;

  const fetchPopular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    try {
      const endpoint = useAutoUrl
        ? `/api/naver-popular?q=${encodeURIComponent(query.trim())}`
        : `/api/naver-popular?url=${encodeURIComponent(url.trim())}`;
      const res = await fetch(endpoint);
      const json: PopularResponse = await res.json();
      if ((json as any).error) {
        setError((json as any).error);
        show(String((json as any).error), { type: 'error' });
      } else {
        setData(json);
        show(`인기글 ${json.count}개 추출 완료`, { type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setError('요청 중 오류가 발생했습니다.');
      show('요청 중 오류가 발생했습니다.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyPreview = async (item: PopularItem) => {
    const cleanTitle = item.title.replace(/\s+/g, ' ').trim();
    const cleanSnippet = item.snippet
      ? item.snippet.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
      : '';

    const plain = [cleanTitle, cleanSnippet, item.link]
      .filter(Boolean)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(plain);
      show('미리보기가 복사되었습니다!', { type: 'success' });
    } catch {
      show('복사 실패', { type: 'error' });
    }
  };

  const copyFullContent = async (link: string) => {
    try {
      const res = await fetch(`/api/content?url=${encodeURIComponent(link)}`);
      const json = await res.json();
      if (json.error) {
        show(String(json.error), { type: 'error' });
        return;
      }

      const cleanTitle = json.title
        ? String(json.title)
            .replace(/[ \t\f\v\u00A0]+/g, ' ')
            .trim()
        : '';

      const cleanContent = json.content
        ? String(json.content)
            .replace(/\r\n?/g, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;|&#39;/g, "'")
            .replace(/[ \t\f\v\u00A0]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .split('\n')
            .map((l) => l.replace(/[ \t\f\v\u00A0]+$/g, ''))
            .join('\n')
            .trim()
        : '';

      const full = [cleanTitle, cleanContent].filter(Boolean).join('\n\n');

      await navigator.clipboard.writeText(full);
      show('전체 본문이 복사되었습니다!', { type: 'success' });
    } catch {
      show('전체 본문 복사 실패', { type: 'error' });
    }
  };

  return (
    <div className="relative py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-gradient-to-br from-green-200/40 via-blue-200/30 to-transparent blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            네이버 인기글 추출
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            네이버 검색 결과에서 인기 키워드별 블로그 글을 추출합니다
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUseAutoUrl(true)}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${
                useAutoUrl
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <svg
                className="inline-block w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              검색어로 자동생성
            </button>
            <button
              type="button"
              onClick={() => setUseAutoUrl(false)}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${
                !useAutoUrl
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <svg
                className="inline-block w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              직접 URL 입력
            </button>
          </div>

          <form onSubmit={fetchPopular} className="space-y-4">
            {useAutoUrl ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  검색어
                </label>
                <div className="group flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 shadow-sm transition focus-within:ring-2 focus-within:ring-green-500">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="예: 라미네이트"
                    className="flex-1 px-4 py-3 rounded-xl bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none"
                  />
                </div>
                {query && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      생성될 URL:{' '}
                      <span className="break-all font-mono">
                        {generateNaverUrl(query)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  네이버 검색 URL
                </label>
                <div className="group flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 shadow-sm transition focus-within:ring-2 focus-within:ring-green-500">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://search.naver.com/search.naver?..."
                    className="flex-1 px-4 py-3 rounded-xl bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (useAutoUrl ? !query.trim() : !url.trim())}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:bg-gray-400 font-medium shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-200 active:scale-[.99]"
            >
              {loading ? (
                <>
                  <svg
                    className="inline-block w-5 h-5 mr-2 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  추출 중...
                </>
              ) : (
                <>
                  <svg
                    className="inline-block w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  인기글 가져오기
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {data && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                인기글 결과
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  {data.count}개
                </span>
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 break-all max-w-xs truncate">
                {data.url}
              </span>
            </div>

            {data.items.length ? (
              (() => {
                const groupedItems = data.items.reduce(
                  (acc, item) => {
                    const keyword = item.group || '기타';
                    if (!acc[keyword]) acc[keyword] = [];
                    acc[keyword].push(item);
                    return acc;
                  },
                  {} as Record<string, PopularItem[]>
                );

                const groups = Object.entries(groupedItems);

                return (
                  <div className="space-y-8">
                    {groups.map(([keyword, items]) => (
                      <div
                        key={keyword}
                        className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <svg
                              className="w-6 h-6 text-orange-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {keyword}
                            <span className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full border border-green-200 dark:border-green-800">
                              {items.length}개 발견
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 hover:shadow-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
                                  >
                                    {item.title}
                                  </a>
                                  {item.badge && (
                                    <span className="ml-3 text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1.5 rounded-full font-medium border border-yellow-200 dark:border-yellow-700 shadow-sm flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.snippet && (
                                    <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
                                      {item.snippet}
                                    </p>
                                  )}
                                  <p className="mt-3 text-xs text-green-600 dark:text-green-400 break-all font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                    <svg
                                      className="inline-block w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                      />
                                    </svg>
                                    {item.link}
                                  </p>
                                </div>
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt="thumb"
                                    className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow"
                                  />
                                )}
                              </div>
                              <div className="mt-4 flex gap-3">
                                <button
                                  onClick={() => copyPreview(item)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-sm"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                  미리보기 복사
                                </button>
                                {item.link.includes('blog.naver.com') && (
                                  <button
                                    onClick={() => copyFullContent(item.link)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-700 transition-all hover:shadow-sm"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    전체 본문 복사
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  인기글을 찾지 못했습니다
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  다른 키워드로 검색해보세요
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

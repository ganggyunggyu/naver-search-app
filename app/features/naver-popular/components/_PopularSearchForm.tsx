import React from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { useToast } from '@/shared/ui/Toast';
import { usePopularActions, useRecentSearch } from '../hooks';
import {
  popularQueryAtom,
  popularIsAutoUrlAtom,
  popularUrlAtom,
  popularIsLoadingAtom,
} from '../store';

export const PopularSearchForm: React.FC = () => {
  const [query, setQuery] = useAtom(popularQueryAtom);
  const [isAutoUrl, setIsAutoUrl] = useAtom(popularIsAutoUrlAtom);
  const [url, setUrl] = useAtom(popularUrlAtom);
  const [isLoading] = useAtom(popularIsLoadingAtom);
  const { generateNaverUrl } = usePopularActions();
  const { recentSearchList, addRecentSearch, clearRecentSearch } = useRecentSearch();
  const { show } = useToast();
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setIsAutoUrl(true)}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${
            isAutoUrl
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          검색어로 자동생성
        </button>
        <button
          type="button"
          onClick={() => setIsAutoUrl(false)}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${
            !isAutoUrl
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          직접 URL 입력
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isAutoUrl) {
            const qq = (query || '').trim();
            if (!qq) return;
            addRecentSearch(qq);
            navigate(`/${encodeURIComponent(qq)}`);
          } else {
            const u = (url || '').trim();
            if (!u) return;
            navigate(`/url/${encodeURIComponent(u)}`);
          }
        }}
        className="space-y-4"
      >
        {isAutoUrl ? (
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
          disabled={isLoading || (isAutoUrl ? !query.trim() : !url.trim())}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:bg-gray-400 font-medium shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-200 active:scale-[.99]"
        >
          {isLoading
            ? '추출 중...'
            : isAutoUrl
              ? '인기글 + 블로그 검색 🕷️'
              : '인기글 가져오기'}
        </button>
      </form>
      {isAutoUrl && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              최근 검색어
            </span>
            {recentSearchList.length > 0 && (
              <button
                type="button"
                onClick={clearRecentSearch}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                전체 삭제
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {recentSearchList.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => navigate(`/${encodeURIComponent(q)}`)}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap flex-shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
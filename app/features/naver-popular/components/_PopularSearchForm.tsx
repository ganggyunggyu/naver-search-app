import React from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { cn, Chip, Button } from '@/shared';
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
    <div className={cn(
      "bg-white dark:bg-gray-900 rounded-2xl shadow-lg",
      "p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700"
    )}>
      <div className={cn("flex gap-2 sm:gap-3 mb-4 sm:mb-6")}>
        <button
          type="button"
          onClick={() => setIsAutoUrl(true)}
          className={cn(
            "flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition",
            "text-sm sm:text-base",
            isAutoUrl
              ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
        >
          <span className="hidden sm:inline">검색어로 자동생성</span>
          <span className="sm:hidden">자동생성</span>
        </button>
        <button
          type="button"
          onClick={() => setIsAutoUrl(false)}
          className={cn(
            "flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition",
            "text-sm sm:text-base",
            !isAutoUrl
              ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
        >
          <span className="hidden sm:inline">직접 URL 입력</span>
          <span className="sm:hidden">URL 입력</span>
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
        className={cn("space-y-3 sm:space-y-4")}
      >
        {isAutoUrl ? (
          <div>
            <label className={cn(
              "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300",
              "mb-2 sm:mb-3"
            )}>
              검색어
            </label>
            <div className={cn(
              "group flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-800 p-1.5 sm:p-2 shadow-sm transition",
              "focus-within:ring-2 focus-within:ring-green-500"
            )}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 라미네이트"
                className={cn(
                  "flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-transparent",
                  "text-gray-900 dark:text-gray-100 placeholder:text-gray-500",
                  "text-sm sm:text-base focus:outline-none"
                )}
              />
            </div>
            {query && (
              <div className={cn(
                "mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
              )}>
                <p className={cn("text-xs text-gray-600 dark:text-gray-400")}>
                  생성될 URL:{' '}
                  <span className={cn("break-all font-mono")}>
                    {generateNaverUrl(query)}
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className={cn(
              "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300",
              "mb-2 sm:mb-3"
            )}>
              네이버 검색 URL
            </label>
            <div className={cn(
              "group flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-800 p-1.5 sm:p-2 shadow-sm transition",
              "focus-within:ring-2 focus-within:ring-green-500"
            )}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://search.naver.com/search.naver?..."
                className={cn(
                  "flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-transparent",
                  "text-gray-900 dark:text-gray-100 placeholder:text-gray-500",
                  "text-sm sm:text-base focus:outline-none"
                )}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (isAutoUrl ? !query.trim() : !url.trim())}
          className={cn(
            "w-full px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white rounded-2xl",
            "hover:bg-green-700 disabled:bg-gray-400 font-medium",
            "shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30",
            "transition-all duration-200 active:scale-[.99]",
            "text-sm sm:text-base"
          )}
        >
          {isLoading
            ? '추출 중...'
            : isAutoUrl
              ? <React.Fragment>
                  <span className="hidden sm:inline">인기글 + 블로그 검색</span>
                  <span className="sm:hidden">검색 시작</span>
                </React.Fragment>
              : <React.Fragment>
                  <span className="hidden sm:inline">인기글 가져오기</span>
                  <span className="sm:hidden">가져오기</span>
                </React.Fragment>}
        </button>
      </form>
      {isAutoUrl && (
        <div className={cn("mt-4 sm:mt-6 py-3 sm:py-4 pb-4 sm:pb-6")}>
          <div className={cn("flex items-center justify-between mb-3 sm:mb-4")}>
            <span className={cn("text-xs sm:text-sm text-gray-600 dark:text-gray-400")}>
              최근 검색어
            </span>
            {recentSearchList.length > 0 && (
              <button
                type="button"
                onClick={clearRecentSearch}
                className={cn(
                  "text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                  "transition-colors"
                )}
              >
                전체 삭제
              </button>
            )}
          </div>
          <div className={cn(
            "flex gap-2 overflow-x-auto py-2",
            "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          )}>
            {recentSearchList.map((q) => (
              <Chip
                key={q}
                variant="secondary"
                size="md"
                onClick={() => navigate(`/${encodeURIComponent(q)}`)}
              >
                {q}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
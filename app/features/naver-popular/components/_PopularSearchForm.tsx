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
  const { recentSearchList, addRecentSearch, clearRecentSearch } =
    useRecentSearch();
  const { show } = useToast();
  const navigate = useNavigate();

  // Hydration 오류 방지: 클라이언트에서만 렌더링
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className={cn(
        'bg-white dark:bg-black rounded-2xl border',
        'border-gray-200 dark:border-gray-800',
        'p-6 mb-12 shadow-sm hover:shadow-md transition-shadow duration-200'
      )}
    >
      {/* 헤더 */}
      <div className={cn('mb-6')}>
        <h2 className={cn('text-xl font-bold text-black dark:text-white mb-2')}>
          검색 설정
        </h2>
        <p className={cn('text-sm text-gray-600 dark:text-gray-400')}>
          검색어를 입력하거나 직접 네이버 URL을 붙여넣으세요
        </p>
      </div>

      {/* 탭 버튼 */}
      <div
        className={cn(
          'flex gap-1 mb-6 p-1 rounded-lg',
          'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
        )}
      >
        <button
          type="button"
          onClick={() => setIsAutoUrl(true)}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-md font-medium transition-all duration-200',
            'text-sm',
            isAutoUrl
              ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm border border-gray-200 dark:border-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          )}
        >
          <span className="hidden sm:inline">검색어 자동생성</span>
          <span className="sm:hidden">자동생성</span>
        </button>
        <button
          type="button"
          onClick={() => setIsAutoUrl(false)}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-md font-medium transition-all duration-200',
            'text-sm',
            !isAutoUrl
              ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm border border-gray-200 dark:border-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
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
        className={cn('space-y-3 sm:space-y-4')}
      >
        {isAutoUrl ? (
          <div>
            <label
              className={cn(
                'block text-sm font-medium text-black dark:text-white mb-3'
              )}
            >
              검색어
            </label>
            <div
              className={cn(
                'relative rounded-lg border transition-all duration-200',
                'border-gray-300 dark:border-gray-700',
                'focus-within:border-black dark:focus-within:border-white',
                'focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white'
              )}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 라미네이트"
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-white dark:bg-black',
                  'text-black dark:text-white placeholder:text-gray-500',
                  'text-sm focus:outline-none'
                )}
              />
            </div>
          </div>
        ) : (
          <div>
            <label
              className={cn(
                'block text-sm font-medium text-black dark:text-white mb-3'
              )}
            >
              네이버 검색 URL
            </label>
            <div
              className={cn(
                'relative rounded-lg border transition-all duration-200',
                'border-gray-300 dark:border-gray-700',
                'focus-within:border-black dark:focus-within:border-white',
                'focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white'
              )}
            >
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://search.naver.com/search.naver?..."
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-white dark:bg-black',
                  'text-black dark:text-white placeholder:text-gray-500',
                  'text-sm focus:outline-none'
                )}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (isAutoUrl ? !query.trim() : !url.trim())}
          className={cn(
            'w-full px-6 py-4 rounded-lg font-medium transition-all duration-200',
            'text-sm relative overflow-hidden',
            'bg-black dark:bg-white text-white dark:text-black',
            'hover:bg-gray-800 dark:hover:bg-gray-200',
            'disabled:bg-gray-300 dark:disabled:bg-gray-700',
            'disabled:text-gray-500 dark:disabled:text-gray-400',
            'disabled:cursor-not-allowed',
            'active:scale-[0.98] shadow-sm hover:shadow-md'
          )}
        >
          <div className={cn('flex items-center justify-center gap-2')}>
            {isLoading && (
              <div
                className={cn(
                  'w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin'
                )}
              />
            )}
            {isLoading ? (
              '분석 중...'
            ) : isAutoUrl ? (
              <React.Fragment>
                <span className="hidden sm:inline">
                  인기글 + 블로그 검색 시작
                </span>
                <span className="sm:hidden">검색 시작</span>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <span className="hidden sm:inline">인기글 추출하기</span>
                <span className="sm:hidden">추출하기</span>
              </React.Fragment>
            )}
          </div>
        </button>
      </form>
      {isAutoUrl && (
        <div
          className={cn(
            'mt-6 pt-6 border-t border-gray-200 dark:border-gray-800'
          )}
        >
          <div className={cn('flex items-center justify-between mb-4')}>
            <h3
              className={cn('text-sm font-medium text-black dark:text-white')}
            >
              최근 검색어
            </h3>
            {isClient && recentSearchList.length > 0 && (
              <button
                type="button"
                onClick={clearRecentSearch}
                className={cn(
                  'text-xs text-gray-500 hover:text-black dark:hover:text-white',
                  'transition-colors font-medium'
                )}
              >
                전체 삭제
              </button>
            )}
          </div>

          {isClient && recentSearchList.length > 0 ? (
            <div
              className={cn(
                'flex gap-2 overflow-x-auto py-1',
                'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent'
              )}
            >
              {recentSearchList.map((q) => (
                <button
                  key={q}
                  onClick={() => navigate(`/${encodeURIComponent(q)}`)}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium',
                    'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
                    'hover:bg-gray-200 dark:hover:bg-gray-800',
                    'border border-gray-200 dark:border-gray-800',
                    'transition-colors duration-200'
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          ) : isClient ? (
            <div
              className={cn(
                'text-center py-4 text-sm text-gray-500 dark:text-gray-400'
              )}
            >
              아직 검색 기록이 없습니다
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

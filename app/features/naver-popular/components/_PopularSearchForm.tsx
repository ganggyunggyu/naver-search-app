import React from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { X, ExternalLink, Search, Edit3 } from 'lucide-react';
import { cn } from '@/shared';
import { useRecentSearch } from '../hooks';
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
  const {
    recentSearchList,
    addRecentSearch,
    clearRecentSearch,
    removeRecentSearch,
  } = useRecentSearch();
  const navigate = useNavigate();

  const [isClient, setIsClient] = React.useState(false);
  const [showAutocomplete, setShowAutocomplete] = React.useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredSuggestions = React.useMemo(() => {
    if (!query.trim()) return [];
    return recentSearchList.filter((item) =>
      item.query.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, recentSearchList]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      const selected = filteredSuggestions[selectedSuggestionIndex];
      setQuery(selected.query);
      setShowAutocomplete(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setSelectedSuggestionIndex(-1);
    }
  };

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
            <div className="relative">
              <div
                className={cn(
                  'relative rounded-lg border transition-all duration-200',
                  'border-gray-300 dark:border-gray-700',
                  'focus-within:border-black dark:focus-within:border-white',
                  'focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white'
                )}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowAutocomplete(true);
                    setSelectedSuggestionIndex(-1);
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  onBlur={() => {
                    setTimeout(() => setShowAutocomplete(false), 200);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="예: 라미네이트"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg bg-white dark:bg-black',
                    'text-black dark:text-white placeholder:text-gray-500',
                    'text-base focus:outline-none'
                  )}
                  autoComplete="off"
                />
              </div>

              {isClient &&
                showAutocomplete &&
                filteredSuggestions.length > 0 && (
                  <div
                    className={cn(
                      'absolute z-50 w-full mt-2 py-1 rounded-lg',
                      'bg-white dark:bg-black',
                      'border border-gray-200 dark:border-gray-800',
                      'shadow-lg max-h-64 overflow-y-auto'
                    )}
                  >
                    {filteredSuggestions.map((item, index) => (
                      <button
                        key={item.query}
                        type="button"
                        onClick={() => {
                          setQuery(item.query);
                          setShowAutocomplete(false);
                          setSelectedSuggestionIndex(-1);
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-sm text-left transition-colors',
                          'text-gray-900 dark:text-gray-100',
                          index === selectedSuggestionIndex
                            ? 'bg-gray-100 dark:bg-gray-900'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                        )}
                      >
                        {item.query}
                      </button>
                    ))}
                  </div>
                )}
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
                  'text-base focus:outline-none'
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

        {/* 네이버 다이렉트 버튼들 */}
        {isAutoUrl && query.trim() && (
          <div className={cn('flex gap-2 mt-4')}>
            <button
              type="button"
              onClick={() => {
                const searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(query.trim())}`;
                window.open(searchUrl, '_blank', 'noopener,noreferrer');
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                'text-sm font-medium transition-all duration-200',
                'bg-green-500 hover:bg-green-600 text-white',
                'shadow-sm hover:shadow-md active:scale-[0.98]'
              )}
            >
              <Search size={16} />
              <span className="hidden sm:inline">네이버 통합검색</span>
              <span className="sm:hidden">통합검색</span>
              <ExternalLink size={12} className="opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => {
                const blogUrl = `https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query=${encodeURIComponent(query.trim())}`;
                window.open(blogUrl, '_blank', 'noopener,noreferrer');
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                'text-sm font-medium transition-all duration-200',
                'bg-blue-500 hover:bg-blue-600 text-white',
                'shadow-sm hover:shadow-md active:scale-[0.98]'
              )}
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">네이버 블로그</span>
              <span className="sm:hidden">블로그</span>
              <ExternalLink size={12} className="opacity-70" />
            </button>
          </div>
        )}
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
            <div className={cn('space-y-4')}>
              {/* 미노출 섹션 */}
              {recentSearchList.filter((item) => item.hasExposure === false).length > 0 && (
                <div>
                  <div className={cn('text-xs text-red-600 dark:text-red-400 mb-2 font-medium')}>
                    미노출 ({recentSearchList.filter((item) => item.hasExposure === false).length})
                  </div>
                  <div className={cn('flex gap-2 flex-wrap')}>
                    {recentSearchList
                      .filter((item) => item.hasExposure === false)
                      .map((item) => (
                        <div
                          key={item.query}
                          className={cn(
                            'group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium',
                            'border transition-all duration-200',
                            'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                          )}
                        >
                          <button
                            onClick={() => navigate(`/${encodeURIComponent(item.query)}`)}
                            className={cn('hover:opacity-70 transition-opacity')}
                          >
                            {item.query}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(item.query);
                            }}
                            className={cn(
                              'ml-1 w-3 h-3 flex items-center justify-center rounded-full',
                              'hover:bg-black/10 dark:hover:bg-white/10',
                              'opacity-0 group-hover:opacity-100 transition-opacity'
                            )}
                            aria-label={`${item.query} 검색어 삭제`}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 노출 섹션 */}
              {recentSearchList.filter((item) => item.hasExposure === true).length > 0 && (
                <div>
                  <div className={cn('text-xs text-green-600 dark:text-green-400 mb-2 font-medium')}>
                    노출 ({recentSearchList.filter((item) => item.hasExposure === true).length})
                  </div>
                  <div className={cn('flex gap-2 flex-wrap')}>
                    {recentSearchList
                      .filter((item) => item.hasExposure === true)
                      .map((item) => (
                        <div
                          key={item.query}
                          className={cn(
                            'group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium',
                            'border transition-all duration-200',
                            'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                          )}
                        >
                          <button
                            onClick={() => navigate(`/${encodeURIComponent(item.query)}`)}
                            className={cn('hover:opacity-70 transition-opacity')}
                          >
                            {item.query}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(item.query);
                            }}
                            className={cn(
                              'ml-1 w-3 h-3 flex items-center justify-center rounded-full',
                              'hover:bg-black/10 dark:hover:bg-white/10',
                              'opacity-0 group-hover:opacity-100 transition-opacity'
                            )}
                            aria-label={`${item.query} 검색어 삭제`}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 미확인 섹션 */}
              {recentSearchList.filter((item) => item.hasExposure === undefined).length > 0 && (
                <div>
                  <div className={cn('text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium')}>
                    미확인 ({recentSearchList.filter((item) => item.hasExposure === undefined).length})
                  </div>
                  <div className={cn('flex gap-2 flex-wrap')}>
                    {recentSearchList
                      .filter((item) => item.hasExposure === undefined)
                      .map((item) => (
                        <div
                          key={item.query}
                          className={cn(
                            'group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium',
                            'border transition-all duration-200',
                            'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                          )}
                        >
                          <button
                            onClick={() => navigate(`/${encodeURIComponent(item.query)}`)}
                            className={cn('hover:opacity-70 transition-opacity')}
                          >
                            {item.query}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(item.query);
                            }}
                            className={cn(
                              'ml-1 w-3 h-3 flex items-center justify-center rounded-full',
                              'hover:bg-black/10 dark:hover:bg-white/10',
                              'opacity-0 group-hover:opacity-100 transition-opacity'
                            )}
                            aria-label={`${item.query} 검색어 삭제`}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
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

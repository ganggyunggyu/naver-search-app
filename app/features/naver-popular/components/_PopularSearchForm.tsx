import React from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { ExternalLink, Search, Loader2 } from 'lucide-react';
import { useRecentSearch } from '../hooks';
import {
  popularQueryAtom,
  popularIsAutoUrlAtom,
  popularUrlAtom,
  popularIsLoadingAtom,
} from '../store';
import { RecentSearchSection } from './_RecentSearchSection';
import { Button } from '@/shared/ui';

interface PopularSearchFormProps {
  children?: React.ReactNode;
}

export const PopularSearchForm: React.FC<PopularSearchFormProps> = ({
  children,
}) => {
  const [query, setQuery] = useAtom(popularQueryAtom);
  const [isAutoUrl, setIsAutoUrl] = useAtom(popularIsAutoUrlAtom);
  const [url, setUrl] = useAtom(popularUrlAtom);
  const [isLoading] = useAtom(popularIsLoadingAtom);
  const {
    recentSearchList,
    clearRecentSearch,
    removeRecentSearch,
    clearByExposure,
  } = useRecentSearch();
  const navigate = useNavigate();

  const [isClient, setIsClient] = React.useState(false);
  const [showAutocomplete, setShowAutocomplete] = React.useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    React.useState(-1);
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
    <div className="p-4 sm:p-6 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          검색 설정
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          검색어를 입력하거나 직접 네이버 URL을 붙여넣으세요
        </p>
      </div>

      <div className="flex gap-2 p-1 rounded-lg bg-[var(--color-bg-tertiary)] mb-4">
        <button
          type="button"
          onClick={() => setIsAutoUrl(true)}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            isAutoUrl
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <span className="hidden sm:inline">검색어 자동생성</span>
          <span className="sm:hidden">자동생성</span>
        </button>
        <button
          type="button"
          onClick={() => setIsAutoUrl(false)}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            !isAutoUrl
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
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
            navigate(`/${encodeURIComponent(qq)}`);
          } else {
            const u = (url || '').trim();
            if (!u) return;
            navigate(`/url/${encodeURIComponent(u)}`);
          }
        }}
      >
        {isAutoUrl ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              검색어
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
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
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus)] transition-all"
                />

                {isClient &&
                  showAutocomplete &&
                  filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg">
                      {filteredSuggestions.map((item, index) => (
                        <button
                          key={item.query}
                          type="button"
                          onClick={() => {
                            setQuery(item.query);
                            setShowAutocomplete(false);
                            setSelectedSuggestionIndex(-1);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            index === selectedSuggestionIndex
                              ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                          }`}
                        >
                          {item.query}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !query.trim()}
                icon={
                  isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Search size={18} className="sm:hidden" />
                  )
                }
                className="w-full sm:w-auto shrink-0"
              >
                {isLoading ? (
                  <span className="sm:hidden">분석 중</span>
                ) : (
                  <span className="hidden sm:inline">검색 시작</span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              네이버 검색 URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://search.naver.com/search.naver?..."
                className="flex-1 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus)] transition-all"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !url.trim()}
                icon={
                  isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Search size={18} className="sm:hidden" />
                  )
                }
                className="w-full sm:w-auto shrink-0"
              >
                {isLoading ? (
                  <span className="sm:hidden">분석 중</span>
                ) : (
                  <span className="hidden sm:inline">추출하기</span>
                )}
              </Button>
            </div>
          </div>
        )}

        {isAutoUrl && query.trim() && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={<ExternalLink size={14} />}
              onClick={() => {
                const searchUrl = `https://m.search.naver.com/search.naver?query=${encodeURIComponent(query.trim())}`;
                window.open(searchUrl, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1"
            >
              네이버 통검
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={<ExternalLink size={14} />}
              onClick={() => {
                const blogUrl = `https://m.search.naver.com/search.naver?ssc=tab.m_blog.all&sm=mtb_jum&query=${encodeURIComponent(query.trim())}`;
                window.open(blogUrl, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1"
            >
              블로그
            </Button>
          </div>
        )}
      </form>

      {children}

      {isAutoUrl && (
        <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              최근 검색어
            </h3>
            {isClient && recentSearchList.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearch}
                className="text-xs! text-text-tertiary! hover:text-error!"
              >
                전체 삭제
              </Button>
            )}
          </div>

          {isClient && recentSearchList.length > 0 ? (
            <div className="flex flex-col gap-3">
              <RecentSearchSection
                title="미노출"
                items={recentSearchList.filter(
                  (item) => item.hasExposure === false
                )}
                status="notExposed"
                onRemove={removeRecentSearch}
                onClearSection={() => clearByExposure(false)}
              />
              <RecentSearchSection
                title="노출"
                items={recentSearchList.filter(
                  (item) => item.hasExposure === true
                )}
                status="exposed"
                onRemove={removeRecentSearch}
                onClearSection={() => clearByExposure(true)}
              />
              <RecentSearchSection
                title="미확인"
                items={recentSearchList.filter(
                  (item) => item.hasExposure === undefined
                )}
                status="unchecked"
                onRemove={removeRecentSearch}
                onClearSection={() => clearByExposure(undefined)}
              />
            </div>
          ) : isClient ? (
            <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">
              아직 검색 기록이 없습니다
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

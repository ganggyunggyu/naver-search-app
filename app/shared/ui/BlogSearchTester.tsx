import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

export const BlogSearchTester: React.FC = () => {
  const { show } = useToast();
  const [keyword, setKeyword] = React.useState<string>('리액트');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleBlogSearch = async () => {
    if (!keyword.trim()) {
      show('검색 키워드를 입력해주세요!', { type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/blog-search?query=${encodeURIComponent(keyword)}&display=5&log=true`);
      const result = await response.json();

      if (result.success) {
        show(`"${keyword}" 검색 완료! 콘솔을 확인하세요`, { type: 'success' });
      } else {
        show('검색 실패!', { type: 'error' });
        console.error('[ERROR] 검색 실패:', result);
      }
    } catch (error) {
      show('API 호출 중 오류 발생!', { type: 'error' });
      console.error('[ERROR] API 호출 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (quickKeyword: string) => {
    setKeyword(quickKeyword);
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-success-soft)] flex items-center justify-center">
          <Search size={20} className="text-[var(--color-success)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          네이버 블로그 검색 테스터
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="blog-keyword"
            className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5"
          >
            검색 키워드
          </label>
          <input
            id="blog-keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleBlogSearch()}
            placeholder="검색할 키워드를 입력하세요 (예: 리액트, 자바스크립트)"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus)] transition-all disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--color-text-secondary)]">빠른 검색:</span>
          {['리액트', '자바스크립트', 'TypeScript', 'Next.js', 'Vue.js'].map((quick) => (
            <button
              key={quick}
              onClick={() => handleQuickSearch(quick)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
            >
              {quick}
            </button>
          ))}
        </div>

        <button
          onClick={handleBlogSearch}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg bg-[var(--color-success)] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              검색 중...
            </>
          ) : (
            '블로그 검색하기'
          )}
        </button>

        <div className="p-3 rounded-lg bg-[var(--color-info-soft)] text-sm text-[var(--color-info)]">
          <p className="font-medium">사용법:</p>
          <p className="mt-1 opacity-80">
            검색 버튼을 클릭하면 콘솔(F12)에 네이버 블로그 검색 결과가 출력됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

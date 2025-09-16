import React from 'react';
import { Search, Rocket, Target, X } from 'lucide-react';
import { useToast } from './Toast';

interface BlogSearchTesterProps {
  className?: string;
}

export const BlogSearchTester: React.FC<BlogSearchTesterProps> = ({ className }) => {
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
      console.log('[SEARCH] 블로그 검색 테스트 시작...');
      
      const response = await fetch(`/api/blog-search?query=${encodeURIComponent(keyword)}&display=5&log=true`);
      const result = await response.json();

      if (result.success) {
        show(`"${keyword}" 검색 완료! 콘솔을 확인하세요`, { type: 'success' });
        
        // 추가로 콘솔에 간단한 정보 출력
        console.log('[RESULT] API 응답 결과:', result);
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
    <React.Fragment>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm ${className || ''}`}>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            네이버 블로그 검색 테스터
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="blog-keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              검색 키워드
            </label>
            <input
              id="blog-keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleBlogSearch()}
              placeholder="검색할 키워드를 입력하세요 (예: 리액트, 자바스크립트)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">빠른 검색:</span>
            {['리액트', '자바스크립트', 'TypeScript', 'Next.js', 'Vue.js'].map((quick) => (
              <button
                key={quick}
                onClick={() => handleQuickSearch(quick)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {quick}
              </button>
            ))}
          </div>

          
          <button
            onClick={handleBlogSearch}
            disabled={isLoading}
            className={`w-full px-6 py-3 font-medium rounded-xl transition-all ${
              isLoading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isLoading ? '검색 중...' : '블로그 검색하기'}
          </button>

          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>사용법:</strong> 검색 버튼을 클릭하면 콘솔(F12)에 네이버 블로그 검색 결과가 예쁘게 출력됩니다!
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              개발자 도구(F12) → Console 탭에서 확인하세요
            </p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
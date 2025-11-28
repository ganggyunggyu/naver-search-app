import React from 'react';
import { Search } from 'lucide-react';
import { useToast } from './Toast';

interface BlogSearchTesterProps {}

export const BlogSearchTester: React.FC<BlogSearchTesterProps> = () => {
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
    <React.Fragment>
      <div>
        <div>
          <Search />
          <h3>네이버 블로그 검색 테스터</h3>
        </div>

        <div>
          <div>
            <label htmlFor="blog-keyword">검색 키워드</label>
            <input
              id="blog-keyword"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleBlogSearch()}
              placeholder="검색할 키워드를 입력하세요 (예: 리액트, 자바스크립트)"
              disabled={isLoading}
            />
          </div>

          <div>
            <span>빠른 검색:</span>
            {['리액트', '자바스크립트', 'TypeScript', 'Next.js', 'Vue.js'].map((quick) => (
              <button
                key={quick}
                onClick={() => handleQuickSearch(quick)}
                disabled={isLoading}
              >
                {quick}
              </button>
            ))}
          </div>

          <button onClick={handleBlogSearch} disabled={isLoading}>
            {isLoading ? '검색 중...' : '블로그 검색하기'}
          </button>

          <div>
            <p>
              <strong>사용법:</strong> 검색 버튼을 클릭하면 콘솔(F12)에 네이버 블로그 검색 결과가 예쁘게 출력됩니다!
            </p>
            <p>개발자 도구(F12) → Console 탭에서 확인하세요</p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
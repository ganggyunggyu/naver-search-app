import type { Route } from './+types/naver-extractor';
import { useState } from 'react';
import { useToast } from '@/components/Toast';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Naver Mobile Search Extractor' },
    {
      name: 'description',
      content: 'Extract text from Naver mobile search results',
    },
  ];
}

interface ExtractionResult {
  url: string;
  className: string;
  results: string[];
  count: number;
  status: number;
}

// 네이버 검색 결과 클래스 목록
const NAVER_CLASS_OPTIONS = [
  {
    label: '인기글/추천글',
    value: 'fds-comps-text fds-comps-header-headline pP6CrxLzumAlsR4_qelA',
    description: '네이버 검색 결과의 인기글/추천글 제목',
  },
  {
    label: '일반 검색 결과 제목',
    value: 'fds-comps-text fds-comps-header-headline _2FC9jXOgF3yE5OOGgd8Cr',
    description: '네이버 검색 결과의 일반 제목',
  },
  {
    label: '블로그 제목',
    value: 'total_tit',
    description: '네이버 블로그 검색 결과 제목',
  },
  {
    label: '뉴스 제목',
    value: 'news_tit',
    description: '네이버 뉴스 검색 결과 제목',
  },
  {
    label: '카페 글 제목',
    value: 'cafe_tit',
    description: '네이버 카페 검색 결과 제목',
  },
  {
    label: '사용자 정의',
    value: 'custom',
    description: '직접 클래스명 입력',
  },
];

export default function NaverExtractor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [url, setUrl] = useState('');
  const [useAutoUrl, setUseAutoUrl] = useState(true);
  const [selectedClassType, setSelectedClassType] = useState('인기글/추천글');
  const [customClassName, setCustomClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState('');
  const { show } = useToast();

  // 현재 선택된 클래스명 가져오기
  const getCurrentClassName = () => {
    const selectedOption = NAVER_CLASS_OPTIONS.find(
      (option) => option.label === selectedClassType
    );
    if (selectedOption?.value === 'custom') {
      return customClassName;
    }
    return selectedOption?.value || NAVER_CLASS_OPTIONS[0].value;
  };

  // 자동 URL 생성 함수
  const generateNaverUrl = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    return `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodedQuery}&ackey=9k442ys2`;
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetUrl = '';

    if (useAutoUrl) {
      if (!searchQuery.trim()) {
        setError('검색어를 입력해주세요.');
        return;
      }
      targetUrl = generateNaverUrl(searchQuery.trim());
    } else {
      if (!url.trim()) {
        setError('URL을 입력해주세요.');
        return;
      }
      targetUrl = url.trim();
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const currentClassName = getCurrentClassName();
      const response = await fetch(
        `/api/naver-search?url=${encodeURIComponent(targetUrl)}&class=${encodeURIComponent(currentClassName)}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError('텍스트 추출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyAllResults = async () => {
    if (!results || results.results.length === 0) return;

    try {
      const content = results.results.join('\n');
      await navigator.clipboard.writeText(content);
      show(`${results.results.length}개의 텍스트가 복사되었습니다!`, {
        type: 'success',
      });
    } catch (err) {
      console.error('Copy error:', err);
      show('복사에 실패했습니다.', { type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Naver Mobile Search Extractor
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* URL 생성 방식 선택 */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUseAutoUrl(true)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                useAutoUrl
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔍 검색어로 자동생성
            </button>
            <button
              type="button"
              onClick={() => setUseAutoUrl(false)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                !useAutoUrl
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔗 직접 URL 입력
            </button>
          </div>

          <form onSubmit={handleExtract} className="space-y-4">
            {useAutoUrl ? (
              <div>
                <label
                  htmlFor="searchQuery"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  검색어
                </label>
                <input
                  id="searchQuery"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="예: 라미네이트 후기"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                {searchQuery && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">생성될 URL:</p>
                    <p className="text-xs text-gray-500 break-all mt-1">
                      {generateNaverUrl(searchQuery)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  네이버 검색 URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://search.naver.com/search.naver?..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추출할 콘텐츠 타입
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {NAVER_CLASS_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedClassType(option.label)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedClassType === option.label
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>

              {selectedClassType === '사용자 정의' && (
                <div>
                  <label
                    htmlFor="customClassName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    사용자 정의 클래스명
                  </label>
                  <input
                    id="customClassName"
                    type="text"
                    value={customClassName}
                    onChange={(e) => setCustomClassName(e.target.value)}
                    placeholder="예: fds-comps-text fds-comps-header-headline"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              )}

              {selectedClassType !== '사용자 정의' && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">현재 클래스명:</p>
                  <p className="text-xs font-mono text-gray-500 break-all mt-1">
                    {getCurrentClassName()}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading || (useAutoUrl ? !searchQuery.trim() : !url.trim())
              }
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '추출 중...' : '텍스트 추출'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                추출 결과 ({results.count}개)
              </h2>
              {results.results.length > 0 && (
                <button
                  onClick={copyAllResults}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📋 모두 복사
                </button>
              )}
            </div>

            {results.results.length > 0 ? (
              <div className="space-y-3">
                {results.results.map((text, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="text-gray-800">{text}</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(text);
                          show('텍스트가 복사되었습니다!', { type: 'success' });
                        } catch (err) {
                          show('복사에 실패했습니다.', { type: 'error' });
                        }
                      }}
                      className="ml-3 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      복사
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                해당 클래스명으로 텍스트를 찾을 수 없습니다.
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>URL:</strong>{' '}
                <span className="break-all">{results.url}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>클래스:</strong> {results.className}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

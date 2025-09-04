import type { Route } from './+types/search';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '~/components/Toast';
import Spinner from '~/components/Spinner';

interface NaverSearchResult {
  title: string;
  link: string;
  description: string;
}

interface ExtractionResult {
  url: string;
  className: string;
  results: string[];
  count: number;
  status: number;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return { results: [], query: '' };
  }

  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    console.log('Environment variables:', {
      clientId: clientId ? 'exists' : 'missing',
      clientSecret: clientSecret ? 'exists' : 'missing',
    });

    if (!clientId || !clientSecret) {
      throw new Error('네이버 API 키가 설정되지 않았습니다.');
    }

    const response = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=10`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Naver API 요청 실패');
    }

    const data = await response.json();
    return { results: data.items || [], query };
  } catch (error) {
    console.error('Search error:', error);
    return { results: [], query, error: '검색 중 오류가 발생했습니다.' };
  }
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { results, query, error } = loaderData;
  const [newQuery, setNewQuery] = useState(query || '');
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState<'results' | 'extract'>(
    results?.length ? 'results' : 'extract'
  );

  const [keywordsInput, setKeywordsInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  // Extractor states
  const NAVER_CLASS_OPTIONS = useMemo(
    () => [
      {
        label: '인기글/추천글',
        value: 'fds-comps-text fds-comps-header-headline pP6CrxLzumAlsR4_qelA',
        description: '네이버 검색 결과의 인기글/추천글 제목',
      },
      {
        label: '일반 검색 결과 제목',
        value:
          'fds-comps-text fds-comps-header-headline _2FC9jXOgF3yE5OOGgd8Cr',
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
    ],
    []
  );

  const [useAutoUrl, setUseAutoUrl] = useState(true);
  const [extractUrl, setExtractUrl] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('인기글/추천글');
  const [customClassName, setCustomClassName] = useState('');
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [extractResults, setExtractResults] = useState<ExtractionResult | null>(
    null
  );
  const [extractError, setExtractError] = useState('');

  useEffect(() => {
    if (useAutoUrl && newQuery) {
      setExtractUrl(generateNaverUrl(newQuery));
    }
  }, [useAutoUrl, newQuery]);

  const getCurrentClassName = () => {
    const selectedOption = NAVER_CLASS_OPTIONS.find(
      (option) => option.label === selectedClassType
    );
    if (selectedOption?.value === 'custom') {
      return customClassName;
    }
    return selectedOption?.value || NAVER_CLASS_OPTIONS[0].value;
  };

  const generateNaverUrl = (q: string) => {
    const encodedQuery = encodeURIComponent(q);
    return `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodedQuery}&ackey=9k442ys2`;
  };

  const copyContent = async (title: string, description: string) => {
    const content = `${title.replace(/<[^>]*>/g, '')}\n\n${description.replace(/<[^>]*>/g, '')}`;
    try {
      await navigator.clipboard.writeText(content);
      show('본문이 복사되었습니다!', { type: 'success' });
    } catch (err) {
      console.error('복사 실패:', err);
      show('복사에 실패했습니다.', { type: 'error' });
    }
  };

  const fetchFullContent = async (url: string) => {
    try {
      const response = await fetch(
        `/api/content?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.error) {
        show(String(data.error), { type: 'error' });
        return;
      }

      const fullContent = `${data.title}\n\n${data.content}`;
      await navigator.clipboard.writeText(fullContent);
      show('전체 본문이 복사되었습니다!', { type: 'success' });
    } catch (err) {
      console.error('전체 본문 가져오기 실패:', err);
      show('전체 본문을 가져오는데 실패했습니다.', { type: 'error' });
    }
  };

  const fetchImages = async (url: string) => {
    try {
      const response = await fetch(
        `/api/content?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.error) {
        show(String(data.error), { type: 'error' });
        return;
      }

      if (!data.images || data.images.length === 0) {
        show('이미지를 찾을 수 없습니다.', { type: 'info' });
        return;
      }

      // 이미지 URL들을 클립보드에 복사
      const imageUrls = data.images.join('\n');
      await navigator.clipboard.writeText(imageUrls);
      show(`${data.images.length}개의 이미지 URL이 복사되었습니다!`, {
        type: 'success',
      });

      // 이미지 다운로드 링크들을 새 창에서 열기 (선택사항)
      // data.images.forEach((imgUrl: string, index: number) => {
      //   setTimeout(() => {
      //     window.open(imgUrl, '_blank');
      //   }, index * 500); // 0.5초 간격으로 열기
      // });
    } catch (err) {
      console.error('이미지 가져오기 실패:', err);
      show('이미지를 가져오는데 실패했습니다.', { type: 'error' });
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
  };

  const applyKeywords = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const list = keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    setKeywords(list);
    setActiveTab('results');
  };

  const clearKeywords = () => {
    setKeywords([]);
    setKeywordsInput('');
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

  const groupedResults = useMemo(() => {
    const normalized = (results || []).map((r: NaverSearchResult) => ({
      ...r,
      _titleText: stripHtml(r.title),
      _descText: stripHtml(r.description || ''),
    }));

    const groups: Record<string, NaverSearchResult[]> = {};
    const unmatched: NaverSearchResult[] = [];

    const keys = (keywords || []).map((k) => k.toLowerCase());
    if (keys.length === 0) {
      return { groups: {}, unmatched: normalized as NaverSearchResult[] };
    }

    for (const k of keys) groups[k] = [];

    for (const item of normalized) {
      const hay = `${item._titleText} ${item._descText}`.toLowerCase();
      let matched = false;
      for (const k of keys) {
        if (k && hay.includes(k)) {
          groups[k].push(item);
          matched = true;
        }
      }
      if (!matched) unmatched.push(item);
    }

    return { groups, unmatched };
  }, [results, keywords]);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = '';
    if (useAutoUrl) {
      if (!newQuery.trim()) {
        setExtractError('검색어를 입력해주세요.');
        setActiveTab('extract');
        return;
      }
      targetUrl = generateNaverUrl(newQuery.trim());
    } else {
      if (!extractUrl.trim()) {
        setExtractError('URL을 입력해주세요.');
        setActiveTab('extract');
        return;
      }
      targetUrl = extractUrl.trim();
    }

    setLoadingExtract(true);
    setExtractError('');
    setExtractResults(null);

    try {
      const currentClassName = getCurrentClassName();
      const response = await fetch(
        `/api/naver-search?url=${encodeURIComponent(targetUrl)}&class=${encodeURIComponent(currentClassName)}`
      );
      const data = await response.json();

      if (data.error) {
        setExtractError(data.error);
        show(String(data.error), { type: 'error' });
      } else {
        setExtractResults(data);
        show(`추출 완료: ${data.count}개`, { type: 'success' });
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setExtractError('텍스트 추출 중 오류가 발생했습니다.');
      show('텍스트 추출 중 오류가 발생했습니다.', { type: 'error' });
    } finally {
      setLoadingExtract(false);
      setActiveTab('extract');
    }
  };

  const copyAllExtracted = async () => {
    if (!extractResults || extractResults.results.length === 0) return;
    try {
      const content = extractResults.results.join('\n');
      await navigator.clipboard.writeText(content);
      show(`${extractResults.results.length}개의 텍스트가 복사되었습니다!`, {
        type: 'success',
      });
    } catch (err) {
      show('복사에 실패했습니다.', { type: 'error' });
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Naver Search & Extractor
        </h1>

        {/* 검색/추출 공통 검색 폼 */}
        <form onSubmit={handleNewSearch} className="mb-6">
          <div className="group flex gap-3 items-center rounded-2xl border border-gray-300 bg-white p-2 shadow-sm transition focus-within:ring-2 focus-within:ring-green-500 dark:bg-gray-900 dark:border-gray-700">
            <input
              type="text"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="새로운 검색어를 입력하세요..."
              className="flex-1 px-4 py-3 rounded-xl bg-white text-black dark:text-black placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-green-600 text-white font-medium shadow hover:bg-green-700 active:scale-[.99] transition"
            >
              검색
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="flex">
            <button
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'results' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('results')}
            >
              검색 결과
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'extract' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('extract')}
            >
              텍스트 추출
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'results' ? (
          <div>
            {query && (
              <p className="text-lg text-gray-600 mb-4">
                현재 검색어: <strong>{query}</strong>
              </p>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* 키워드 그룹화 컨트롤 */}
            {results.length > 0 && (
              <form
                onSubmit={applyKeywords}
                className="mb-4 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="키워드 입력 (쉼표로 구분: 예) 치과, 라미네이트, 가격)"
                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-black dark:text-black placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-md bg-blue-600 text-white"
                >
                  적용
                </button>
                {keywords.length > 0 && (
                  <button
                    type="button"
                    onClick={clearKeywords}
                    className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    초기화
                  </button>
                )}
              </form>
            )}

            {/* 결과 렌더링 */}
            {results.length > 0 ? (
              keywords.length === 0 ? (
                <div className="space-y-4">
                  {results.map((result: NaverSearchResult, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative hover:shadow-md hover:-translate-y-0.5 transition dark:bg-gray-900 dark:border-gray-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold flex-1">
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 hover:underline"
                            dangerouslySetInnerHTML={{ __html: result.title }}
                          />
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              copyContent(result.title, result.description)
                            }
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                            title="미리보기 복사"
                          >
                            복사
                          </button>
                          {result.link.includes('blog.naver.com') && (
                            <>
                              <button
                                onClick={() => fetchFullContent(result.link)}
                                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors border border-blue-200"
                                title="전체 본문 복사"
                              >
                                전체
                              </button>
                              <button
                                onClick={() => fetchImages(result.link)}
                                className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors border border-green-200"
                                title="이미지 URL 복사"
                              >
                                이미지
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p
                        className="text-gray-700 dark:text-gray-300 mb-2"
                        dangerouslySetInnerHTML={{ __html: result.description }}
                      />
                      <p className="text-sm text-green-700">{result.link}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-10">
                  {keywords.map((k) => {
                    const key = k.toLowerCase();
                    const items = groupedResults.groups[key] || [];
                    if (!items.length) return null;
                    return (
                      <section key={key}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          #{k} ({items.length})
                        </h3>
                        <div className="space-y-4">
                          {items.map(
                            (result: NaverSearchResult, index: number) => (
                              <div
                                key={`${key}-${index}`}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative hover:shadow-md hover:-translate-y-0.5 transition dark:bg-gray-900 dark:border-gray-800"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-xl font-semibold flex-1">
                                    <a
                                      href={result.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:text-blue-900 hover:underline"
                                      dangerouslySetInnerHTML={{
                                        __html: result.title,
                                      }}
                                    />
                                  </h3>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        copyContent(
                                          result.title,
                                          result.description
                                        )
                                      }
                                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                                      title="미리보기 복사"
                                    >
                                      복사
                                    </button>
                                    {result.link.includes('blog.naver.com') && (
                                      <>
                                        <button
                                          onClick={() =>
                                            fetchFullContent(result.link)
                                          }
                                          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors border border-blue-200"
                                          title="전체 본문 복사"
                                        >
                                          전체
                                        </button>
                                        <button
                                          onClick={() =>
                                            fetchImages(result.link)
                                          }
                                          className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors border border-green-200"
                                          title="이미지 URL 복사"
                                        >
                                          이미지
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <p
                                  className="text-gray-700 dark:text-gray-300 mb-2"
                                  dangerouslySetInnerHTML={{
                                    __html: result.description,
                                  }}
                                />
                                <p className="text-sm text-green-700">
                                  {result.link}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    );
                  })}
                  {groupedResults.unmatched.length > 0 && (
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        기타 ({groupedResults.unmatched.length})
                      </h3>
                      <div className="space-y-4">
                        {groupedResults.unmatched.map(
                          (result: NaverSearchResult, index: number) => (
                            <div
                              key={`etc-${index}`}
                              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative hover:shadow-md hover:-translate-y-0.5 transition dark:bg-gray-900 dark:border-gray-800"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold flex-1">
                                  <a
                                    href={result.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:text-blue-900 hover:underline"
                                    dangerouslySetInnerHTML={{
                                      __html: result.title,
                                    }}
                                  />
                                </h3>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      copyContent(
                                        result.title,
                                        result.description
                                      )
                                    }
                                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border border-gray-200"
                                    title="미리보기 복사"
                                  >
                                    복사
                                  </button>
                                  {result.link.includes('blog.naver.com') && (
                                    <>
                                      <button
                                        onClick={() =>
                                          fetchFullContent(result.link)
                                        }
                                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors border border-blue-200"
                                        title="전체 본문 복사"
                                      >
                                        전체
                                      </button>
                                      <button
                                        onClick={() => fetchImages(result.link)}
                                        className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors border border-green-200"
                                        title="이미지 URL 복사"
                                      >
                                        이미지
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <p
                                className="text-gray-700 dark:text-gray-300 mb-2"
                                dangerouslySetInnerHTML={{
                                  __html: result.description,
                                }}
                              />
                              <p className="text-sm text-green-700">
                                {result.link}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  )}
                </div>
              )
            ) : query && !error ? (
              <div className="text-center text-gray-600">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="text-center text-gray-500">
                검색어를 입력해 결과를 확인하세요.
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 dark:bg-gray-900 dark:border-gray-800">
              {/* URL 생성 방식 선택 */}
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setUseAutoUrl(true)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border ${
                    useAutoUrl
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                  }`}
                >
                  검색어로 자동생성
                </button>
                <button
                  type="button"
                  onClick={() => setUseAutoUrl(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium border ${
                    !useAutoUrl
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                  }`}
                >
                  직접 URL 입력
                </button>
              </div>

              <form onSubmit={handleExtract} className="space-y-4">
                {useAutoUrl ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      검색어
                    </label>
                    <input
                      type="text"
                      value={newQuery}
                      onChange={(e) => setNewQuery(e.target.value)}
                      placeholder="예: 라미네이트 후기"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black dark:text-black placeholder:text-gray-500 dark:placeholder:text-gray-500"
                    />
                    {newQuery && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">생성될 URL:</p>
                        <p className="text-xs text-gray-500 break-all mt-1">
                          {generateNaverUrl(newQuery)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      네이버 검색 URL
                    </label>
                    <input
                      type="url"
                      value={extractUrl}
                      onChange={(e) => setExtractUrl(e.target.value)}
                      placeholder="https://search.naver.com/search.naver?..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black dark:text-black placeholder:text-gray-500 dark:placeholder:text-gray-500"
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

                  {selectedClassType === '사용자 정의' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사용자 정의 클래스명
                      </label>
                      <input
                        type="text"
                        value={customClassName}
                        onChange={(e) => setCustomClassName(e.target.value)}
                        placeholder="예: fds-comps-text fds-comps-header-headline"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black dark:text-black placeholder:text-gray-500 dark:placeholder:text-gray-500"
                      />
                    </div>
                  ) : (
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
                    loadingExtract ||
                    (useAutoUrl ? !newQuery.trim() : !extractUrl.trim())
                  }
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingExtract ? (
                    <>
                      <Spinner size={16} /> 추출 중...
                    </>
                  ) : (
                    '텍스트 추출'
                  )}
                </button>
              </form>
            </div>

            {extractError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {extractError}
              </div>
            )}

            {extractResults && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    추출 결과 ({extractResults.count}개)
                  </h2>
                  {extractResults.results.length > 0 && (
                    <button
                      onClick={copyAllExtracted}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      모두 복사
                    </button>
                  )}
                </div>

                {extractResults.results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {extractResults.results.map((text, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg bg-white/60 dark:bg-gray-950/40 flex items-start justify-between gap-2"
                      >
                        <span className="text-gray-800 dark:text-gray-100">
                          {text}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(text);
                              show('텍스트가 복사되었습니다!', {
                                type: 'success',
                              });
                            } catch (err) {
                              show('복사에 실패했습니다.', { type: 'error' });
                            }
                          }}
                          className="ml-3 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-200"
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
                    <span className="break-all">{extractResults.url}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>클래스:</strong> {extractResults.className}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

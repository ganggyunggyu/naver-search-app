import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from './+types/url-search.dynamic';
import { useToast } from '@/shared/ui/Toast';
import { analyzeManuscript, formatManuscriptAnalysis } from '@/shared';

interface ContentResult {
  title: string;
  blogName?: string;
  content: string;
  images?: string[];
  url: string;
  actualUrl?: string;
  status: number;
  error?: string;
}

export const meta = (_: Route.MetaArgs) => [
  { title: 'URL Search | 원고 미리보기' },
  {
    name: 'description',
    content: '블로그 글 URL을 입력해 본문을 미리보고 복사합니다.',
  },
];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  let input = (
    url.searchParams.get('url') ||
    url.searchParams.get('q') ||
    ''
  ).trim();

  const encoded = ((params as { encoded?: string })?.encoded || '').trim();
  if (encoded) {
    try {
      input = decodeURIComponent(encoded);
    } catch {
      input = encoded;
    }
  }
  return { url: input };
};

const UrlSearchPage: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const { show } = useToast();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContentResult | null>(null);
  const [error, setError] = useState('');
  const prevUrlRef = useRef('');
  const analysis = useMemo(
    () => analyzeManuscript(data?.content || ''),
    [data?.content]
  );
  const copyAnalysis = async () => {
    if (!data) return;
    try {
      const text = formatManuscriptAnalysis(analysis, {
        title: data.title,
        url: data.url,
      });
      await navigator.clipboard.writeText(text);
      show('분석 결과가 복사되었습니다!', { type: 'success' });
    } catch {
      show('복사 실패', { type: 'error' });
    }
  };

  const fetchByUrl = async (u: string) => {
    const target = (u || '').trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/content?url=${encodeURIComponent(target)}`);
      const json: ContentResult = await res.json();
      if (json.error) {
        const msg = json.error;
        setError(msg);
        show(msg, { type: 'error' });
      } else {
        setData(json);
        show('원고를 불러왔습니다.', { type: 'success' });
      }
    } catch {
      const msg = '요청 중 오류가 발생했습니다.';
      setError(msg);
      show(msg, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    const u = (urlInput || '').trim();
    if (!u) return;

    window.location.href = `/url/${encodeURIComponent(u)}`;
  };

  const copyPreview = async () => {
    if (!data) return;
    const cleanTitle = (data.title || '').replace(/\s+/g, ' ').trim();
    const plain = [cleanTitle, data.url].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(plain);
      show('미리보기가 복사되었습니다!', { type: 'success' });
    } catch {
      show('복사 실패', { type: 'error' });
    }
  };

  const copyFull = async () => {
    if (!data) return;
    const cleanTitle = (data.title || '').replace(/\s+/g, ' ').trim();
    const cleanContent = (data.content || '')
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((l) => l.replace(/[ \t\f\v\u00A0]+$/g, ''))
      .join('\n')
      .trim();
    const full = [cleanTitle, cleanContent].filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(full);
      show('전체 본문이 복사되었습니다!', { type: 'success' });
    } catch {
      show('복사 실패', { type: 'error' });
    }
  };

  useEffect(() => {
    const initialUrl = (loaderData as { url?: string })?.url || '';
    const uu = initialUrl.trim();
    if (!uu) return;
    if (prevUrlRef.current === uu) return;
    prevUrlRef.current = uu;
    setUrlInput(uu);
    fetchByUrl(uu);
  }, [loaderData]);

  return (
    <div className="relative py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-gradient-to-br from-green-200/40 via-blue-200/30 to-transparent blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            URL 원고 미리보기
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            블로그 글 URL을 입력해 본문을 미리보고 복사하세요
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            블로그 글 URL
          </label>
          <div className="group flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 shadow-sm transition focus-within:ring-2 focus-within:ring-green-500">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://m.blog.naver.com/rockncat/223996421135"
              className="flex-1 px-4 py-3 rounded-xl bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="px-5 py-2 rounded-xl bg-green-600 text-white font-medium shadow hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? '불러오는 중...' : '분석'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500">
                  {data.blogName || '네이버 블로그'}
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {data.title || '제목 없음'}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white"
                >
                  원문
                </a>
                <button
                  onClick={copyFull}
                  className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white"
                >
                  전체 복사
                </button>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                원고 분석
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  문자수: <strong>{analysis.charCount}</strong>
                </span>
                <span>
                  공백제외: <strong>{analysis.charCountNoSpace}</strong>
                </span>
                <span>
                  단어수: <strong>{analysis.wordCount}</strong>
                </span>
                <span>
                  예상 읽기: <strong>{analysis.readingTimeMin}분</strong>
                </span>
              </div>
              {analysis.topKeywords.length > 0 && (
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                  키워드:{' '}
                  {analysis.topKeywords.map((k) => (
                    <span
                      key={k.word}
                      className="inline-block mr-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      #{k.word} <span className="opacity-70">x{k.count}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <button
                  onClick={copyAnalysis}
                  className="px-3 py-1.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                >
                  분석 복사
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 break-all mb-3">
              {data.actualUrl || data.url}
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-6">
              {data.content || '본문을 추출할 수 없습니다.'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlSearchPage;

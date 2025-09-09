import React, { useMemo, useState } from 'react';
import type { Route } from './+types/doc-analyzer';
import {
  analyzeManuscript,
  countKeywordOccurrences,
  extractSubtitles,
  formatManuscriptAnalysis,
  topKoreanTokens,
} from '@/shared';

export const meta = (_: Route.MetaArgs) => [
  { title: '문서 분석' },
  { name: 'description', content: '텍스트를 입력해 문서 통계를 분석합니다.' },
];

const DocAnalyzerPage: React.FC = () => {
  const [text, setText] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');

  const analysis = useMemo(() => analyzeManuscript(text), [text]);
  const morphTop = useMemo(() => topKoreanTokens(text, 10), [text]);
  const subtitles = useMemo(() => extractSubtitles(text), [text]);
  const keywordList = useMemo(
    () =>
      (keywordsInput || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    [keywordsInput]
  );
  const keywordCounts = useMemo(
    () => countKeywordOccurrences(text, keywordList),
    [text, keywordList]
  );

  const copyAnalysis = async () => {
    try {
      const core = formatManuscriptAnalysis(analysis);
      const morph = morphTop
        .map((k) => `#${k.word} x${k.count}`)
        .join(', ');
      const kw = keywordCounts
        .map((k) => `#${k.word} x${k.count}`)
        .join(', ');
      const sub = subtitles.join('\n- ');
      const out = [
        core,
        morph ? `형태소 Top: ${morph}` : '',
        kw ? `핵심 키워드: ${kw}` : '',
        subtitles.length ? `부제:\n- ${sub}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
      await navigator.clipboard.writeText(out);
      alert('분석 결과가 복사되었습니다.');
    } catch {
      alert('복사 실패');
    }
  };

  const copySubtitles = async () => {
    try {
      const out = subtitles.join('\n');
      await navigator.clipboard.writeText(out);
      alert('부제가 복사되었습니다.');
    } catch {
      alert('복사 실패');
    }
  };

  return (
    <div className="relative py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            문서 분석
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            원고 텍스트를 붙여넣고 통계를 확인하세요
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                원고 텍스트
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="여기에 텍스트를 붙여넣으세요"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                핵심 키워드 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="예: 라미네이트, 충치, 가격"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {text && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                분석 결과
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyAnalysis}
                  className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                >
                  분석 복사
                </button>
                <button
                  onClick={copySubtitles}
                  className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white"
                >
                  부제 복사
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                문서 통계
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                <span>문자수: <strong>{analysis.charCount}</strong></span>
                <span>공백제외: <strong>{analysis.charCountNoSpace}</strong></span>
                <span>단어수: <strong>{analysis.wordCount}</strong></span>
                <span>예상 읽기: <strong>{analysis.readingTimeMin}분</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  형태소 Top (한글 토큰)
                </div>
                {morphTop.length ? (
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {morphTop.map((k) => (
                      <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">토큰이 충분하지 않습니다.</div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  핵심 키워드 개수
                </div>
                {keywordList.length ? (
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {keywordCounts.map((k) => (
                      <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">키워드를 입력하면 개수를 집계합니다.</div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                부제 정리
              </div>
              {subtitles.length ? (
                <ul className="list-disc pl-5 text-sm text-gray-800 dark:text-gray-200">
                  {subtitles.map((s, i) => (
                    <li key={`${s}-${i}`} className="mb-1">{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-500">부제 후보를 찾지 못했습니다.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocAnalyzerPage;


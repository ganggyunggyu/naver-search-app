import React, { useMemo, useState } from 'react';
import type { Route } from './+types/doc-compare';
import { analyzeManuscript, topKoreanTokens } from '@/shared';

export const meta = (_: Route.MetaArgs) => [
  { title: '문서 비교' },
  { name: 'description', content: '두 개의 원고를 비교하여 통계와 표현을 분석합니다.' },
];

type Pair<T> = { a: T; b: T };

const toMap = (list: { word: string; count: number }[]) => {
  const m = new Map<string, number>();
  for (const k of list) m.set(k.word, k.count);
  return m;
};

const intersectWords = (a: { word: string; count: number }[], b: { word: string; count: number }[]) => {
  const ma = toMap(a);
  const mb = toMap(b);
  const common: { word: string; a: number; b: number }[] = [];
  for (const [w, ca] of ma) {
    const cb = mb.get(w);
    if (typeof cb === 'number') common.push({ word: w, a: ca, b: cb });
  }
  common.sort((x, y) => y.a + y.b - (x.a + x.b));
  return common;
};

const uniqueWords = (base: { word: string; count: number }[], other: { word: string; count: number }[]) => {
  const mo = toMap(other);
  return base.filter((k) => !mo.has(k.word));
};

const DocComparePage: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const stat: Pair<ReturnType<typeof analyzeManuscript>> = useMemo(
    () => ({ a: analyzeManuscript(a), b: analyzeManuscript(b) }),
    [a, b]
  );

  const tokens: Pair<ReturnType<typeof topKoreanTokens>> = useMemo(
    () => ({ a: topKoreanTokens(a, 15), b: topKoreanTokens(b, 15) }),
    [a, b]
  );

  const words: Pair<{ word: string; count: number }[]> = useMemo(
    () => ({ a: stat.a.topKeywords, b: stat.b.topKeywords }),
    [stat]
  );

  const commonTokens = useMemo(() => intersectWords(tokens.a, tokens.b), [tokens]);
  const commonWords = useMemo(() => intersectWords(words.a, words.b), [words]);
  const uniqueATokens = useMemo(() => uniqueWords(tokens.a, tokens.b), [tokens]);
  const uniqueBTokens = useMemo(() => uniqueWords(tokens.b, tokens.a), [tokens]);

  return (
    <div className="relative py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">문서 비교</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">두 개의 원고를 붙여넣고 통계를 비교하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">원고 A</div>
            <textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              rows={12}
              placeholder="여기에 첫 번째 텍스트를 붙여넣으세요"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">원고 B</div>
            <textarea
              value={b}
              onChange={(e) => setB(e.target.value)}
              rows={12}
              placeholder="여기에 두 번째 텍스트를 붙여넣으세요"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {(a || b) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">글자수 비교</div>
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <div>A 문자수: <strong>{stat.a.charCount}</strong> (공백제외 <strong>{stat.a.charCountNoSpace}</strong>)</div>
                  <div>B 문자수: <strong>{stat.b.charCount}</strong> (공백제외 <strong>{stat.b.charCountNoSpace}</strong>)</div>
                  <div>
                    차이: <strong>{Math.abs(stat.a.charCount - stat.b.charCount)}</strong>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">주요 표현 비교(단어)</div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  <div className="mb-1">공통</div>
                  {commonWords.length ? (
                    <div className="mb-3">
                      {commonWords.slice(0, 10).map((k) => (
                        <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          #{k.word} <span className="opacity-70">A:{k.a} / B:{k.b}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">공통 단어가 부족합니다.</div>
                  )}
                  <div className="mb-1">A 고유</div>
                  <div className="mb-3">
                    {words.a.length ? uniqueWords(words.a, words.b).slice(0, 10).map((k) => (
                      <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    )) : <span className="text-xs text-gray-500">없음</span>}
                  </div>
                  <div className="mb-1">B 고유</div>
                  <div>
                    {words.b.length ? uniqueWords(words.b, words.a).slice(0, 10).map((k) => (
                      <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    )) : <span className="text-xs text-gray-500">없음</span>}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">형태소(한글 토큰) 비교</div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  <div className="mb-1">공통</div>
                  {commonTokens.length ? (
                    <div className="mb-3">
                      {commonTokens.slice(0, 10).map((k) => (
                        <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          #{k.word} <span className="opacity-70">A:{k.a} / B:{k.b}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">공통 토큰이 부족합니다.</div>
                  )}
                  <div className="mb-1">A 고유</div>
                  <div className="mb-3">
                    {uniqueATokens.slice(0, 10).map((k) => (
                      <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    ))}
                    {!uniqueATokens.length && <span className="text-xs text-gray-500">없음</span>}
                  </div>
                  <div className="mb-1">B 고유</div>
                  <div>
                    {uniqueBTokens.slice(0, 10).map((k) => (
                      <span key={k.word} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    ))}
                    {!uniqueBTokens.length && <span className="text-xs text-gray-500">없음</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocComparePage;


import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from './+types/doc-compare';
import { analyzeManuscript, topKoreanTokens, normalizeForCopy } from '@/shared';
import DiffViewer from '@/features/doc/components/_DiffViewer';

export const meta = (_: Route.MetaArgs) => [
  { title: '문서 비교' },
  {
    name: 'description',
    content: '두 개의 원고를 비교하여 통계와 표현을 분석합니다.',
  },
];

type Pair<T> = { a: T; b: T };

const toMap = (list: { word: string; count: number }[]) => {
  const m = new Map<string, number>();
  for (const k of list) m.set(k.word, k.count);
  return m;
};

const intersectWords = (
  a: { word: string; count: number }[],
  b: { word: string; count: number }[]
) => {
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

const uniqueWords = (
  base: { word: string; count: number }[],
  other: { word: string; count: number }[]
) => {
  const mo = toMap(other);
  return base.filter((k) => !mo.has(k.word));
};

const DocComparePage: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const aRef = useRef<HTMLTextAreaElement | null>(null);
  const bRef = useRef<HTMLTextAreaElement | null>(null);

  // inline find state for A/B
  const [findAOpen, setFindAOpen] = useState(false);
  const [findBOpen, setFindBOpen] = useState(false);
  const [findAQuery, setFindAQuery] = useState('');
  const [findBQuery, setFindBQuery] = useState('');
  const [findAIndex, setFindAIndex] = useState(0);
  const [findBIndex, setFindBIndex] = useState(0);

  type Match = { start: number; end: number };
  const getMatches = (text: string, q: string): Match[] => {
    const t = (text || '');
    const qq = (q || '').trim();
    if (!qq) return [];
    const tl = t.toLowerCase();
    const ql = qq.toLowerCase();
    const ms: Match[] = [];
    let pos = 0;
    while (true) {
      const idx = tl.indexOf(ql, pos);
      if (idx === -1) break;
      ms.push({ start: idx, end: idx + ql.length });
      pos = idx + Math.max(1, ql.length);
      if (ms.length > 5000) break; // safety
    }
    return ms;
  };

  const aMatches = useMemo(() => getMatches(a, findAQuery), [a, findAQuery]);
  const bMatches = useMemo(() => getMatches(b, findBQuery), [b, findBQuery]);

  useEffect(() => {
    if (findAIndex >= aMatches.length) setFindAIndex(0);
  }, [aMatches.length, findAIndex]);
  useEffect(() => {
    if (findBIndex >= bMatches.length) setFindBIndex(0);
  }, [bMatches.length, findBIndex]);

  const jumpToMatch = (
    which: 'a' | 'b',
    dir: 1 | -1 = 1,
  ) => {
    if (which === 'a') {
      const total = aMatches.length;
      if (!total || !aRef.current) return;
      const next = (findAIndex + (dir === 1 ? 1 : total - 1)) % total;
      const m = aMatches[next];
      setFindAIndex(next);
      aRef.current.focus();
      aRef.current.setSelectionRange(m.start, m.end);
    } else {
      const total = bMatches.length;
      if (!total || !bRef.current) return;
      const next = (findBIndex + (dir === 1 ? 1 : total - 1)) % total;
      const m = bMatches[next];
      setFindBIndex(next);
      bRef.current.focus();
      bRef.current.setSelectionRange(m.start, m.end);
    }
  };

  const onChangeA: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const raw = e.target.value;
    const normalized = normalizeForCopy(raw);
    setA(normalized);
  };

  const onChangeB: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const raw = e.target.value;
    const normalized = normalizeForCopy(raw);
    setB(normalized);
  };

  const onKeyDownFindA: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      if (findAOpen) {
        setFindAOpen(false);
        return;
      }
      setFindAOpen(true);
      if (findAQuery.trim()) {
        if (aMatches.length && aRef.current) {
          const m = aMatches[findAIndex % aMatches.length];
          aRef.current.setSelectionRange(m.start, m.end);
        }
      }
    } else if (e.key === 'Escape' && findAOpen) {
      e.preventDefault();
      setFindAOpen(false);
    }
  };

  const onKeyDownFindB: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      if (findBOpen) {
        setFindBOpen(false);
        return;
      }
      setFindBOpen(true);
      if (findBQuery.trim()) {
        if (bMatches.length && bRef.current) {
          const m = bMatches[findBIndex % bMatches.length];
          bRef.current.setSelectionRange(m.start, m.end);
        }
      }
    } else if (e.key === 'Escape' && findBOpen) {
      e.preventDefault();
      setFindBOpen(false);
    }
  };

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

  const commonTokens = useMemo(
    () => intersectWords(tokens.a, tokens.b),
    [tokens]
  );
  const commonWords = useMemo(() => intersectWords(words.a, words.b), [words]);
  const uniqueATokens = useMemo(
    () => uniqueWords(tokens.a, tokens.b),
    [tokens]
  );
  const uniqueBTokens = useMemo(
    () => uniqueWords(tokens.b, tokens.a),
    [tokens]
  );

  // --- Similarity metrics (token-based) ---
  const tokenize = (t: string) =>
    (t || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2);

  const tokenA = useMemo(() => tokenize(a), [a]);
  const tokenB = useMemo(() => tokenize(b), [b]);

  const freq = (arr: string[]) => {
    const m = new Map<string, number>();
    for (const w of arr) m.set(w, (m.get(w) || 0) + 1);
    return m;
  };

  const freqA = useMemo(() => freq(tokenA), [tokenA]);
  const freqB = useMemo(() => freq(tokenB), [tokenB]);

  const cosine = useMemo(() => {
    if (!freqA.size || !freqB.size) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (const [, v] of freqA) normA += v * v;
    for (const [, v] of freqB) normB += v * v;
    const small = freqA.size < freqB.size ? freqA : freqB;
    const other = small === freqA ? freqB : freqA;
    for (const [k, v] of small) {
      const u = other.get(k);
      if (u) dot += v * u;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom ? dot / denom : 0;
  }, [freqA, freqB]);

  const jaccard = useMemo(() => {
    const setA = new Set(tokenA);
    const setB = new Set(tokenB);
    if (!setA.size && !setB.size) return 1;
    let inter = 0;
    for (const w of setA) if (setB.has(w)) inter++;
    const union = setA.size + setB.size - inter;
    return union ? inter / union : 0;
  }, [tokenA, tokenB]);

  return (
    <div className="relative py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            문서 비교
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            두 개의 원고를 붙여넣고 통계를 비교하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
              원고 A
            </div>
            <textarea
              ref={aRef}
              value={a}
              onChange={onChangeA}
              onKeyDown={onKeyDownFindA}
              rows={12}
              placeholder="여기에 첫 번째 텍스트를 붙여넣으세요"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {findAOpen && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-2 py-1 shadow">
                <input
                  autoFocus
                  value={findAQuery}
                  onChange={(e) => {
                    setFindAQuery(e.target.value);
                    setFindAIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      jumpToMatch('a', e.shiftKey ? -1 : 1);
                    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) {
                      e.preventDefault();
                      setFindAOpen(false);
                    } else if (e.key === 'Escape') {
                      setFindAOpen(false);
                    }
                  }}
                  placeholder="이 영역에서 찾기"
                  className="h-7 w-40 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 text-sm"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 w-14 text-right">
                  {aMatches.length ? `${(findAIndex % aMatches.length) + 1}/${aMatches.length}` : '0/0'}
                </span>
                <button
                  type="button"
                  onClick={() => jumpToMatch('a', -1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => jumpToMatch('a', 1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  다음
                </button>
                <button
                  type="button"
                  onClick={() => setFindAOpen(false)}
                  className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
              원고 B
            </div>
            <textarea
              ref={bRef}
              value={b}
              onChange={onChangeB}
              onKeyDown={onKeyDownFindB}
              rows={12}
              placeholder="여기에 두 번째 텍스트를 붙여넣으세요"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {findBOpen && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 px-2 py-1 shadow">
                <input
                  autoFocus
                  value={findBQuery}
                  onChange={(e) => {
                    setFindBQuery(e.target.value);
                    setFindBIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      jumpToMatch('b', e.shiftKey ? -1 : 1);
                    } else if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) {
                      e.preventDefault();
                      setFindBOpen(false);
                    } else if (e.key === 'Escape') {
                      setFindBOpen(false);
                    }
                  }}
                  placeholder="이 영역에서 찾기"
                  className="h-7 w-40 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 text-sm"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 w-14 text-right">
                  {bMatches.length ? `${(findBIndex % bMatches.length) + 1}/${bMatches.length}` : '0/0'}
                </span>
                <button
                  type="button"
                  onClick={() => jumpToMatch('b', -1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => jumpToMatch('b', 1)}
                  className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  다음
                </button>
                <button
                  type="button"
                  onClick={() => setFindBOpen(false)}
                  className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>

        {(a || b) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  글자수 비교
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <div>
                    A 문자수: <strong>{stat.a.charCount}</strong> (공백제외{' '}
                    <strong>{stat.a.charCountNoSpace}</strong>)
                  </div>
                  <div>
                    B 문자수: <strong>{stat.b.charCount}</strong> (공백제외{' '}
                    <strong>{stat.b.charCountNoSpace}</strong>)
                  </div>
                  <div>
                    차이:{' '}
                    <strong>
                      {Math.abs(stat.a.charCount - stat.b.charCount)}
                    </strong>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  주요 표현 비교(단어)
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  <div className="mb-1">공통</div>
                  {commonWords.length ? (
                    <div className="mb-3">
                      {commonWords.slice(0, 10).map((k) => (
                        <span
                          key={k.word}
                          className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                        >
                          #{k.word}{' '}
                          <span className="opacity-70">
                            A:{k.a} / B:{k.b}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      공통 단어가 부족합니다.
                    </div>
                  )}
                  <div className="mb-1">A 고유</div>
                  <div className="mb-3">
                    {words.a.length ? (
                      uniqueWords(words.a, words.b)
                        .slice(0, 10)
                        .map((k) => (
                          <span
                            key={k.word}
                            className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200"
                          >
                            #{k.word}{' '}
                            <span className="opacity-70">x{k.count}</span>
                          </span>
                        ))
                    ) : (
                      <span className="text-xs text-gray-500">없음</span>
                    )}
                  </div>
                  <div className="mb-1">B 고유</div>
                  <div>
                    {words.b.length ? (
                      uniqueWords(words.b, words.a)
                        .slice(0, 10)
                        .map((k) => (
                          <span
                            key={k.word}
                            className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"
                          >
                            #{k.word}{' '}
                            <span className="opacity-70">x{k.count}</span>
                          </span>
                        ))
                    ) : (
                      <span className="text-xs text-gray-500">없음</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  형태소(한글 토큰) 비교
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  <div className="mb-1">공통</div>
                  {commonTokens.length ? (
                    <div className="mb-3">
                      {commonTokens.map((k) => (
                        <span
                          key={k.word}
                          className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                        >
                          #{k.word}{' '}
                          <span className="opacity-70">
                            A:{k.a} / B:{k.b}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      공통 토큰이 부족합니다.
                    </div>
                  )}
                  <div className="mb-1">A 고유</div>
                  <div className="mb-3">
                    {uniqueATokens.slice(0, 10).map((k) => (
                      <span
                        key={k.word}
                        className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200"
                      >
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    ))}
                    {!uniqueATokens.length && (
                      <span className="text-xs text-gray-500">없음</span>
                    )}
                  </div>
                  <div className="mb-1">B 고유</div>
                  <div>
                    {uniqueBTokens.slice(0, 10).map((k) => (
                      <span
                        key={k.word}
                        className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    ))}
                    {!uniqueBTokens.length && (
                      <span className="text-xs text-gray-500">없음</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        {!a && !b ? (
          <div className="text-xs text-gray-500">
            비교할 텍스트를 입력하세요.
          </div>
        ) : (
          <>
            <div className="mb-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">유사도</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-x-6 gap-y-1">
                <span>
                  코사인: <strong>{Math.round(cosine * 1000) / 10}%</strong>
                </span>
                <span>
                  자카드: <strong>{Math.round(jaccard * 1000) / 10}%</strong>
                </span>
                <span>
                  토큰 A: <strong>{tokenA.length}</strong>
                </span>
                <span>
                  토큰 B: <strong>{tokenB.length}</strong>
                </span>
              </div>
            </div>
            <DiffViewer
              a={a}
              b={b}
              initialMode="unified"
              initialGranularity="word"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DocComparePage;

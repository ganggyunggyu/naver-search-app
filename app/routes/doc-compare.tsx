import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from './+types/doc-compare';
import { analyzeManuscript, normalizeForCopy, cn } from '@/shared';
import DiffViewer from '@/features/doc/components/_DiffViewer';
import { FileText, Search, BarChart3, GitCompare } from 'lucide-react';

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
    const t = text || '';
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

  const jumpToMatch = (which: 'a' | 'b', dir: 1 | -1 = 1) => {
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

  const onKeyDownFindA: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
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

  const onKeyDownFindB: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
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

  const words: Pair<{ word: string; count: number }[]> = useMemo(
    () => ({ a: stat.a.topKeywords, b: stat.b.topKeywords }),
    [stat]
  );

  const commonWords = useMemo(() => intersectWords(words.a, words.b), [words]);

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
    <div className={cn('min-h-screen bg-white dark:bg-black transition-colors duration-300')}>
      {/* 배경 패턴 */}
      <div className={cn('absolute inset-0 -z-10')}>
        <div
          className={cn(
            'absolute inset-0 opacity-[0.015] dark:opacity-[0.03]',
            'bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)]',
            'dark:bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)]'
          )}
          style={{ backgroundSize: '24px 24px' }}
        />
      </div>

      <div className={cn('relative')}>
        <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16')}>
          {/* 헤더 */}
          <div className={cn('text-center mb-12')}>
            <div className={cn('inline-flex items-center gap-3 mb-4')}>
              <div className={cn('w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center')}>
                <GitCompare size={24} className="text-white dark:text-black" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black dark:text-white">
                문서 비교
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              두 개의 원고를 비교하여 차이점과 유사성을 분석합니다
            </p>
          </div>

          {/* 원고 입력 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div
              className={cn(
                'rounded-2xl border p-6 relative',
                'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
                'shadow-sm hover:shadow-md transition-shadow duration-200'
              )}
            >
              <div className={cn('flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-900')}>
                <div className={cn('w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center border border-green-200 dark:border-green-800')}>
                  <FileText size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  원고 A
                </h3>
              </div>
              <textarea
                ref={aRef}
                value={a}
                onChange={onChangeA}
                onKeyDown={onKeyDownFindA}
                rows={12}
                placeholder="첫 번째 문서를 여기에 붙여넣으세요..."
                className={cn(
                  'w-full px-4 py-3 rounded-xl border resize-none',
                  'border-gray-200 dark:border-gray-800',
                  'bg-gray-50 dark:bg-gray-950',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-500 dark:placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400',
                  'focus:border-transparent',
                  'transition-colors duration-200'
                )}
              />
              {findAOpen && (
                <div className={cn(
                  'absolute top-16 right-6 flex items-center gap-2',
                  'rounded-xl border backdrop-blur-sm px-3 py-2 shadow-lg',
                  'bg-white/95 dark:bg-black/95',
                  'border-gray-200 dark:border-gray-800'
                )}>
                  <Search size={14} className="text-gray-400" />
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
                      } else if (
                        (e.metaKey || e.ctrlKey) &&
                        (e.key === 'f' || e.key === 'F')
                      ) {
                        e.preventDefault();
                        setFindAOpen(false);
                      } else if (e.key === 'Escape') {
                        setFindAOpen(false);
                      }
                    }}
                    placeholder="이 영역에서 찾기"
                    className={cn(
                      'h-7 w-36 rounded-lg border px-2 text-sm',
                      'border-gray-200 dark:border-gray-800',
                      'bg-gray-50 dark:bg-gray-950',
                      'focus:outline-none focus:ring-1 focus:ring-green-500'
                    )}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-center">
                    {aMatches.length
                      ? `${(findAIndex % aMatches.length) + 1}/${aMatches.length}`
                      : '0/0'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => jumpToMatch('a', -1)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        'bg-gray-100 dark:bg-gray-900',
                        'hover:bg-gray-200 dark:hover:bg-gray-800',
                        'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => jumpToMatch('a', 1)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        'bg-gray-100 dark:bg-gray-900',
                        'hover:bg-gray-200 dark:hover:bg-gray-800',
                        'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => setFindAOpen(false)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        'bg-gray-100 dark:bg-gray-900',
                        'hover:bg-gray-200 dark:hover:bg-gray-800',
                        'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className={cn(
                'rounded-2xl border p-6 relative',
                'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
                'shadow-sm hover:shadow-md transition-shadow duration-200'
              )}
            >
              <div className={cn('flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-900')}>
                <div className={cn('w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-200 dark:border-blue-800')}>
                  <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  원고 B
                </h3>
              </div>
              <textarea
                ref={bRef}
                value={b}
                onChange={onChangeB}
                onKeyDown={onKeyDownFindB}
                rows={12}
                placeholder="두 번째 문서를 여기에 붙여넣으세요..."
                className={cn(
                  'w-full px-4 py-3 rounded-xl border resize-none',
                  'border-gray-200 dark:border-gray-800',
                  'bg-gray-50 dark:bg-gray-950',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-500 dark:placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                  'focus:border-transparent',
                  'transition-colors duration-200'
                )}
              />
              {findBOpen && (
                <div className={cn(
                  'absolute top-16 right-6 flex items-center gap-2',
                  'rounded-xl border backdrop-blur-sm px-3 py-2 shadow-lg',
                  'bg-white/95 dark:bg-black/95',
                  'border-gray-200 dark:border-gray-800'
                )}>
                  <Search size={14} className="text-gray-400" />
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
                      } else if (
                        (e.metaKey || e.ctrlKey) &&
                        (e.key === 'f' || e.key === 'F')
                      ) {
                        e.preventDefault();
                        setFindBOpen(false);
                      } else if (e.key === 'Escape') {
                        setFindBOpen(false);
                      }
                    }}
                    placeholder="이 영역에서 찾기"
                    className={cn(
                      'h-7 w-36 rounded-lg border px-2 text-sm',
                      'border-gray-200 dark:border-gray-800',
                      'bg-gray-50 dark:bg-gray-950',
                      'focus:outline-none focus:ring-1 focus:ring-blue-500'
                    )}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-center">
                    {bMatches.length
                      ? `${(findBIndex % bMatches.length) + 1}/${bMatches.length}`
                      : '0/0'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => jumpToMatch('b', -1)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        'bg-gray-100 dark:bg-gray-900',
                        'hover:bg-gray-200 dark:hover:bg-gray-800',
                        'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => jumpToMatch('b', 1)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        'bg-gray-100 dark:bg-gray-900',
                        'hover:bg-gray-200 dark:hover:bg-gray-800',
                        'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => setFindBOpen(false)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        'bg-gray-100 dark:bg-gray-900',
                        'hover:bg-gray-200 dark:hover:bg-gray-800',
                        'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 통계 영역 */}
          {(a || b) && (
            <div
              className={cn(
                'rounded-2xl border p-6 max-w-7xl mx-auto',
                'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
                'shadow-sm hover:shadow-md transition-shadow duration-200'
              )}
            >
              <div className={cn('flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-900')}>
                <div className={cn('w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center')}>
                  <BarChart3 size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  문서 분석 결과
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <div className={cn('flex items-center gap-2 mb-4')}>
                    <div className={cn('w-2 h-2 rounded-full bg-green-500')} />
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      글자수 비교
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className={cn('p-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900')}>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">문서 A</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        전체: <span className="font-semibold text-black dark:text-white">{stat.a.charCount}</span>  |  공백제외: <span className="font-semibold text-black dark:text-white">{stat.a.charCountNoSpace}</span>
                      </div>
                    </div>
                    <div className={cn('p-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900')}>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">문서 B</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        전체: <span className="font-semibold text-black dark:text-white">{stat.b.charCount}</span>  |  공백제외: <span className="font-semibold text-black dark:text-white">{stat.b.charCountNoSpace}</span>
                      </div>
                    </div>
                    <div className={cn('p-3 rounded-lg bg-black dark:bg-white border border-gray-200 dark:border-gray-800')}>
                      <div className="text-sm font-semibold text-white dark:text-black">
                        차이: {Math.abs(stat.a.charCount - stat.b.charCount)}글자
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className={cn('flex items-center gap-2 mb-4')}>
                    <div className={cn('w-2 h-2 rounded-full bg-blue-500')} />
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      키워드 분석
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {/* 공통 키워드 */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        공통 키워드 ({commonWords.length}개)
                      </div>
                      {commonWords.length ? (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {commonWords.map((k) => (
                            <span
                              key={k.word}
                              className={cn(
                                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm',
                                'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
                                'border border-gray-200 dark:border-gray-800'
                              )}
                            >
                              {k.word}
                              <span className="text-xs opacity-70 ml-1">
                                A:{k.a} B:{k.b}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center bg-gray-50 dark:bg-gray-950 rounded-lg">
                          공통 단어가 발견되지 않았습니다
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* A 고유 */}
                      <div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                          A 고유 키워드 ({uniqueWords(words.a, words.b).length}개)
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {words.a.length && uniqueWords(words.a, words.b).length ? (
                            uniqueWords(words.a, words.b).map((k) => (
                              <span
                                key={k.word}
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs',
                                  'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200',
                                  'border border-green-200 dark:border-green-800'
                                )}
                              >
                                {k.word}
                                <span className="opacity-70">{k.count}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">없음</span>
                          )}
                        </div>
                      </div>

                      {/* B 고유 */}
                      <div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                          B 고유 키워드 ({uniqueWords(words.b, words.a).length}개)
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {words.b.length && uniqueWords(words.b, words.a).length ? (
                            uniqueWords(words.b, words.a).map((k) => (
                              <span
                                key={k.word}
                                className={cn(
                                  'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs',
                                  'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200',
                                  'border border-blue-200 dark:border-blue-800'
                                )}
                              >
                                {k.word}
                                <span className="opacity-70">{k.count}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">없음</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 유사도 및 Diff 비교 */}
          <div className="mt-8 space-y-8">
            {!a && !b ? (
              <div
                className={cn(
                  'text-center py-16 rounded-2xl border',
                  'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
                  'shadow-sm'
                )}
              >
                <div className={cn('w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center')}>
                  <FileText size={24} className="text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  문서를 입력해주세요
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  비교할 두 개의 문서를 위 텍스트 영역에 붙여넣으세요
                </p>
              </div>
            ) : (
              <React.Fragment>
                {/* 유사도 지표 */}
                <div
                  className={cn(
                    'rounded-2xl border p-6',
                    'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
                    'shadow-sm hover:shadow-md transition-shadow duration-200'
                  )}
                >
                  <div className={cn('flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-900')}>
                    <div className={cn('w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center')}>
                      <BarChart3 size={20} className="text-white dark:text-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">
                      유사도 분석
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={cn('text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900')}>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.round(cosine * 1000) / 10}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">코사인 유사도</div>
                    </div>
                    <div className={cn('text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900')}>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(jaccard * 1000) / 10}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">자카드 유사도</div>
                    </div>
                    <div className={cn('text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900')}>
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {tokenA.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">문서 A 토큰</div>
                    </div>
                    <div className={cn('text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900')}>
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {tokenB.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">문서 B 토큰</div>
                    </div>
                  </div>
                </div>

                {/* Diff 비교 */}
                <div
                  className={cn(
                    'rounded-2xl border overflow-hidden',
                    'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
                    'shadow-sm'
                  )}
                >
                  <div className={cn('px-6 py-4 border-b border-gray-100 dark:border-gray-900')}>
                    <div className={cn('flex items-center gap-3')}>
                      <div className={cn('w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center')}>
                        <GitCompare size={16} className="text-white dark:text-black" />
                      </div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        차이점 비교
                      </h3>
                    </div>
                  </div>
                  <DiffViewer
                    a={a}
                    b={b}
                    initialMode="unified"
                    initialGranularity="word"
                  />
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocComparePage;
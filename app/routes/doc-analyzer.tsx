import React, { useMemo, useState } from 'react';
import type { Route } from './+types/doc-analyzer';
import { Copy, FileText } from 'lucide-react';
import {
  analyzeManuscript,
  countKeywordOccurrences,
  extractSubtitles,
  formatManuscriptAnalysis,
  topKoreanTokens,
} from '@/shared';
import {
  DocStatsWidget,
  TokenListWidget,
  SubtitlesWidget,
} from '@/widgets/doc-analyzer';

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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <header className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] flex items-center justify-center gap-2">
          <FileText size={28} className="text-[var(--color-primary)]" />
          문서 분석
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          원고 텍스트를 붙여넣고 통계를 확인하세요
        </p>
      </header>

      <section
        aria-labelledby="input-section"
        className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)] mb-6"
      >
        <h2 id="input-section" className="sr-only">
          입력 섹션
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="text-input"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
            >
              원고 텍스트
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="여기에 텍스트를 붙여넣으세요"
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all resize-none"
            />
          </div>
          <div>
            <label
              htmlFor="keywords-input"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
            >
              핵심 키워드 (쉼표로 구분)
            </label>
            <input
              id="keywords-input"
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="예: 라미네이트, 충치, 가격"
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {text && (
        <article className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
          <header className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              분석 결과
            </h2>
            <div className="flex gap-2">
              <button
                onClick={copyAnalysis}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-all"
              >
                <Copy size={14} />
                분석 복사
              </button>
            </div>
          </header>

          <div className="flex flex-col gap-6">
            <DocStatsWidget analysis={analysis} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TokenListWidget
                title="형태소 Top (한글 토큰)"
                tokens={morphTop}
                emptyMessage="토큰이 충분하지 않습니다."
                variant="primary"
              />
              <TokenListWidget
                title="핵심 키워드 개수"
                tokens={keywordCounts}
                emptyMessage="키워드를 입력하면 개수를 집계합니다."
                variant="success"
              />
            </div>

            <SubtitlesWidget subtitles={subtitles} onCopy={copySubtitles} />
          </div>
        </article>
      )}
    </main>
  );
};

export default DocAnalyzerPage;

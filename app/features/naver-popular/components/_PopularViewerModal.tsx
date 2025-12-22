import React, { useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { X, ExternalLink, FileText, BarChart3, Copy } from 'lucide-react';
import { popularQueryAtom } from '@/features/naver-popular/store';
import type { PopularItem } from '@/entities/naver/_types';
import { analyzeManuscript, formatManuscriptAnalysis } from '@/shared';
import { useToast } from '@/shared/ui/Toast';
import { copyFullContentToClipboard, removeExternalLinks } from '@/features/naver-popular/lib';

export interface PopularViewerItem extends PopularItem {
  content?: string;
  blogName?: string;
  actualUrl?: string;
}

interface Props {
  open: boolean;
  loading: boolean;
  item: PopularViewerItem | null;
  onClose: () => void;
}

export const PopularViewerModal: React.FC<Props> = ({
  open,
  loading,
  item,
  onClose,
}) => {
  const [query] = useAtom(popularQueryAtom);
  const { show } = useToast();
  const content = item?.content || '';

  const analysis = useMemo(
    () => analyzeManuscript(content, query),
    [content, query]
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open, onClose]);

  const copyAnalysis = async () => {
    if (!item) return;
    try {
      const text = formatManuscriptAnalysis(analysis, {
        title: item.title,
        url: item.link,
      });
      await navigator.clipboard.writeText(text);
      show('분석 결과가 복사되었습니다!', { type: 'success' });
    } catch {
      show('복사 실패', { type: 'error' });
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
      className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Container - Bottom Sheet on mobile, Center Modal on desktop */}
      <article
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl sm:mx-4 max-h-[90vh] sm:max-h-[85vh] bg-[var(--color-surface)]
          rounded-t-2xl sm:rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden
          animate-slide-up sm:animate-fade-in flex flex-col"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
              {item?.blogName || '네이버 블로그'}
            </p>
            <h2
              id="viewer-title"
              className="text-base font-semibold text-[var(--color-text-primary)] line-clamp-2"
            >
              {item?.title || '제목 없음'}
            </h2>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {item?.link && (
              <>
                <button
                  onClick={() =>
                    window.open(item.link, '_blank', 'noopener,noreferrer')
                  }
                  className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors"
                  aria-label="원문 보기"
                  title="원문 보기"
                >
                  <ExternalLink size={18} />
                </button>
                <button
                  onClick={() => copyFullContentToClipboard(item.link!, show)}
                  className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors"
                  aria-label="본문 복사"
                  title="본문 복사"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={copyAnalysis}
                  className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors"
                  aria-label="분석 복사"
                  title="분석 복사"
                >
                  <BarChart3 size={18} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Thumbnail & URL */}
          <section className="p-4 border-b border-[var(--color-border)]">
            <div className="flex gap-4">
              {item?.image ? (
                <img
                  src={item.image}
                  alt="대표 이미지"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[var(--color-bg-tertiary)] flex flex-col items-center justify-center flex-shrink-0">
                  <FileText
                    size={24}
                    className="text-[var(--color-text-tertiary)]"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  URL
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] break-all line-clamp-3">
                  {item?.link}
                </p>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-lg bg-[var(--color-primary-soft)]">
                <BarChart3 size={16} className="text-[var(--color-primary)]" />
              </span>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                문서 분석
              </h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: '문자수', value: analysis.charCount },
                { label: '공백제외', value: analysis.charCountNoSpace },
                { label: '단어수', value: analysis.wordCount },
                { label: '예상시간', value: `${analysis.readingTimeMin}분` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center p-2 rounded-lg bg-[var(--color-bg-tertiary)]"
                >
                  <p className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
                    {value}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Keywords */}
            {analysis.topKeywords.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                    주요 키워드
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {analysis.topKeywords.length}개
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.topKeywords.slice(0, 10).map((k, index) => (
                    <span
                      key={k.word}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        index < 3
                          ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      #{k.word}
                      <span className="opacity-60">x{k.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Content Section */}
          <section className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[var(--color-text-tertiary)]" />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                본문 내용
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    불러오는 중...
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <pre className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap font-sans leading-relaxed">
                  {item?.content ? removeExternalLinks(item.content) : '본문이 비어있습니다.'}
                </pre>
              </div>
            )}
          </section>
        </div>

        {/* Mobile drag indicator */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
        </div>
      </article>
    </div>
  );
};

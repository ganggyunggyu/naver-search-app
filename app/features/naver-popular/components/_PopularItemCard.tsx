import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Download, Copy, FileText, Eye, Smartphone, Monitor, Edit, Link2 } from 'lucide-react';
import type { PopularItem } from '@/entities/naver/_types';
import { useToast } from '@/shared/ui/Toast';
import {
  copyFullContentToClipboard,
  copyTitleToClipboard,
  downloadContentToFile,
  copyMobileLinkToClipboard,
  copyDesktopLinkToClipboard,
  copyEditLinkToClipboard,
  copyKeywordWithMobileLink
} from '@/features/naver-popular/lib';
import { useViewerActions, viewerItemAtom } from '@/features';
import { popularQueryAtom } from '@/features/naver-popular/store';

interface Props {
  item: PopularItem;
  position?: number;
  isMatched?: boolean;
  blogId?: string;
}

export const PopularItemCard: React.FC<Props> = ({
  item,
  position,
  isMatched = false,
  blogId
}) => {
  const { show } = useToast();
  const setViewerItem = useSetAtom(viewerItemAtom);
  const { openViewer } = useViewerActions();
  const [keyword] = useAtom(popularQueryAtom);
  const displayLink = item.link.replace('://blog.', '://m.blog.');

  return (
    <article
      className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
        isMatched
          ? 'border-[var(--color-success)] bg-[var(--color-success-soft)]/30'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]'
      }`}
    >
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {position && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-semibold">
              {position}위
            </span>
          )}
          {blogId && (
            <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
              #{blogId}
            </code>
          )}
        </div>
        {isMatched && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-success)] text-white">
            ✓ MATCH
          </span>
        )}
      </header>

      <div className="mb-3">
        <div className="flex items-start gap-2">
          <h3
            onClick={() => window.open(displayLink, '_blank', 'noopener,noreferrer')}
            className="flex-1 text-sm font-medium text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors line-clamp-2"
          >
            {item.title}
          </h3>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="수정 링크 복사"
              onClick={() => copyEditLinkToClipboard(item.link, (m, o) => show(m, o))}
              className="p-1.5 rounded hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
            >
              <Edit size={14} />
            </button>
            <button
              type="button"
              aria-label="제목 복사"
              onClick={() => copyTitleToClipboard(item.title, (m, o) => show(m, o))}
              className="p-1.5 rounded hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        {item.blogName && item.blogLink && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
            <span
              onClick={() => window.open(item.blogLink!, '_blank', 'noopener,noreferrer')}
              className="text-xs text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors"
            >
              {item.blogName}
            </span>
          </div>
        )}
      </div>

      {item.description && (
        <p className="text-xs text-[var(--color-text-tertiary)] mb-3 line-clamp-2">
          {item.description.replace(/<[^>]*>/g, '').slice(0, 100)}
          {item.description.length > 100 ? '...' : ''}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setViewerItem(item);
            openViewer(item.link);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] transition-all active:scale-[0.98]"
        >
          <Eye size={14} />
          <span>자세히</span>
        </button>

        {keyword && (
          <button
            onClick={() =>
              copyKeywordWithMobileLink(keyword, item.link, (m, o) => show(m, o))
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-success)] text-white text-xs font-medium hover:opacity-90 transition-all active:scale-[0.98]"
            title={`${keyword} / 모바일링크 복사`}
          >
            <Link2 size={14} />
            <span>키워드+링크</span>
          </button>
        )}

        <div className="flex gap-1">
          <button
            onClick={() =>
              copyFullContentToClipboard(item.link, (m, o) => show(m, o))
            }
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-all"
          >
            <FileText size={12} />
            <span>본문</span>
          </button>

          <button
            onClick={() =>
              downloadContentToFile(item.link, item.title, (m, o) => show(m, o))
            }
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-all"
          >
            <Download size={12} />
            <span>저장</span>
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() =>
              copyMobileLinkToClipboard(item.link, (m, o) => show(m, o))
            }
            className="p-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-hover)] transition-all"
            title="모바일 링크 복사"
          >
            <Smartphone size={12} />
          </button>

          <button
            onClick={() =>
              copyDesktopLinkToClipboard(item.link, (m, o) => show(m, o))
            }
            className="p-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-hover)] transition-all"
            title="데스크탑 링크 복사"
          >
            <Monitor size={12} />
          </button>
        </div>
      </div>

      <footer className="mt-3 pt-2 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-tertiary)] truncate">
          {item.link.replace('https://', '').slice(0, 60)}...
        </p>
      </footer>
    </article>
  );
};

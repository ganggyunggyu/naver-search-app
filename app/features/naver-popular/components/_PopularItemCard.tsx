import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  Download,
  Copy,
  FileText,
  Eye,
  Smartphone,
  Monitor,
  Edit,
  Link2,
} from 'lucide-react';
import type { PopularItem } from '@/entities/naver/_types';
import { useToast } from '@/shared/ui/Toast';
import { Button } from '@/shared/ui';
import {
  copyFullContentToClipboard,
  copyTitleToClipboard,
  downloadContentToFile,
  copyMobileLinkToClipboard,
  copyDesktopLinkToClipboard,
  copyEditLinkToClipboard,
  copyKeywordWithMobileLink,
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
  blogId,
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
            onClick={() =>
              window.open(displayLink, '_blank', 'noopener,noreferrer')
            }
            className="flex-1 text-sm font-medium text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors line-clamp-2"
          >
            {item.title}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              icon={<Edit size={14} />}
              aria-label="수정 링크 복사"
              onClick={() =>
                copyEditLinkToClipboard(item.link, (m, o) => show(m, o))
              }
            />
            <Button
              variant="ghost"
              icon={<Copy size={14} />}
              aria-label="제목 복사"
              onClick={() =>
                copyTitleToClipboard(item.title, (m, o) => show(m, o))
              }
            />
          </div>
        </div>

        {item.blogName && item.blogLink && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
            <span
              onClick={() =>
                window.open(item.blogLink!, '_blank', 'noopener,noreferrer')
              }
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
        <Button
          variant="primary"
          size="sm"
          icon={<Eye size={14} />}
          onClick={() => {
            setViewerItem(item);
            openViewer(item.link);
          }}
        >
          자세히
        </Button>

        {keyword && (
          <Button
            variant="success"
            size="sm"
            icon={<Link2 size={14} />}
            onClick={() =>
              copyKeywordWithMobileLink(keyword, item.link, (m, o) =>
                show(m, o)
              )
            }
            title={`${keyword} / 모바일링크 복사`}
          >
            키워드+링크
          </Button>
        )}

        <div className="flex gap-1">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileText size={12} />}
            onClick={() =>
              copyFullContentToClipboard(item.link, (m, o) => show(m, o))
            }
          >
            본문
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={12} />}
            onClick={() =>
              downloadContentToFile(item.link, item.title, (m, o) =>
                show(m, o)
              )
            }
          >
            저장
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            variant="secondary"
            icon={<Smartphone size={12} />}
            onClick={() =>
              copyMobileLinkToClipboard(item.link, (m, o) => show(m, o))
            }
            title="모바일 링크 복사"
          />

          <Button
            variant="secondary"
            icon={<Monitor size={12} />}
            onClick={() =>
              copyDesktopLinkToClipboard(item.link, (m, o) => show(m, o))
            }
            title="데스크탑 링크 복사"
          />
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

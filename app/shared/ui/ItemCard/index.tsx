import React from 'react';
import { Button } from '@/shared';

interface ActionButton {
  variant: 'success' | 'primary' | 'warning' | 'info' | 'secondary';
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}

interface ItemCardProps {
  title: string;
  link: string;
  displayLink?: string;
  blogName?: string;
  blogLink?: string;
  description?: string;
  position?: number;
  isMatched?: boolean;
  blogId?: string;
  actions: ActionButton[];
}

export const ItemCard: React.FC<ItemCardProps> = ({
  title,
  link,
  displayLink,
  blogName,
  blogLink,
  description,
  position,
  isMatched = false,
  blogId,
  actions,
}) => {
  const cleanTitle = title.replace(/<[^>]*>/g, '');
  const cleanDescription = description?.replace(/<[^>]*>/g, '');
  const finalDisplayLink = displayLink || link.replace('://blog.', '://m.blog.');

  return (
    <article className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:shadow-[var(--shadow-card-hover)] transition-all">
      <div className="flex flex-col gap-3">
        <div className="flex-1 min-w-0">
          {position && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] text-xs font-bold text-[var(--color-text-secondary)]">
                {position}
              </span>
              {isMatched && blogId && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] text-xs font-medium">
                  매칭!
                </span>
              )}
              {blogId && (
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  #{blogId}
                </span>
              )}
            </div>
          )}

          <a
            href={finalDisplayLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors line-clamp-2"
          >
            {cleanTitle}
          </a>

          {blogName && blogLink && (
            <p className="mt-1.5">
              <a
                href={blogLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                {blogName}
              </a>
            </p>
          )}

          {description && (
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] line-clamp-2">
              {cleanDescription}
            </p>
          )}

          <p className="mt-2 text-xs text-[var(--color-text-tertiary)] truncate font-mono">
            {link}
          </p>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                icon={action.icon}
                onClick={action.onClick}
              >
                {action.children}
              </Button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

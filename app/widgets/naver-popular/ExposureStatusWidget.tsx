import React from 'react';
import type { PopularItem } from '@/entities/naver/_types';

interface MatchItem {
  id: string;
  item: PopularItem;
}

interface ExposureStatusWidgetProps {
  matchedIdList: MatchItem[];
}

export const ExposureStatusWidget: React.FC<ExposureStatusWidgetProps> = ({
  matchedIdList,
}) => {
  const hasMatches = matchedIdList.length > 0;

  return (
    <section
      aria-labelledby="exposure-heading"
      className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
    >
      <header className="flex items-center justify-between gap-3">
        <h3
          id="exposure-heading"
          className="text-base font-semibold text-[var(--color-text-primary)]"
        >
          노출 항목
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-secondary)]">상태:</span>
          {hasMatches ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-success-soft)] text-[var(--color-success)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              {matchedIdList.length}개 발견
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-error-soft)] text-[var(--color-error)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)]" />
              매칭 없음
            </span>
          )}
        </div>
      </header>

      {hasMatches && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {matchedIdList.map((el, idx) => (
            <li
              key={`popular-match-${el.id}-${idx}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-sm"
            >
              <code className="font-mono font-semibold text-[var(--color-primary)]">
                #{el.id}
              </code>
              <span className="text-[var(--color-text-secondary)]">
                {el.item.blogName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

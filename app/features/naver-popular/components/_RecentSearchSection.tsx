import React from 'react';
import { Trash2 } from 'lucide-react';
import type { RecentSearch } from '../types';
import { RecentSearchItem } from './_RecentSearchItem';

type ExposureStatus = 'exposed' | 'notExposed' | 'unchecked';

interface RecentSearchSectionProps {
  title: string;
  items: RecentSearch[];
  status: ExposureStatus;
  onRemove: (query: string) => void;
  onClearSection?: () => void;
}

const STATUS_STYLES: Record<ExposureStatus, string> = {
  exposed: 'text-[var(--color-success)]',
  notExposed: 'text-[var(--color-error)]',
  unchecked: 'text-[var(--color-text-tertiary)]',
};

export const RecentSearchSection: React.FC<RecentSearchSectionProps> = ({
  title,
  items,
  status,
  onRemove,
  onClearSection,
}) => {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs font-medium ${STATUS_STYLES[status]}`}>
          {title} ({items.length})
        </div>
        {onClearSection && items.length > 1 && (
          <button
            type="button"
            onClick={onClearSection}
            className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors"
          >
            <Trash2 size={10} />
            <span>삭제</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <RecentSearchItem
            key={item.query}
            query={item.query}
            status={status}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

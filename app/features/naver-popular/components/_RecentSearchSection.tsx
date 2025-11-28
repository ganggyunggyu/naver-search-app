import React from 'react';
import type { RecentSearch } from '../types';
import { RecentSearchItem } from './_RecentSearchItem';

type ExposureStatus = 'exposed' | 'notExposed' | 'unchecked';

interface RecentSearchSectionProps {
  title: string;
  items: RecentSearch[];
  status: ExposureStatus;
  onRemove: (query: string) => void;
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
}) => {
  if (items.length === 0) return null;

  return (
    <div>
      <div className={`text-xs font-medium mb-2 ${STATUS_STYLES[status]}`}>
        {title} ({items.length})
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

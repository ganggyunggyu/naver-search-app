import React from 'react';
import { cn } from '@/shared';
import type { RecentSearch } from '../types';
import { RecentSearchItem } from './_RecentSearchItem';

type ExposureStatus = 'exposed' | 'notExposed' | 'unchecked';

interface RecentSearchSectionProps {
  title: string;
  items: RecentSearch[];
  status: ExposureStatus;
  onRemove: (query: string) => void;
}

const TITLE_STYLES: Record<ExposureStatus, string> = {
  notExposed: 'text-red-600 dark:text-red-400',
  exposed: 'text-green-600 dark:text-green-400',
  unchecked: 'text-gray-500 dark:text-gray-400',
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
      <div className={cn('text-xs mb-2 font-medium', TITLE_STYLES[status])}>
        {title} ({items.length})
      </div>
      <div className={cn('flex gap-2 flex-wrap')}>
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

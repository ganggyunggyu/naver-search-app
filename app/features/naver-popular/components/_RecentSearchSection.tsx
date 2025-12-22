import React from 'react';
import { Trash2 } from 'lucide-react';
import type { RecentSearch } from '../types';
import { RecentSearchItem } from './_RecentSearchItem';
import { Button } from '@/shared/ui';

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
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs font-medium ${STATUS_STYLES[status]}`}>
          {title} ({items.length})
        </div>
        {onClearSection && items.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={10} />}
            onClick={onClearSection}
            className="text-[10px]! text-text-tertiary! hover:text-error! px-1.5! py-0.5!"
          >
            삭제
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 max-h-[20vh] overflow-y-auto overflow-x-hidden p-1 -m-1">
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

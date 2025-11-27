import React from 'react';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { cn } from '@/shared';

type ExposureStatus = 'exposed' | 'notExposed' | 'unchecked';

interface RecentSearchItemProps {
  query: string;
  status: ExposureStatus;
  onRemove: (query: string) => void;
}

const STATUS_STYLES: Record<ExposureStatus, string> = {
  notExposed:
    'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  exposed:
    'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  unchecked:
    'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
};

export const RecentSearchItem: React.FC<RecentSearchItemProps> = ({
  query,
  status,
  onRemove,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium',
        'border transition-all duration-200',
        STATUS_STYLES[status]
      )}
    >
      <button
        onClick={() => navigate(`/${encodeURIComponent(query)}`)}
        className={cn('hover:opacity-70 transition-opacity')}
      >
        {query}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(query);
        }}
        className={cn(
          'ml-1 w-3 h-3 flex items-center justify-center rounded-full',
          'hover:bg-black/10 dark:hover:bg-white/10',
          'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
        aria-label={`${query} 검색어 삭제`}
      >
        <X size={10} />
      </button>
    </div>
  );
};

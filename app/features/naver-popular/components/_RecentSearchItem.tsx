import React from 'react';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';

type ExposureStatus = 'exposed' | 'notExposed' | 'unchecked';

interface RecentSearchItemProps {
  query: string;
  status: ExposureStatus;
  onRemove: (query: string) => void;
}

const STATUS_BG: Record<ExposureStatus, string> = {
  exposed: 'bg-[var(--color-success-soft)]',
  notExposed: 'bg-[var(--color-error-soft)]',
  unchecked: 'bg-[var(--color-bg-tertiary)]',
};

const STATUS_TEXT: Record<ExposureStatus, string> = {
  exposed: 'text-[var(--color-success)]',
  notExposed: 'text-[var(--color-error)]',
  unchecked: 'text-[var(--color-text-secondary)]',
};

export const RecentSearchItem: React.FC<RecentSearchItemProps> = ({
  query,
  status,
  onRemove,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full text-sm transition-all ${STATUS_BG[status]}`}
    >
      <button
        onClick={() => navigate(`/${encodeURIComponent(query)}`)}
        className={`font-medium ${STATUS_TEXT[status]}`}
      >
        {query}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(query);
        }}
        aria-label={`${query} 검색어 삭제`}
        className="p-1 rounded-full hover:bg-black/5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
};

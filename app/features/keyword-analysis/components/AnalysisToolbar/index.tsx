import React from 'react';
import { LayoutGrid, Table, Download, Share2, ArrowUpDown } from 'lucide-react';
import type { SortBy, ViewMode } from '@/features/keyword-analysis/types';

interface AnalysisToolbarProps {
  sortBy: SortBy;
  viewMode: ViewMode;
  onSortChange: (sortBy: SortBy) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
  onDownload: () => void;
  onShare: () => void;
  count: number;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'score', label: '추천 점수' },
  { value: 'search', label: '검색량' },
  { value: 'blog', label: '발행량' },
  { value: 'saturation', label: '포화지수' },
];

export const AnalysisToolbar: React.FC<AnalysisToolbarProps> = ({
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  onDownload,
  onShare,
  count,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-text-primary">분석 결과</h2>
        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
          {count}개
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Sort Options */}
        <div className="flex items-center gap-1 p-1 bg-hover rounded-xl">
          <ArrowUpDown className="w-4 h-4 text-text-tertiary ml-2" />
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onSortChange(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                sortBy === value
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* View Mode */}
        <div className="flex p-1 bg-hover rounded-xl">
          <button
            type="button"
            onClick={() => onViewModeChange('card')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'card'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
            title="카드 뷰"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
            title="테이블 뷰"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onShare}
            className="p-2 text-text-tertiary hover:text-primary hover:bg-hover rounded-xl transition-all"
            title="공유하기"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-text-secondary hover:text-primary bg-hover hover:bg-primary/10 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>
    </div>
  );
};

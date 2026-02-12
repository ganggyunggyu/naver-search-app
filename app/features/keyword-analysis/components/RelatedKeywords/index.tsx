import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import type { RelatedKeyword } from '../types';
import { getCompColor } from '../utils';

interface RelatedKeywordsProps {
  keywords: RelatedKeyword[];
  onSelectKeyword: (keyword: string) => void;
}

export const RelatedKeywords: React.FC<RelatedKeywordsProps> = ({ keywords, onSelectKeyword }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (keywords.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-[var(--color-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[var(--color-text-primary)]">연관 키워드</h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">{keywords.length}개의 관련 키워드 발견</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--color-text-tertiary)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--color-text-tertiary)]" />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-2">
            {keywords.map((related, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectKeyword(related.keyword)}
                className="group flex items-center gap-2 px-4 py-2.5 bg-[var(--color-hover)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-all hover:shadow-md"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                  {related.keyword}
                </span>
                <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)]">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs">{related.totalSearch.toLocaleString()}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCompColor(related.compIdx)}`}>
                  {related.compIdx}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Search, TrendingUp, Target, Zap } from 'lucide-react';

interface EmptyStateProps {
  onExampleClick?: (keyword: string) => void;
}

const EXAMPLE_KEYWORDS = ['위고비', '다이어트', '헬스장', '애플워치'];

export const EmptyState: React.FC<EmptyStateProps> = ({ onExampleClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative p-6 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-3xl border border-[var(--color-primary)]/20">
          <Search className="w-12 h-12 text-[var(--color-primary)]" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">키워드 분석 시작하기</h2>
      <p className="text-sm text-[var(--color-text-tertiary)] text-center max-w-sm mb-8">
        분석하고 싶은 키워드를 입력하고 Enter를 눌러주세요.
        <br />
        최대 5개까지 동시에 분석할 수 있어요.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {EXAMPLE_KEYWORDS.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onExampleClick?.(keyword)}
            className="px-4 py-2.5 bg-[var(--color-hover)] hover:bg-[var(--color-primary)]/10 border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all"
          >
            {keyword}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--color-text-tertiary)]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <span>검색량 분석</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <span>포화지수 측정</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <span>추천 점수</span>
        </div>
      </div>
    </div>
  );
};

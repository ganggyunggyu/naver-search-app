import React from 'react';
import { FileText, Hash, Clock } from 'lucide-react';

interface Analysis {
  charCount: number;
  charCountNoSpace: number;
  wordCount: number;
  readingTimeMin: number;
}

interface DocStatsWidgetProps {
  analysis: Analysis;
}

export const DocStatsWidget: React.FC<DocStatsWidgetProps> = ({ analysis }) => {
  const stats = [
    { label: '문자수', value: analysis.charCount, icon: FileText },
    { label: '공백제외', value: analysis.charCountNoSpace, icon: Hash },
    { label: '단어수', value: analysis.wordCount, icon: Hash },
    { label: '예상 읽기', value: `${analysis.readingTimeMin}분`, icon: Clock },
  ];

  return (
    <section
      aria-labelledby="stats-heading"
      className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]"
    >
      <h3
        id="stats-heading"
        className="text-sm font-semibold text-[var(--color-text-primary)] mb-3"
      >
        문서 통계
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center p-3 rounded-lg bg-[var(--color-surface)]"
          >
            <Icon size={16} className="text-[var(--color-text-tertiary)] mb-1" />
            <span className="text-lg font-bold text-[var(--color-text-primary)]">
              {value}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

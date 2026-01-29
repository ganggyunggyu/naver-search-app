import React from 'react';
import { TrendingUp, FileText, Target, Award } from 'lucide-react';
import type { KeywordAnalysis } from '../types';

interface AnalysisSummaryProps {
  analyses: KeywordAnalysis[];
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ analyses }) => {
  if (analyses.length === 0) return null;

  const totalSearchVolume = analyses.reduce((sum, a) => sum + a.totalSearch, 0);
  const totalBlogCount = analyses.reduce((sum, a) => sum + a.blogCount, 0);
  const avgSaturation = analyses.reduce((sum, a) => sum + a.saturationIndex, 0) / analyses.length;
  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;

  const bestKeyword = analyses.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  const stats = [
    {
      icon: TrendingUp,
      label: '총 검색량',
      value: totalSearchVolume.toLocaleString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: FileText,
      label: '총 발행량',
      value: totalBlogCount.toLocaleString(),
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      icon: Target,
      label: '평균 포화지수',
      value: avgSaturation.toFixed(1),
      color: avgSaturation < 10 ? 'text-emerald-500' : 'text-amber-500',
      bgColor: avgSaturation < 10 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
    },
    {
      icon: Award,
      label: '평균 점수',
      value: avgScore.toFixed(0),
      color: avgScore >= 60 ? 'text-emerald-500' : 'text-amber-500',
      bgColor: avgScore >= 60 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
    },
  ];

  return (
    <div className="p-5 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-hover)] border border-[var(--color-border)] rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">분석 요약</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-primary)]/10 rounded-full">
          <Award className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-xs font-medium text-[var(--color-primary)]">
            추천: {bestKeyword.stat.relKeyword}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color, bgColor }) => (
          <div key={label} className={`p-4 ${bgColor} rounded-xl`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-[var(--color-text-tertiary)]">{label}</span>
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

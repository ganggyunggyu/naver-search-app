import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendData } from '../types';
import { formatPeriod, getTrendDirection } from '../utils';

interface TrendChartProps {
  data: TrendData[];
  compact?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, compact = false }) => {
  if (!data || data.length === 0) return null;

  const maxRatio = Math.max(...data.map((d) => d.ratio));
  const peakIdx = data.findIndex((d) => d.ratio === maxRatio);
  const { direction, percentage } = getTrendDirection(data);

  const TrendIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
  const trendColor = direction === 'up' ? 'text-emerald-500' : direction === 'down' ? 'text-red-500' : 'text-gray-500';

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-end gap-px h-6 w-20">
          {data.slice(-6).map((item, idx) => {
            const height = maxRatio > 0 ? (item.ratio / maxRatio) * 100 : 0;
            return (
              <div
                key={idx}
                className="flex-1 bg-[var(--color-primary)]/50 hover:bg-[var(--color-primary)] rounded-sm transition-colors"
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-medium">{percentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[var(--color-hover)]/50 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">검색 트렌드</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            피크: <span className="text-[var(--color-primary)] font-medium">{formatPeriod(data[peakIdx]?.period)}</span>
          </span>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-1 h-24">
        {data.map((item, idx) => {
          const height = (item.ratio / maxRatio) * 100;
          const isPeak = item.ratio === maxRatio;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
              <span className="text-[10px] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                {item.ratio.toFixed(0)}
              </span>
              <div
                className={`w-full rounded-t-sm transition-all ${
                  isPeak
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-[var(--color-primary)]/30 group-hover:bg-[var(--color-primary)]/50'
                }`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              <span className="text-[9px] text-[var(--color-text-tertiary)]">{formatPeriod(item.period)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

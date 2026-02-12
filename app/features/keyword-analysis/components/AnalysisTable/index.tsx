import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import type { KeywordAnalysis } from '../types';
import { formatNumber, getCompColor, getSaturationInfo, getScoreGrade } from '../utils';
import { TrendChart } from './TrendChart';

interface AnalysisTableProps {
  analyses: KeywordAnalysis[];
  isFavorite: (keyword: string) => boolean;
  onToggleFavorite: (keyword: string) => void;
}

export const AnalysisTable: React.FC<AnalysisTableProps> = ({
  analyses,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div className="overflow-x-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left p-4 font-semibold text-[var(--color-text-secondary)]">키워드</th>
            <th className="text-center p-4 font-semibold text-[var(--color-text-secondary)]">점수</th>
            <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)]">총검색량</th>
            <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)]">PC</th>
            <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)]">모바일</th>
            <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)]">발행량</th>
            <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)]">포화지수</th>
            <th className="text-center p-4 font-semibold text-[var(--color-text-secondary)]">경쟁</th>
            <th className="text-center p-4 font-semibold text-[var(--color-text-secondary)]">트렌드</th>
            <th className="w-10 p-4"></th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((analysis, idx) => {
            const { stat, blogCount, totalSearch, saturationIndex, score, trendData } = analysis;
            const saturation = getSaturationInfo(saturationIndex);
            const scoreGrade = getScoreGrade(score);
            const keyword = stat.relKeyword;

            return (
              <tr
                key={idx}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-hover)]/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(keyword)}
                      className="p-1 hover:bg-[var(--color-hover)] rounded-lg transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFavorite(keyword) ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-text-tertiary)]'
                        }`}
                      />
                    </button>
                    <div>
                      <span className="font-semibold text-[var(--color-text-primary)]">{keyword}</span>
                      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${saturation.bgColor} ${saturation.color}`}>
                        {saturation.label}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${scoreGrade.color} bg-current/10`}>
                    <span className="text-xs">{scoreGrade.emoji}</span>
                    <span className="text-xs font-bold">{score}</span>
                  </div>
                </td>
                <td className="p-4 text-right font-bold text-[var(--color-primary)]">
                  {totalSearch.toLocaleString()}
                </td>
                <td className="p-4 text-right text-[var(--color-text-secondary)]">
                  {formatNumber(stat.monthlyPcQcCnt)}
                </td>
                <td className="p-4 text-right text-[var(--color-text-secondary)]">
                  {formatNumber(stat.monthlyMobileQcCnt)}
                </td>
                <td className="p-4 text-right text-[var(--color-text-secondary)]">
                  {blogCount.toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <span className={`font-semibold ${saturation.color}`}>{saturationIndex.toFixed(1)}</span>
                </td>
                <td className="p-4 text-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCompColor(stat.compIdx)}`}>
                    {stat.compIdx}
                  </span>
                </td>
                <td className="p-4">
                  {trendData && trendData.length > 0 ? (
                    <TrendChart data={trendData} compact />
                  ) : (
                    <span className="text-[var(--color-text-tertiary)]">-</span>
                  )}
                </td>
                <td className="p-4">
                  <a
                    href={`https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-hover)] rounded-lg transition-all inline-block"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

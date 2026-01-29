import React from 'react';
import {
  Star,
  TrendingUp,
  Monitor,
  Smartphone,
  FileText,
  Target,
  Trophy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Zap,
} from 'lucide-react';
import type { KeywordAnalysis, TopExposureData } from '../types';
import { formatNumber, getCompColor, getSaturationInfo, getScoreGrade } from '../utils';
import { TrendChart } from './TrendChart';

interface AnalysisCardProps {
  analysis: KeywordAnalysis;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  exposureData?: TopExposureData;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  isFavorite,
  onToggleFavorite,
  isExpanded,
  onToggleExpand,
  exposureData,
}) => {
  const { stat, blogCount, totalSearch, saturationIndex, score, trendData } = analysis;
  const saturation = getSaturationInfo(saturationIndex);
  const scoreGrade = getScoreGrade(score);

  return (
    <div className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{stat.relKeyword}</h3>
            <button
              type="button"
              onClick={onToggleFavorite}
              className="p-1.5 hover:bg-[var(--color-hover)] rounded-lg transition-colors"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-text-tertiary)]'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${saturation.bgColor}`}>
              <Target className={`w-4 h-4 ${saturation.color}`} />
              <span className={`text-xs font-semibold ${saturation.color}`}>{saturation.label}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getCompColor(stat.compIdx)}`}>
              <span className="text-xs font-semibold">경쟁 {stat.compIdx}</span>
            </div>
          </div>
        </div>

        {/* Score Badge */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  strokeDasharray={`${(score / 100) * 150.8} 150.8`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--color-text-primary)]">{score}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Zap className={`w-4 h-4 ${scoreGrade.color}`} />
                <span className={`text-sm font-bold ${scoreGrade.color}`}>{scoreGrade.label}</span>
              </div>
              <span className="text-xs text-[var(--color-text-tertiary)]">종합 점수</span>
            </div>
          </div>

          {trendData && trendData.length > 0 && (
            <div className="flex-1">
              <TrendChart data={trendData} compact />
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-5">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <StatItem
            icon={TrendingUp}
            label="총 검색량"
            value={totalSearch.toLocaleString()}
            highlight
          />
          <StatItem
            icon={Monitor}
            label="PC"
            value={formatNumber(stat.monthlyPcQcCnt)}
          />
          <StatItem
            icon={Smartphone}
            label="모바일"
            value={formatNumber(stat.monthlyMobileQcCnt)}
          />
          <StatItem
            icon={FileText}
            label="발행량"
            value={blogCount.toLocaleString()}
          />
          <StatItem
            icon={Target}
            label="포화지수"
            value={saturationIndex.toFixed(1)}
            valueColor={saturation.color}
          />
          <StatItem
            icon={Trophy}
            label="광고경쟁"
            value={String(stat.plAvgDepth)}
          />
        </div>

        {/* Trend Chart (Full) */}
        {trendData && trendData.length > 0 && (
          <div className="mt-4">
            <TrendChart data={trendData} />
          </div>
        )}

        {/* Top Exposure Toggle */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-hover)] rounded-xl transition-colors"
        >
          <Trophy className="w-4 h-4" />
          상위 노출 분석
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Top Exposure Content */}
        {isExpanded && (
          <div className="mt-3 p-4 bg-[var(--color-hover)]/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {exposureData?.loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--color-text-tertiary)]">
                <Loader2 className="w-5 h-5 animate-spin" />
                상위 노출 블로그 분석 중...
              </div>
            ) : exposureData?.error ? (
              <div className="text-sm text-red-500 text-center py-4">{exposureData.error}</div>
            ) : exposureData?.items && exposureData.items.length > 0 ? (
              <div className="space-y-3">
                {exposureData.items.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 p-3 bg-[var(--color-surface)] rounded-xl hover:shadow-md transition-all group/item"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-xs font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 group-hover/item:text-[var(--color-primary)] transition-colors">
                            {item.title}
                            <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-0 group-hover/item:opacity-100" />
                          </p>
                          {item.blogName && (
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{item.blogName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)] text-center py-6">
                상위 노출 블로그를 찾을 수 없습니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
  valueColor?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, label, value, highlight, valueColor }) => (
  <div className={`p-3 rounded-xl ${highlight ? 'bg-[var(--color-primary)]/10' : 'bg-[var(--color-hover)]'}`}>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-tertiary)]'}`} />
      <span className="text-[10px] text-[var(--color-text-tertiary)]">{label}</span>
    </div>
    <div className={`text-base font-bold ${valueColor || (highlight ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]')}`}>
      {value}
    </div>
  </div>
);

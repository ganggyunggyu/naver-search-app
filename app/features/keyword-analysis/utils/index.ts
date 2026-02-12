import type { KeywordAnalysis, TrendData } from '@/features/keyword-analysis/types';

export const formatNumber = (num: number | '<10'): string => {
  if (num === '<10') return '<10';
  return num.toLocaleString('ko-KR');
};

export const getTotalSearchNum = (pc: number | '<10', mobile: number | '<10'): number => {
  const pcNum = pc === '<10' ? 0 : pc;
  const mobileNum = mobile === '<10' ? 0 : mobile;
  return pcNum + mobileNum;
};

export const formatPeriod = (period: string): string => {
  const date = new Date(period);
  return `${date.getMonth() + 1}월`;
};

export const getCompColor = (compIdx: string): string => {
  switch (compIdx) {
    case '높음':
      return 'text-red-500 bg-red-500/10';
    case '중간':
      return 'text-amber-500 bg-amber-500/10';
    case '낮음':
      return 'text-emerald-500 bg-emerald-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
};

export const getSaturationInfo = (index: number): { color: string; label: string; bgColor: string } => {
  if (index < 5) {
    return {
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      label: '블루오션',
    };
  }
  if (index < 15) {
    return {
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      label: '적정',
    };
  }
  return {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: '레드오션',
  };
};

export const calculateScore = (analysis: KeywordAnalysis): number => {
  const { totalSearch, saturationIndex, stat } = analysis;

  let score = 0;

  // 검색량 점수 (0-40점)
  if (totalSearch >= 10000) score += 40;
  else if (totalSearch >= 5000) score += 35;
  else if (totalSearch >= 1000) score += 30;
  else if (totalSearch >= 500) score += 20;
  else if (totalSearch >= 100) score += 10;

  // 포화지수 점수 (0-40점) - 낮을수록 좋음
  if (saturationIndex < 3) score += 40;
  else if (saturationIndex < 5) score += 35;
  else if (saturationIndex < 10) score += 25;
  else if (saturationIndex < 15) score += 15;
  else if (saturationIndex < 30) score += 5;

  // 경쟁도 점수 (0-20점) - 낮을수록 좋음
  if (stat.compIdx === '낮음') score += 20;
  else if (stat.compIdx === '중간') score += 10;

  return Math.min(100, score);
};

export const getScoreGrade = (score: number): { label: string; color: string; emoji: string } => {
  if (score >= 80) return { label: '최고', color: 'text-emerald-500', emoji: '🔥' };
  if (score >= 60) return { label: '좋음', color: 'text-blue-500', emoji: '👍' };
  if (score >= 40) return { label: '보통', color: 'text-amber-500', emoji: '👌' };
  return { label: '낮음', color: 'text-gray-500', emoji: '💤' };
};

export const getTrendDirection = (data: TrendData[]): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
  if (!data || data.length < 2) return { direction: 'stable', percentage: 0 };

  const recent = data.slice(-3).reduce((sum, d) => sum + d.ratio, 0) / 3;
  const older = data.slice(0, 3).reduce((sum, d) => sum + d.ratio, 0) / 3;

  if (older === 0) return { direction: 'stable', percentage: 0 };

  const change = ((recent - older) / older) * 100;

  if (change > 10) return { direction: 'up', percentage: Math.round(change) };
  if (change < -10) return { direction: 'down', percentage: Math.round(Math.abs(change)) };
  return { direction: 'stable', percentage: Math.round(Math.abs(change)) };
};

export const generateShareUrl = (keywords: string[]): string => {
  const params = new URLSearchParams({ q: keywords.join(',') });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export const parseUrlKeywords = (): string[] => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (!q) return [];
  return q.split(',').map((k) => k.trim()).filter(Boolean);
};

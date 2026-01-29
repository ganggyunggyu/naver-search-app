export interface KeywordStat {
  relKeyword: string;
  monthlyPcQcCnt: number | '<10';
  monthlyMobileQcCnt: number | '<10';
  monthlyAvePcClkCnt: number;
  monthlyAveMobileClkCnt: number;
  monthlyAvePcCtr: number;
  monthlyAveMobileCtr: number;
  plAvgDepth: number;
  compIdx: string;
}

export interface TrendData {
  period: string;
  ratio: number;
}

export interface KeywordAnalysis {
  stat: KeywordStat;
  blogCount: number;
  totalSearch: number;
  saturationIndex: number;
  score: number;
  trendData: TrendData[] | null;
}

export interface RelatedKeyword {
  keyword: string;
  totalSearch: number;
  compIdx: string;
}

export interface PopularItem {
  title: string;
  link: string;
  blogName?: string;
  blogLink?: string;
  snippet?: string;
  image?: string;
}

export interface TopExposureData {
  loading: boolean;
  items: PopularItem[];
  error?: string;
}

export interface SavedKeyword {
  keyword: string;
  savedAt: string;
}

export interface SearchadResponse {
  keywords: string[];
  stats: KeywordStat[];
  error?: string;
}

export interface DatalabResult {
  title: string;
  keywords: string[];
  data: TrendData[];
}

export interface DatalabResponse {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: DatalabResult[];
  error?: string;
}

export type SortBy = 'search' | 'blog' | 'saturation' | 'score';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'card' | 'table';

export interface AnalysisState {
  analyses: KeywordAnalysis[];
  relatedKeywords: RelatedKeyword[];
  loading: boolean;
  error: string | null;
}

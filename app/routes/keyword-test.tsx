import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  Monitor,
  Smartphone,
  MousePointer,
  BarChart3,
  FileText,
  Gauge,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const meta = () => [{ title: '키워드 분석' }];

interface KeywordStat {
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

interface SearchadResponse {
  keywords: string[];
  stats: KeywordStat[];
  error?: string;
}

interface TrendData {
  period: string;
  ratio: number;
}

interface DatalabResult {
  title: string;
  keywords: string[];
  data: TrendData[];
}

interface DatalabResponse {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: DatalabResult[];
  error?: string;
}

interface BlogCountMap {
  [keyword: string]: number;
}

interface KeywordAnalysis {
  stat: KeywordStat;
  blogCount: number;
  totalSearch: number;
  saturationIndex: number;
  trendData: TrendData[] | null;
}

const formatNumber = (num: number | '<10'): string => {
  if (num === '<10') return '<10';
  return num.toLocaleString('ko-KR');
};

const getCompColor = (compIdx: string): string => {
  switch (compIdx) {
    case '높음':
      return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    case '중간':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    case '낮음':
      return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  }
};

const getSaturationColor = (index: number): { color: string; label: string } => {
  if (index < 5) return { color: 'text-green-500 bg-green-50 dark:bg-green-900/20', label: '블루오션' };
  if (index < 15) return { color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', label: '적정' };
  return { color: 'text-red-500 bg-red-50 dark:bg-red-900/20', label: '레드오션' };
};

const getTotalSearchNum = (pc: number | '<10', mobile: number | '<10'): number => {
  const pcNum = pc === '<10' ? 0 : pc;
  const mobileNum = mobile === '<10' ? 0 : mobile;
  return pcNum + mobileNum;
};

const formatPeriod = (period: string): string => {
  const date = new Date(period);
  return `${date.getMonth() + 1}월`;
};

interface TrendChartProps {
  data: TrendData[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const maxRatio = Math.max(...data.map((d) => d.ratio));
  const peakIdx = data.findIndex((d) => d.ratio === maxRatio);

  return (
    <div className="mt-3 p-4 bg-[var(--color-hover)] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
          <TrendingUp className="w-3.5 h-3.5" />
          검색 트렌드 (최근 13개월)
        </div>
        <div className="text-xs text-[var(--color-text-tertiary)]">
          피크: <span className="text-[var(--color-primary)] font-medium">{formatPeriod(data[peakIdx]?.period)}</span>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-32 sm:h-40">
        {data.map((item, idx) => {
          const height = (item.ratio / maxRatio) * 100;
          const isPeak = item.ratio === maxRatio;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[9px] sm:text-[10px] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                {item.ratio.toFixed(0)}
              </span>
              <div
                className={`w-full rounded-t transition-all cursor-pointer ${isPeak ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/60'}`}
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
              <span className="text-[9px] sm:text-[10px] text-[var(--color-text-tertiary)]">
                {formatPeriod(item.period)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface RelatedKeyword {
  keyword: string;
  totalSearch: number;
  compIdx: string;
}

const KeywordTestPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [analyses, setAnalyses] = useState<KeywordAnalysis[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<RelatedKeyword[]>([]);
  const [showRelated, setShowRelated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'search' | 'blog' | 'saturation'>('search');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const keywords = keyword
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
        .slice(0, 5);

      // 1. 검색광고 + 데이터랩 API 호출
      const [searchadRes, datalabRes] = await Promise.all([
        fetch(`/api/searchad?keyword=${encodeURIComponent(keywords.join(','))}`),
        fetch(`/api/datalab?keyword=${encodeURIComponent(keywords.join(','))}`),
      ]);

      const [searchadData, datalabData]: [SearchadResponse, DatalabResponse] = await Promise.all([
        searchadRes.json(),
        datalabRes.json(),
      ]);

      if (searchadData.error) {
        setError(searchadData.error);
        setAnalyses([]);
        setRelatedKeywords([]);
        return;
      }

      // 2. 각 키워드별 블로그 발행량 조회
      const blogCountPromises = keywords.map((kw) =>
        fetch(`/api/search?q=${encodeURIComponent(kw)}&display=1`)
          .then((res) => res.json())
          .then((data) => ({ keyword: kw, total: data.total || 0 }))
          .catch(() => ({ keyword: kw, total: 0 }))
      );

      const blogCounts = await Promise.all(blogCountPromises);
      const blogCountMap: BlogCountMap = {};
      blogCounts.forEach((bc) => {
        blogCountMap[bc.keyword] = bc.total;
      });

      // 3. 분석 데이터 조합 - 입력 키워드와 연관 키워드 분리
      const inputKeywordSet = new Set(keywords.map((k) => k.toLowerCase()));

      const analysisResults: KeywordAnalysis[] = searchadData.stats
        .filter((stat) => inputKeywordSet.has(stat.relKeyword.toLowerCase()))
        .map((stat) => {
          const totalSearch = getTotalSearchNum(stat.monthlyPcQcCnt, stat.monthlyMobileQcCnt);
          const blogCount = blogCountMap[stat.relKeyword] || 0;
          const saturationIndex = totalSearch > 0 ? (blogCount / totalSearch) * 100 : 0;

          const trendResult = datalabData.results?.find(
            (r) => r.title === stat.relKeyword || r.keywords.includes(stat.relKeyword)
          );

          return {
            stat,
            blogCount,
            totalSearch,
            saturationIndex,
            trendData: trendResult?.data || null,
          };
        });

      // 4. 연관 키워드 추출 (입력 키워드 제외)
      const relatedResults: RelatedKeyword[] = searchadData.stats
        .filter((stat) => !inputKeywordSet.has(stat.relKeyword.toLowerCase()))
        .map((stat) => ({
          keyword: stat.relKeyword,
          totalSearch: getTotalSearchNum(stat.monthlyPcQcCnt, stat.monthlyMobileQcCnt),
          compIdx: stat.compIdx,
        }))
        .sort((a, b) => b.totalSearch - a.totalSearch)
        .slice(0, 20);

      setAnalyses(analysisResults);
      setRelatedKeywords(relatedResults);
    } catch (err) {
      setError(String(err));
      setAnalyses([]);
      setRelatedKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchData();
  };

  const handleSort = (by: 'search' | 'blog' | 'saturation') => {
    if (sortBy === by) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(by);
      setSortOrder('desc');
    }
  };

  const sortedAnalyses = [...analyses].sort((a, b) => {
    let diff = 0;
    switch (sortBy) {
      case 'search':
        diff = a.totalSearch - b.totalSearch;
        break;
      case 'blog':
        diff = a.blogCount - b.blogCount;
        break;
      case 'saturation':
        diff = a.saturationIndex - b.saturationIndex;
        break;
    }
    return sortOrder === 'asc' ? diff : -diff;
  });

  const downloadCSV = () => {
    if (analyses.length === 0) return;

    const headers = ['키워드', 'PC검색량', '모바일검색량', '총검색량', '블로그발행량', '포화지수', '경쟁도'];
    const rows = analyses.map((a) => [
      a.stat.relKeyword,
      a.stat.monthlyPcQcCnt,
      a.stat.monthlyMobileQcCnt,
      a.totalSearch,
      a.blogCount,
      a.saturationIndex.toFixed(2),
      a.stat.compIdx,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keyword_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto">
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4 text-[var(--color-text-primary)]">키워드 분석</h1>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="키워드 입력 (쉼표로 최대 5개)"
              className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? '분석중...' : '분석'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {analyses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort('search')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${sortBy === 'search' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-hover)] text-[var(--color-text-secondary)]'}`}
                >
                  검색량 {sortBy === 'search' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSort('blog')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${sortBy === 'blog' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-hover)] text-[var(--color-text-secondary)]'}`}
                >
                  발행량 {sortBy === 'blog' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSort('saturation')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${sortBy === 'saturation' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-hover)] text-[var(--color-text-secondary)]'}`}
                >
                  포화지수 {sortBy === 'saturation' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              </div>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--color-hover)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>

            <div className="space-y-3">
              {sortedAnalyses.map((analysis, idx) => {
                const { stat, blogCount, totalSearch, saturationIndex, trendData } = analysis;
                const saturation = getSaturationColor(saturationIndex);

                return (
                  <div
                    key={idx}
                    className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">{stat.relKeyword}</h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${saturation.color}`}>
                          {saturation.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getCompColor(stat.compIdx)}`}>
                          경쟁 {stat.compIdx}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                      <div className="p-3 bg-[var(--color-hover)] rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          총 검색량
                        </div>
                        <div className="text-lg font-bold text-[var(--color-primary)]">
                          {totalSearch.toLocaleString('ko-KR')}
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--color-hover)] rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-1">
                          <Monitor className="w-3.5 h-3.5" />
                          PC
                        </div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">
                          {formatNumber(stat.monthlyPcQcCnt)}
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--color-hover)] rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-1">
                          <Smartphone className="w-3.5 h-3.5" />
                          모바일
                        </div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">
                          {formatNumber(stat.monthlyMobileQcCnt)}
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--color-hover)] rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-1">
                          <FileText className="w-3.5 h-3.5" />
                          발행량
                        </div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">
                          {blogCount.toLocaleString('ko-KR')}
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--color-hover)] rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-1">
                          <Gauge className="w-3.5 h-3.5" />
                          포화지수
                        </div>
                        <div className={`text-lg font-bold ${saturationIndex < 5 ? 'text-green-500' : saturationIndex < 15 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {saturationIndex.toFixed(1)}
                        </div>
                      </div>

                      <div className="p-3 bg-[var(--color-hover)] rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mb-1">
                          <BarChart3 className="w-3.5 h-3.5" />
                          광고 경쟁
                        </div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">{stat.plAvgDepth}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center justify-between p-2 bg-[var(--color-hover)] rounded-lg">
                        <span className="text-[var(--color-text-tertiary)] flex items-center gap-1">
                          <MousePointer className="w-3 h-3" /> PC 클릭
                        </span>
                        <span className="text-[var(--color-text-secondary)]">
                          {stat.monthlyAvePcClkCnt}회 ({stat.monthlyAvePcCtr}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[var(--color-hover)] rounded-lg">
                        <span className="text-[var(--color-text-tertiary)] flex items-center gap-1">
                          <MousePointer className="w-3 h-3" /> 모바일 클릭
                        </span>
                        <span className="text-[var(--color-text-secondary)]">
                          {stat.monthlyAveMobileClkCnt}회 ({stat.monthlyAveMobileCtr}%)
                        </span>
                      </div>
                    </div>

                    {trendData && trendData.length > 0 && <TrendChart data={trendData} />}
                  </div>
                );
              })}
            </div>

            {relatedKeywords.length > 0 && (
              <div className="mt-6 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                <button
                  onClick={() => setShowRelated(!showRelated)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      연관 키워드 ({relatedKeywords.length})
                    </span>
                  </div>
                  {showRelated ? (
                    <ChevronUp className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  )}
                </button>

                {showRelated && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {relatedKeywords.map((related, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setKeyword(related.keyword);
                        }}
                        className="group flex items-center gap-2 px-3 py-2 bg-[var(--color-hover)] hover:bg-[var(--color-border)] rounded-lg transition-colors"
                      >
                        <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                          {related.keyword}
                        </span>
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {related.totalSearch.toLocaleString()}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getCompColor(related.compIdx)}`}>
                          {related.compIdx}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!loading && analyses.length === 0 && !error && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)] text-sm">
            <p className="mb-2">키워드를 입력하고 분석 버튼을 눌러주세요</p>
            <p className="text-xs">포화지수 = 발행량 / 검색량 × 100 (낮을수록 블루오션)</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default KeywordTestPage;

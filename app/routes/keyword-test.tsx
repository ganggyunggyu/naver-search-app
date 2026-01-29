import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import {
  KeywordInput,
  AnalysisSummary,
  AnalysisCard,
  AnalysisTable,
  AnalysisToolbar,
  RelatedKeywords,
  Favorites,
  EmptyState,
  LoadingSkeleton,
} from '@/features/keyword-analysis';
import {
  useKeywordAnalysis,
  useFavorites,
  useSuggestions,
  useTopExposure,
} from '@/features/keyword-analysis';
import type { SortBy, ViewMode } from '@/features/keyword-analysis';
import { generateShareUrl, parseUrlKeywords } from '@/features/keyword-analysis';

export const meta = () => [{ title: '키워드 분석 | Naver Search Engine' }];

const KeywordTestPage: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showFavorites, setShowFavorites] = useState(false);

  const { analyses, relatedKeywords, loading, error, analyze } = useKeywordAnalysis();
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const {
    suggestions,
    loading: suggestionsLoading,
    visible: suggestionsVisible,
    debouncedFetch,
    clearSuggestions,
    showSuggestions,
    hideSuggestions,
  } = useSuggestions();
  const { toggleExpanded, isExpanded, getExposureData } = useTopExposure();

  useEffect(() => {
    const urlKeywords = parseUrlKeywords();
    if (urlKeywords.length > 0) {
      setKeywords(urlKeywords);
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (keywords.length > 0) {
      analyze(keywords);
    }
  }, [keywords, analyze]);

  const handleKeywordsChange = useCallback((newKeywords: string[]) => {
    setKeywords(newKeywords);
  }, []);

  const handleSelectRelatedKeyword = useCallback((keyword: string) => {
    setKeywords([keyword]);
  }, []);

  const handleSelectFavorite = useCallback((keyword: string) => {
    setKeywords([keyword]);
    setShowFavorites(false);
  }, []);

  const handleExampleClick = useCallback((keyword: string) => {
    setKeywords([keyword]);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: SortBy) => {
      if (sortBy === newSortBy) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(newSortBy);
        setSortOrder('desc');
      }
    },
    [sortBy]
  );

  const handleDownloadCSV = useCallback(() => {
    if (analyses.length === 0) return;

    const headers = ['키워드', 'PC검색량', '모바일검색량', '총검색량', '블로그발행량', '포화지수', '경쟁도', '추천점수'];
    const rows = analyses.map((a) => [
      a.stat.relKeyword,
      a.stat.monthlyPcQcCnt,
      a.stat.monthlyMobileQcCnt,
      a.totalSearch,
      a.blogCount,
      a.saturationIndex.toFixed(2),
      a.stat.compIdx,
      a.score,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keyword_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [analyses]);

  const handleShare = useCallback(() => {
    if (keywords.length === 0) return;

    const url = generateShareUrl(keywords);
    navigator.clipboard.writeText(url).then(() => {
      alert('URL이 클립보드에 복사되었습니다!');
    });
  }, [keywords]);

  const sortedAnalyses = useMemo(() => {
    return [...analyses].sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case 'score':
          diff = a.score - b.score;
          break;
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
  }, [analyses, sortBy, sortOrder]);

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-background)]">
      <main className="max-w-4xl mx-auto px-4 py-8 min-h-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 rounded-full mb-4">
            <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--color-primary)]">키워드 분석 도구</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-3">블로그 키워드 분석</h1>
          <p className="text-[var(--color-text-tertiary)] max-w-lg mx-auto">
            검색량, 발행량, 포화지수를 한눈에 파악하고
            <br />
            최적의 블로그 키워드를 찾아보세요
          </p>
        </div>

        {/* Favorites & Input Section */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <Favorites
              favorites={favorites}
              visible={showFavorites}
              onToggleVisible={() => setShowFavorites(!showFavorites)}
              onSelectKeyword={handleSelectFavorite}
              onRemoveKeyword={removeFavorite}
            />
          </div>

          <KeywordInput
            keywords={keywords}
            onKeywordsChange={handleKeywordsChange}
            onAnalyze={handleAnalyze}
            loading={loading}
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            suggestionsVisible={suggestionsVisible}
            onInputChange={debouncedFetch}
            onFocus={showSuggestions}
            onBlur={hideSuggestions}
            onSelectSuggestion={clearSuggestions}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">{error}</div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Results */}
        {!loading && analyses.length > 0 && (
          <div className="space-y-6">
            <AnalysisSummary analyses={analyses} />

            <AnalysisToolbar
              sortBy={sortBy}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewModeChange={setViewMode}
              onDownload={handleDownloadCSV}
              onShare={handleShare}
              count={analyses.length}
            />

            {viewMode === 'card' ? (
              <div className="space-y-4">
                {sortedAnalyses.map((analysis, idx) => (
                  <AnalysisCard
                    key={idx}
                    analysis={analysis}
                    isFavorite={isFavorite(analysis.stat.relKeyword)}
                    onToggleFavorite={() => toggleFavorite(analysis.stat.relKeyword)}
                    isExpanded={isExpanded(analysis.stat.relKeyword)}
                    onToggleExpand={() => toggleExpanded(analysis.stat.relKeyword)}
                    exposureData={getExposureData(analysis.stat.relKeyword)}
                  />
                ))}
              </div>
            ) : (
              <AnalysisTable analyses={sortedAnalyses} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
            )}

            <RelatedKeywords keywords={relatedKeywords} onSelectKeyword={handleSelectRelatedKeyword} />
          </div>
        )}

        {/* Empty State */}
        {!loading && analyses.length === 0 && !error && <EmptyState onExampleClick={handleExampleClick} />}

        {/* Footer Tips */}
        <div className="mt-12 p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-hover)] border border-[var(--color-border)] rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="font-semibold text-[var(--color-text-primary)]">분석 지표 안내</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-[var(--color-text-secondary)]">
                <span className="font-medium text-[var(--color-text-primary)]">포화지수</span>
                {' = 발행량 ÷ 검색량 × 100'}
              </p>
              <p className="text-[var(--color-text-tertiary)]">낮을수록 경쟁이 적은 블루오션 키워드</p>
            </div>
            <div className="space-y-2">
              <p className="text-[var(--color-text-secondary)]">
                <span className="font-medium text-[var(--color-text-primary)]">추천 점수</span>
                {' = 검색량 + 포화지수 + 경쟁도 종합'}
              </p>
              <p className="text-[var(--color-text-tertiary)]">높을수록 진입하기 좋은 키워드</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KeywordTestPage;

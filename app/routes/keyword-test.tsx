import React from 'react';
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
  useKeywordAnalysisPage,
} from '@/features/keyword-analysis';
import { LogicStatusWidget } from '@/widgets/naver-popular';
import { cn } from '@/shared';

export const meta = () => [{ title: '키워드 분석 | Naver Search Engine' }];

const KeywordTestPage: React.FC = () => {
  const {
    keywords,
    sortBy,
    viewMode,
    showFavorites,
    loading,
    error,
    primaryKeyword,
    sortedAnalyses,
    analyses,
    relatedKeywords,
    logicData,
    logicError,
    isLogicLoading,
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    suggestions,
    suggestionsLoading,
    suggestionsVisible,
    debouncedFetch,
    clearSuggestions,
    showSuggestions,
    hideSuggestions,
    isExpanded,
    toggleExpanded,
    getExposureData,
    handleKeywordsChange,
    handleAnalyze,
    handleSortChange,
    handleToggleFavorites,
    handleSelectRelatedKeyword,
    handleSelectFavorite,
    handleExampleClick,
    handleDownloadCSV,
    handleShare,
    setViewMode,
  } = useKeywordAnalysisPage();

  return (
    <div className="h-full overflow-y-auto bg-bg-primary">
      <main className="max-w-4xl mx-auto px-4 py-8 min-h-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">키워드 분석 도구</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">블로그 키워드 분석</h1>
          <p className="text-text-tertiary max-w-lg mx-auto">
            검색량, 발행량, 포화지수를 한눈에 파악하고
            <br />
            최적의 블로그 키워드를 찾아보세요
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <Favorites
              favorites={favorites}
              visible={showFavorites}
              onToggleVisible={handleToggleFavorites}
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

          {primaryKeyword && (
            <div className={cn('space-y-2')}>
              {keywords.length > 1 && (
                <p className={cn('text-xs text-text-tertiary')}>
                  복수 키워드는 첫 번째 키워드 기준으로 표시됩니다.
                </p>
              )}
              <LogicStatusWidget
                data={logicData}
                isLoading={isLogicLoading}
                errorMessage={logicError}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">{error}</div>
        )}

        {loading && <LoadingSkeleton />}

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

        {!loading && analyses.length === 0 && !error && <EmptyState onExampleClick={handleExampleClick} />}

        <div className="mt-12 p-6 bg-gradient-to-br from-surface to-hover border border-border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-text-primary">분석 지표 안내</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-text-secondary">
                <span className="font-medium text-text-primary">포화지수</span>
                {' = 발행량 ÷ 검색량 × 100'}
              </p>
              <p className="text-text-tertiary">낮을수록 경쟁이 적은 블루오션 키워드</p>
            </div>
            <div className="space-y-2">
              <p className="text-text-secondary">
                <span className="font-medium text-text-primary">추천 점수</span>
                {' = 검색량 + 포화지수 + 경쟁도 종합'}
              </p>
              <p className="text-text-tertiary">높을수록 진입하기 좋은 키워드</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KeywordTestPage;

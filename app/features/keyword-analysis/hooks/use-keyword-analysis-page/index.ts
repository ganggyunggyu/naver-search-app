import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SortBy, ViewMode } from '@/features/keyword-analysis/types';
import { generateShareUrl, parseUrlKeywords } from '@/features/keyword-analysis/utils';
import { useKeywordAnalysis } from '../use-keyword-analysis';
import { useFavorites } from '../use-favorites';
import { useSuggestions } from '../use-suggestions';
import { useLogicCheck } from '../use-logic-check';
import { useTopExposure } from '../use-top-exposure';

export const useKeywordAnalysisPage = () => {
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
  const {
    data: logicData,
    errorMessage: logicError,
    isLoading: isLogicLoading,
    run: runLogicCheck,
    reset: resetLogicState,
  } = useLogicCheck();

  const primaryKeyword = keywords[0] ?? '';

  useEffect(() => {
    const urlKeywords = parseUrlKeywords();
    if (urlKeywords.length > 0) {
      setKeywords(urlKeywords);
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (keywords.length === 0) return;
    analyze(keywords);
    runLogicCheck(primaryKeyword);
  }, [keywords, analyze, runLogicCheck, primaryKeyword]);

  const handleKeywordsChange = useCallback(
    (newKeywords: string[]) => {
      resetLogicState();
      setKeywords(newKeywords);
    },
    [resetLogicState]
  );

  const handleSelectRelatedKeyword = useCallback(
    (keyword: string) => {
      resetLogicState();
      setKeywords([keyword]);
    },
    [resetLogicState]
  );

  const handleSelectFavorite = useCallback(
    (keyword: string) => {
      resetLogicState();
      setKeywords([keyword]);
      setShowFavorites(false);
    },
    [resetLogicState]
  );

  const handleExampleClick = useCallback(
    (keyword: string) => {
      resetLogicState();
      setKeywords([keyword]);
    },
    [resetLogicState]
  );

  const handleToggleFavorites = useCallback(() => {
    setShowFavorites((prev) => !prev);
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

  return {
    keywords,
    sortBy,
    viewMode,
    showFavorites,
    loading,
    error,
    primaryKeyword,
    analyses,
    sortedAnalyses,
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
  };
};

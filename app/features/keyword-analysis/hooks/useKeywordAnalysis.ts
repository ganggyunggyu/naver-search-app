import { useState, useCallback } from 'react';
import type {
  KeywordAnalysis,
  RelatedKeyword,
  SearchadResponse,
  DatalabResponse,
} from '../types';
import { getTotalSearchNum, calculateScore } from '../utils';

interface BlogCountMap {
  [keyword: string]: number;
}

export const useKeywordAnalysis = () => {
  const [analyses, setAnalyses] = useState<KeywordAnalysis[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<RelatedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (keywords: string[]) => {
    // 키워드 공백 제거 및 빈 문자열 필터링
    const trimmedKeywords = keywords
      .map((k) => k.replace(/\s/g, ''))
      .filter((k) => k.length > 0)
      .slice(0, 5);

    if (trimmedKeywords.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const keywordParam = trimmedKeywords.join(',');

      const [searchadRes, datalabRes] = await Promise.all([
        fetch(`/api/searchad?keyword=${encodeURIComponent(keywordParam)}`),
        fetch(`/api/datalab?keyword=${encodeURIComponent(keywordParam)}`),
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

      const blogCountPromises = trimmedKeywords.map((kw) =>
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

      const inputKeywordSet = new Set(trimmedKeywords.map((k) => k.toLowerCase()));

      const analysisResults: KeywordAnalysis[] = searchadData.stats
        .filter((stat) => inputKeywordSet.has(stat.relKeyword.toLowerCase()))
        .map((stat) => {
          const totalSearch = getTotalSearchNum(stat.monthlyPcQcCnt, stat.monthlyMobileQcCnt);
          const blogCount = blogCountMap[stat.relKeyword] || 0;
          const saturationIndex = totalSearch > 0 ? (blogCount / totalSearch) * 100 : 0;

          const trendResult = datalabData.results?.find(
            (r) => r.title === stat.relKeyword || r.keywords.includes(stat.relKeyword)
          );

          const analysis: KeywordAnalysis = {
            stat,
            blogCount,
            totalSearch,
            saturationIndex,
            score: 0,
            trendData: trendResult?.data || null,
          };

          analysis.score = calculateScore(analysis);

          return analysis;
        });

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
  }, []);

  const reset = useCallback(() => {
    setAnalyses([]);
    setRelatedKeywords([]);
    setError(null);
  }, []);

  return {
    analyses,
    relatedKeywords,
    loading,
    error,
    analyze,
    reset,
  };
};

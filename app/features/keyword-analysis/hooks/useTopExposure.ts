import { useState, useCallback } from 'react';
import type { TopExposureData } from '../types';

interface TopExposureMap {
  [keyword: string]: TopExposureData;
}

export const useTopExposure = () => {
  const [data, setData] = useState<TopExposureMap>({});
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());

  const fetchTopExposure = useCallback(async (keyword: string) => {
    setData((prev) => ({
      ...prev,
      [keyword]: { loading: true, items: [] },
    }));

    try {
      const res = await fetch(`/api/naver-popular?q=${encodeURIComponent(keyword)}`);
      const result = await res.json();

      if (result.error) {
        setData((prev) => ({
          ...prev,
          [keyword]: { loading: false, items: [], error: result.error },
        }));
        return;
      }

      setData((prev) => ({
        ...prev,
        [keyword]: { loading: false, items: result.items?.slice(0, 5) || [] },
      }));
    } catch (err) {
      setData((prev) => ({
        ...prev,
        [keyword]: { loading: false, items: [], error: String(err) },
      }));
    }
  }, []);

  const toggleExpanded = useCallback(
    (keyword: string) => {
      setExpandedKeywords((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(keyword)) {
          newSet.delete(keyword);
        } else {
          newSet.add(keyword);
          if (!data[keyword]) {
            fetchTopExposure(keyword);
          }
        }
        return newSet;
      });
    },
    [data, fetchTopExposure]
  );

  const isExpanded = useCallback(
    (keyword: string) => expandedKeywords.has(keyword),
    [expandedKeywords]
  );

  const getExposureData = useCallback(
    (keyword: string) => data[keyword],
    [data]
  );

  return {
    toggleExpanded,
    isExpanded,
    getExposureData,
  };
};

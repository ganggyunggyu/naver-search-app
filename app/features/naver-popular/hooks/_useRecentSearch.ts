import { useAtom } from 'jotai';
import { recentSearchListAtom } from '../store';
import { useCallback } from 'react';
import type { RecentSearch } from '../types';

export const useRecentSearch = () => {
  const [recentSearchList, setRecentSearchList] = useAtom(recentSearchListAtom);

  const addRecentSearch = useCallback(
    (query: string, hasExposure?: boolean) => {
      const q = (query || '').trim();
      if (!q) return;

      const newItem: RecentSearch = {
        query: q,
        timestamp: Date.now(),
        hasExposure,
      };

      setRecentSearchList((prev) => {
        const filtered = prev.filter((v) => v.query !== q);
        return [newItem, ...filtered];
      });
    },
    [setRecentSearchList]
  );

  const clearRecentSearch = useCallback(() => setRecentSearchList([]), [setRecentSearchList]);

  const removeRecentSearch = useCallback(
    (query: string) => {
      setRecentSearchList((prev) => prev.filter((v) => v.query !== query));
    },
    [setRecentSearchList]
  );

  const updateRecentSearchExposure = useCallback(
    (query: string, hasExposure: boolean) => {
      setRecentSearchList((prev) =>
        prev.map((item) =>
          item.query === query ? { ...item, hasExposure } : item
        )
      );
    },
    [setRecentSearchList]
  );

  return {
    recentSearchList,
    addRecentSearch,
    clearRecentSearch,
    removeRecentSearch,
    updateRecentSearchExposure,
  };
};

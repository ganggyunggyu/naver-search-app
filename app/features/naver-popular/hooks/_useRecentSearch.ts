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
      const q = (query || '').trim();
      if (!q) return;

      setRecentSearchList((prev) => {
        const existingItem = prev.find((item) => item.query === q);

        // 이미 같은 값이면 업데이트하지 않음 (리렌더링 방지)
        if (existingItem && existingItem.hasExposure === hasExposure) {
          return prev;
        }

        if (existingItem) {
          return prev.map((item) =>
            item.query === q ? { ...item, hasExposure } : item
          );
        }
        return [{ query: q, timestamp: Date.now(), hasExposure }, ...prev];
      });
    },
    [setRecentSearchList]
  );

  const clearByExposure = useCallback(
    (hasExposure: boolean | undefined) => {
      setRecentSearchList((prev) =>
        prev.filter((item) => item.hasExposure !== hasExposure)
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
    clearByExposure,
  };
};

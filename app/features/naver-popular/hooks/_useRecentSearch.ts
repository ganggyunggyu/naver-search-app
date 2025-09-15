import { useAtom } from 'jotai';
import { recentSearchListAtom } from '../store';
import { useCallback } from 'react';

export const useRecentSearch = () => {
  const [recentSearchList, setRecentSearchList] = useAtom(recentSearchListAtom);

  const addRecentSearch = useCallback(
    (query: string) => {
      const q = (query || '').trim();
      if (!q) return;
      setRecentSearchList((prev) => [q, ...prev.filter((v) => v !== q)]);
    },
    [setRecentSearchList]
  );

  const clearRecentSearch = useCallback(() => setRecentSearchList([]), [setRecentSearchList]);

  return { recentSearchList, addRecentSearch, clearRecentSearch };
};

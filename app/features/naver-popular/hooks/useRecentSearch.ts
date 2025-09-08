import { useAtom } from 'jotai';
import { recentSearchListAtom } from '../store/atoms';
import { useCallback } from 'react';

const MAX_RECENT = 10;

export const useRecentSearch = () => {
  const [recentSearchList, setRecentSearchList] = useAtom(recentSearchListAtom);

  const addRecentSearch = useCallback(
    (query: string) => {
      const q = (query || '').trim();
      if (!q) return;
      setRecentSearchList((prev) => [q, ...prev.filter((v) => v !== q)].slice(0, MAX_RECENT));
    },
    [setRecentSearchList]
  );

  const clearRecentSearch = useCallback(() => setRecentSearchList([]), [setRecentSearchList]);

  return { recentSearchList, addRecentSearch, clearRecentSearch };
};

import { useState, useEffect, useCallback } from 'react';
import type { SavedKeyword } from '../types';

const STORAGE_KEY = 'keyword-favorites';
const MAX_FAVORITES = 30;

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<SavedKeyword[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const saveFavorite = useCallback((keyword: string) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.keyword.toLowerCase() === keyword.toLowerCase());
      if (exists) return prev;

      const newSaved: SavedKeyword = {
        keyword,
        savedAt: new Date().toISOString(),
      };
      const updated = [newSaved, ...prev].slice(0, MAX_FAVORITES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((keyword: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((s) => s.keyword !== keyword);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (keyword: string) => {
      return favorites.some((s) => s.keyword.toLowerCase() === keyword.toLowerCase());
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (keyword: string) => {
      if (isFavorite(keyword)) {
        removeFavorite(keyword);
      } else {
        saveFavorite(keyword);
      }
    },
    [isFavorite, removeFavorite, saveFavorite]
  );

  return {
    favorites,
    saveFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};

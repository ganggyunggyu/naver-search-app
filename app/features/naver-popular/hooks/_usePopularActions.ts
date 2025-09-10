import { useCallback } from 'react';
import { useRecentSearch } from './_useRecentSearch';
import { useAtom, useSetAtom } from 'jotai';
import {
  popularQueryAtom,
  popularIsAutoUrlAtom,
  popularUrlAtom,
  popularIsLoadingAtom,
  popularErrorAtom,
  popularDataAtom,
} from '../store';
import type { PopularResponse } from '@/entities/naver/_types';

export const usePopularActions = () => {
  const [query] = useAtom(popularQueryAtom);
  const setQuery = useSetAtom(popularQueryAtom);
  const [isAutoUrl] = useAtom(popularIsAutoUrlAtom);
  const [url] = useAtom(popularUrlAtom);
  const setIsLoading = useSetAtom(popularIsLoadingAtom);
  const setError = useSetAtom(popularErrorAtom);
  const setData = useSetAtom(popularDataAtom);
  const { addRecentSearch } = useRecentSearch();

  const generateNaverUrl = useCallback(
    (q: string) =>
      `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(q)}`,
    []
  );

  const fetchPopular = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setIsLoading(true);
      setError('');
      setData(null);
      try {
        if (isAutoUrl && query.trim()) addRecentSearch(query.trim());
        const endpoint = isAutoUrl
          ? `/api/naver-popular?q=${encodeURIComponent(query.trim())}`
          : `/api/naver-popular?url=${encodeURIComponent(url.trim())}`;
        const res = await fetch(endpoint);
        const json: PopularResponse = await res.json();
        if ((json as any).error) setError((json as any).error);
        else setData(json);
      } catch {
        setError('요청 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [isAutoUrl, query, url, setIsLoading, setError, setData]
  );

  const searchWithQuery = useCallback(
    async (q: string) => {
      const qq = (q || '').trim();
      if (!qq) return;
      setQuery(qq);
      setIsLoading(true);
      setError('');
      setData(null);
      try {
        if (isAutoUrl) addRecentSearch(qq);
        const endpoint = isAutoUrl
          ? `/api/naver-popular?q=${encodeURIComponent(qq)}`
          : `/api/naver-popular?url=${encodeURIComponent(url.trim())}`;
        const res = await fetch(endpoint);
        const json: PopularResponse = await res.json();
        if ((json as any).error) setError((json as any).error);
        else setData(json);
      } catch {
        setError('요청 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [setQuery, isAutoUrl, url, setIsLoading, setError, setData, addRecentSearch]
  );

  return { fetchPopular, generateNaverUrl, searchWithQuery };
};

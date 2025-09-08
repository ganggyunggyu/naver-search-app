import { useState } from 'react';
import type { PopularItem, PopularResponse } from '@/entities/naver/types';

export interface UsePopularState {
  query: string;
  setQuery: (v: string) => void;
  isAutoUrl: boolean;
  setIsAutoUrl: (v: boolean) => void;
  url: string;
  setUrl: (v: string) => void;
  isLoading: boolean;
  error: string;
  data: PopularResponse | null;
  fetchPopular: (e: React.FormEvent) => Promise<void>;
  generateNaverUrl: (q: string) => string;
}

export const usePopular = (): UsePopularState => {
  const [query, setQuery] = useState('');
  const [isAutoUrl, setIsAutoUrl] = useState(true);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PopularResponse | null>(null);
  const [error, setError] = useState('');

  const generateNaverUrl = (q: string) =>
    `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(q)}`;

  const fetchPopular = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setData(null);
    try {
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
  };

  return {
    query,
    setQuery,
    isAutoUrl,
    setIsAutoUrl,
    url,
    setUrl,
    isLoading,
    error,
    data,
    fetchPopular,
    generateNaverUrl,
  };
};

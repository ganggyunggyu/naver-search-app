import { useEffect, useRef, useMemo, useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useToast, extractBlogIdFromUrl } from '@/shared';
import type {
  PopularItem,
  PopularResponse,
  BlogCrawlResponse,
} from '@/entities/naver/types';
import { useAtom, useSetAtom } from 'jotai';
import {
  popularDataAtom,
  popularErrorAtom,
  viewerOpenAtom,
  viewerLoadingAtom,
  viewerItemAtom,
  blogSearchDataAtom,
  popularIsAutoUrlAtom,
  popularQueryAtom,
  popularUrlAtom,
  popularIsLoadingAtom,
} from '@/features/naver-popular/store';
import type { PopularViewerItem } from '@/features/naver-popular/types';
import {
  BLOG_ID_SET,
  LOSE_TEXT_STYLE,
  fireSuccessConfetti,
} from '@/constants';

import { useRecentSearch } from '../use-recent-search';

export interface MatchItem {
  id: string;
  item: PopularItem;
}

interface PopularApiResponse extends PopularResponse {
  error?: string;
  blog?: BlogCrawlResponse;
}

interface UseNaverPopularPageParams {
  loaderData: { q: string; url: string } | undefined;
}

export const useNaverPopularPage = ({ loaderData }: UseNaverPopularPageParams) => {
  const { show } = useToast();
  const [showLose, setShowLose] = useState(false);
  const [error] = useAtom(popularErrorAtom);
  const [data] = useAtom(popularDataAtom);
  const [blogSearchData] = useAtom(blogSearchDataAtom);
  const [isViewerOpen, setIsViewerOpen] = useAtom(viewerOpenAtom);
  const [isViewerLoading] = useAtom(viewerLoadingAtom);
  const [viewerItem] = useAtom(viewerItemAtom);
  const setQuery = useSetAtom(popularQueryAtom);
  const setUrl = useSetAtom(popularUrlAtom);
  const setIsAutoUrl = useSetAtom(popularIsAutoUrlAtom);
  const prevRef = useRef<{ q: string; u: string }>({ q: '', u: '' });
  const [isLoading, setIsLoading] = useAtom(popularIsLoadingAtom);
  const setError = useSetAtom(popularErrorAtom);
  const setData = useSetAtom(popularDataAtom);
  const setBlogSearchData = useSetAtom(blogSearchDataAtom);
  const { updateRecentSearchExposure } = useRecentSearch();

  useEffect(() => {
    let isActive = true;
    const { q, url: u } = loaderData ?? { q: '', url: '' };
    const qq = (q ?? '').trim();
    const uu = (u ?? '').trim();

    if (!qq && !uu) {
      return;
    }
    if (prevRef.current.q === qq && prevRef.current.u === uu) return;
    prevRef.current = { q: qq, u: uu };

    if (qq) {
      setIsAutoUrl(true);
      setQuery(qq);
    } else {
      setIsAutoUrl(false);
      setUrl(uu);
    }

    const popularEndpoint = qq
      ? `/api/naver-popular?q=${encodeURIComponent(qq)}&blog=true`
      : `/api/naver-popular?url=${encodeURIComponent(uu)}`;

    (async () => {
      try {
        setIsLoading(true);
        setError('');
        setData(null);
        const { data: json } = await axios.get<PopularApiResponse>(
          popularEndpoint
        );

        if (!isActive) return;

        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          if (json.blog) {
            setBlogSearchData(json.blog);
          }

          show(`인기글 ${json.count}개 추출 완료`, { type: 'success' });

          const items = json.items || [];
          let hasExposure = false;
          for (const it of items) {
            const id = extractBlogIdFromUrl(it.link);
            if (id && BLOG_ID_SET.has(id)) {
              hasExposure = true;
              break;
            }
          }

          updateRecentSearchExposure(qq, hasExposure);

          if (hasExposure) {
            fireSuccessConfetti(confetti);
          } else {
            setShowLose(true);
            setTimeout(() => setShowLose(false), LOSE_TEXT_STYLE.duration);
          }
        }
      } catch {
        if (!isActive) return;
        setError('요청 중 오류가 발생했습니다.');
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [
    loaderData,
    setIsAutoUrl,
    setQuery,
    setUrl,
    setIsLoading,
    setError,
    setData,
    setBlogSearchData,
    show,
    updateRecentSearchExposure,
  ]);

  const matchedIdList: MatchItem[] = useMemo(() => {
    const list = new Set<MatchItem>();
    const items = data?.items || [];
    for (const it of items) {
      const id = extractBlogIdFromUrl(it.link);
      if (id && BLOG_ID_SET.has(id)) {
        list.add({ id, item: it });
      }
    }
    return Array.from(list);
  }, [data]);

  return {
    showLose,
    error,
    data,
    blogSearchData,
    isViewerOpen,
    setIsViewerOpen,
    isViewerLoading,
    viewerItem,
    isLoading,
    matchedIdList,
  };
};

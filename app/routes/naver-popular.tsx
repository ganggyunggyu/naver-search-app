import React, { useEffect, useRef, useMemo } from 'react';
import type { Route } from './+types/naver-popular';
import { useToast } from '@/shared/ui/Toast';
import type { PopularItem } from '@/entities/naver/_types';
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
import {
  PopularSearchForm,
  PopularResults,
  BlogResultList,
} from '@/features/naver-popular/components';
import { PopularViewerModal } from '@/features/naver-popular/components/_PopularViewerModal';
import { BLOG_ID_SET } from '@/constants';
import { extractBlogIdFromUrl } from '@/shared/utils/_blog';
import { useRecentSearch } from '@/features/naver-popular/hooks';
import { ExposureStatusWidget, BlogMatchWidget } from '@/widgets/naver-popular';

export const meta = (_: Route.MetaArgs) => [
  { title: 'Naver 인기글 추출' },
  {
    name: 'description',
    content: '네이버 검색 결과의 인기글(블로그) 요소를 추출합니다.',
  },
];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const keyword = ((params as { keyword?: string })?.keyword ?? '').trim();
  const q = keyword || (url.searchParams.get('q') ?? '').trim();
  const directUrl = (url.searchParams.get('url') ?? '').trim();
  return { q, url: directUrl };
};

interface MatchItem {
  id: string;
  item: PopularItem;
}

const NaverPopularPage: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const { show } = useToast();
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
    if (data) show(`인기글 ${data.count}개 추출 완료`, { type: 'success' });
  }, [data, show]);

  useEffect(() => {
    const { q, url: u } = loaderData ?? { q: '', url: '' };
    const qq = (q ?? '').trim();
    const uu = (u ?? '').trim();

    if (!qq && !uu) return;
    if (prevRef.current.q === qq && prevRef.current.u === uu) return;
    prevRef.current = { q: qq, u: uu };

    if (qq) {
      setIsAutoUrl(true);
      setQuery(qq);
    } else {
      setIsAutoUrl(false);
      setUrl(uu);
    }

    const endpoint = qq
      ? `/api/naver-popular?q=${encodeURIComponent(qq)}&blog=true`
      : `/api/naver-popular?url=${encodeURIComponent(uu)}`;

    (async () => {
      try {
        setIsLoading(true);
        setError('');
        setData(null);
        const res = await fetch(endpoint);
        const json: {
          error?: string;
          blog?: typeof blogSearchData;
        } & typeof data = await res.json();

        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          if (json.blog) {
            setBlogSearchData(json.blog);
          }
        }
      } catch {
        setError('요청 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [
    loaderData,
    setIsAutoUrl,
    setQuery,
    setUrl,
    setIsLoading,
    setError,
    setData,
    setBlogSearchData,
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

  useEffect(() => {
    const query = (loaderData?.q ?? '').trim();
    if (!query || !data) return;
    const hasExposure = matchedIdList.length > 0;
    updateRecentSearchExposure(query, hasExposure);
  }, [data, matchedIdList.length, loaderData, updateRecentSearchExposure]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PopularViewerModal
        open={isViewerOpen}
        loading={isViewerLoading}
        item={viewerItem}
        onClose={() => setIsViewerOpen(false)}
      />

      <header className="mb-6">
        <PopularSearchForm />
      </header>

      <article className="flex flex-col gap-4">
        {data && data.items?.length > 0 && (
          <ExposureStatusWidget matchedIdList={matchedIdList} />
        )}

        {blogSearchData && blogSearchData.items?.length > 0 && (
          <BlogMatchWidget blogSearchData={blogSearchData} />
        )}

        {error && (
          <aside
            role="alert"
            className="p-4 rounded-xl bg-[var(--color-error-soft)] border border-[var(--color-error)]"
          >
            <p className="text-sm text-[var(--color-error)] font-medium">{error}</p>
          </aside>
        )}

        <section aria-label="인기글 결과" className="mt-2">
          <PopularResults />
        </section>

        {(blogSearchData !== null || isLoading) && (
          <section aria-label="블로그 검색 결과" className="mt-4">
            <BlogResultList blogData={blogSearchData} isLoading={isLoading} />
          </section>
        )}
      </article>
    </main>
  );
};

export default NaverPopularPage;

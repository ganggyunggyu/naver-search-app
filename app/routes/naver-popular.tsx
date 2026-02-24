import React from 'react';
import type { Route } from './+types/naver-popular';
import { LOSE_TEXT_STYLE } from '@/constants';
import {
  PopularSearchForm,
  PopularResults,
  BlogResultList,
  PopularViewerModal,
} from '@/features/naver-popular/components';
import { useNaverPopularPage } from '@/features/naver-popular/hooks';
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

const NaverPopularPage: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const {
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
  } = useNaverPopularPage({ loaderData });

  return (
    <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-4 lg:pt-8 h-full flex flex-col overflow-hidden">
      {showLose && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="animate-lose-appear relative">
            <span
              className="absolute inset-0 flex items-center justify-center text-6xl sm:text-8xl font-black tracking-wider select-none lose-text-stroke"
              style={{
                color: LOSE_TEXT_STYLE.fallbackColor,
                textShadow: LOSE_TEXT_STYLE.textShadow,
                WebkitTextStroke: `3px ${LOSE_TEXT_STYLE.strokeColors.inner}`,
              }}
              aria-hidden="true"
            >
              LOSE!!
            </span>
            <span className="relative text-6xl sm:text-8xl font-black tracking-wider select-none lose-text-metal">
              LOSE!!
            </span>
          </div>
        </div>
      )}

      <PopularViewerModal
        open={isViewerOpen}
        loading={isViewerLoading}
        item={viewerItem}
        onClose={() => setIsViewerOpen(false)}
      />

      <div className="flex-1 min-h-0 lg:grid lg:grid-cols-[400px_1fr] lg:gap-6 overflow-y-auto lg:overflow-hidden">
        <aside className="space-y-4 mb-6 lg:mb-0 lg:overflow-y-auto lg:pr-3 lg:pb-8">
          <PopularSearchForm>
            {data && data.items?.length > 0 && (
              <div className="mt-4">
                <ExposureStatusWidget matchedIdList={matchedIdList} />
              </div>
            )}

            {blogSearchData && blogSearchData.items?.length > 0 && (
              <div className="mt-4">
                <BlogMatchWidget blogSearchData={blogSearchData} />
              </div>
            )}
          </PopularSearchForm>

          {error && (
            <aside
              role="alert"
              className="p-4 rounded-xl bg-error-soft border border-error"
            >
              <p className="text-sm text-error font-medium">
                {error}
              </p>
            </aside>
          )}
        </aside>

        <article className="flex flex-col gap-4 min-w-0 lg:overflow-y-auto lg:pb-8">
          <section aria-label="인기글 결과">
            <PopularResults />
          </section>

          {(blogSearchData !== null || isLoading) && (
            <section aria-label="블로그 검색 결과" className="mt-4">
              <BlogResultList blogData={blogSearchData} isLoading={isLoading} />
            </section>
          )}
        </article>
      </div>
    </main>
  );
};

export default NaverPopularPage;

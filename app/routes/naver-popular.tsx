import React, { useEffect, useRef, useState } from 'react';
import type { Route } from './+types/naver-popular';
import { useToast } from '@/shared/ui/Toast';
import { cn } from '@/shared';
import type { PopularItem } from '@/entities/naver/_types';
import { useAtom } from 'jotai';
import {
  popularDataAtom,
  popularErrorAtom,
  viewerOpenAtom,
  viewerLoadingAtom,
  viewerItemAtom,
  blogSearchDataAtom,
} from '@/features/naver-popular/store';
import { usePopularActions } from '@/features/naver-popular/hooks';
import { useSetAtom } from 'jotai';
import {
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

import {
  PopularViewerModal,
  type PopularViewerItem,
} from '@/features/naver-popular/components/PopularViewerModal';
import { BLOG_IDS } from '@/constants';
import {
  copyPreviewToClipboard,
  copyFullContentToClipboard,
} from '@/features/naver-popular/lib';

export const meta = (_: Route.MetaArgs) => [
  { title: 'Naver 인기글 추출' },
  {
    name: 'description',
    content: '네이버 검색 결과의 인기글(블로그) 요소를 추출합니다.',
  },
];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  const keyword = (((params as any) || {}).keyword || '').trim();
  const q = keyword || (url.searchParams.get('q') || '').trim();
  const directUrl = (url.searchParams.get('url') || '').trim();
  return { q, url: directUrl };
};

const NaverPopularPage: React.FC<Route.ComponentProps> = ({ loaderData }) => {
  const { show } = useToast();
  const [error] = useAtom(popularErrorAtom);
  const [data] = useAtom(popularDataAtom);
  const [blogSearchData] = useAtom(blogSearchDataAtom);
  const [isViewerOpen, setIsViewerOpen] = useAtom(viewerOpenAtom);
  const [isViewerLoading, setIsViewerLoading] = useAtom(viewerLoadingAtom);
  const [viewerItem, setViewerItem] = useAtom(viewerItemAtom);
  const setQuery = useSetAtom(popularQueryAtom);
  const setUrl = useSetAtom(popularUrlAtom);
  const setIsAutoUrl = useSetAtom(popularIsAutoUrlAtom);
  const { fetchPopular } = usePopularActions();
  const prevRef = useRef<{ q: string; u: string }>({ q: '', u: '' });
  const [isLoading, setIsLoading] = useAtom(popularIsLoadingAtom);
  const setError = useSetAtom(popularErrorAtom);
  const setData = useSetAtom(popularDataAtom);
  const setBlogSearchData = useSetAtom(blogSearchDataAtom);

  useEffect(() => {
    if (data) show(`인기글 ${data.count}개 추출 완료`, { type: 'success' });
  }, [data, show]);

  useEffect(() => {
    const q = (loaderData as any)?.q as string | undefined;
    const u = (loaderData as any)?.url as string | undefined;
    const qq = (q || '').trim();
    const uu = (u || '').trim();

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
        // setBlogSearchData(null); // 블로그 데이터는 초기화하지 않음 (별도 API)
        const res = await fetch(endpoint);
        const json = await res.json();

        if ((json as any)?.error) {
          setError(String((json as any).error));
        } else {
          setData(json);
          // 블로그 데이터가 있으면 저장
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
  ]);

  const getBlogId = (url: string): string => {
    try {
      const u = new URL(url);
      if (
        u.hostname.includes('blog.naver.com') ||
        u.hostname.includes('m.blog.naver.com')
      ) {
        const seg = u.pathname.replace(/^\//, '').split('/')[0];
        return (seg || '').toLowerCase();
      }
    } catch {}
    return '';
  };
  type MatchItem = {
    id: string;
    item: PopularItem;
  };
  const matchedIdList = (() => {
    const list = new Set<MatchItem>();
    const allow = new Set(BLOG_IDS.map((v) => v.toLowerCase()));
    const items = data?.items || [];
    for (const it of items) {
      const id = getBlogId(it.link);
      if (id && allow.has(id)) {
        const matchedItem: MatchItem = {
          id,
          item: it,
        };
        list.add(matchedItem);
      }
    }

    return Array.from(list);
  })();

  return (
    <div className={cn('relative py-12 sm:py-16 lg:py-24')}>
      <div className={cn('absolute inset-0 -z-10 overflow-hidden')}>
        <div
          className={cn(
            'absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[800px] sm:h-[1200px]',
            'rounded-full bg-gradient-to-br from-green-200/40 via-blue-200/30 to-transparent blur-3xl'
          )}
        />
      </div>
      <div className={cn('container mx-auto px-3 sm:px-4')}>
        <div className={cn('mb-3 sm:mb-4')}>
          {data && data.items?.length > 0 && (
            <div
              className={cn(
                'mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg',
                'border border-gray-200 dark:border-gray-700',
                'bg-gray-50 dark:bg-gray-900'
              )}
            >
              <span
                className={cn(
                  'text-xs sm:text-sm text-gray-700 dark:text-gray-300'
                )}
              >
                노출항목:{' '}
              </span>
              {matchedIdList.length > 0 ? (
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {matchedIdList.length}개
                </span>
              ) : (
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  0개
                </span>
              )}
              {matchedIdList.length > 0 && (
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                  {matchedIdList.map((el, idx) => (
                    <span
                      key={`popular-match-${el.id}-${idx}`}
                      className="inline-block mr-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      #{el.id}
                      {el.item.blogName}
                      {el.item.group}
                    </span>
                  ))}
                </span>
              )}
            </div>
          )}

          {/* 블로그 검색 결과 매칭 정보 */}
          {blogSearchData && blogSearchData.items?.length > 0 && (
            <div
              className={cn(
                'mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg',
                'border border-blue-200 dark:border-blue-700',
                'bg-blue-50 dark:bg-blue-900/20'
              )}
            >
              <span
                className={cn(
                  'text-xs sm:text-sm text-gray-700 dark:text-gray-300'
                )}
              >
                블로그 매칭:{' '}
              </span>
              {(() => {
                const allowedIds = new Set(
                  BLOG_IDS.map((v) => v.toLowerCase())
                );
                const matchedBlogs = new Map(); // blogId -> { count, keyword, positions }

                blogSearchData.items.forEach((item, index) => {
                  try {
                    const u = new URL(item.link);
                    if (
                      u.hostname.includes('blog.naver.com') ||
                      u.hostname.includes('m.blog.naver.com')
                    ) {
                      const seg = u.pathname.replace(/^\//, '').split('/')[0];
                      const id = (seg || '').toLowerCase();
                      if (id && allowedIds.has(id)) {
                        if (!matchedBlogs.has(id)) {
                          matchedBlogs.set(id, {
                            count: 0,
                            keyword: blogSearchData.keyword,
                            blogName: item?.blogName || '', // 실제로는 블로그명을 가져와야 하지만 일단 ID 사용
                            positions: [],
                          });
                        }
                        const current = matchedBlogs.get(id);
                        current.count++;
                        current.positions.push(index + 1); // 1부터 시작하는 순위
                      }
                    }
                  } catch {}
                });

                const matchedBlogArray = Array.from(matchedBlogs.entries());

                if (matchedBlogArray.length > 0) {
                  return (
                    <React.Fragment>
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        {matchedBlogArray.length}개
                      </span>
                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                        (총 {blogSearchData.items.length}개 중)
                      </span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {matchedBlogArray.map(([blogId, info], idx) => (
                          <span
                            key={`blog-match-${String(blogId)}-${idx}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 text-xs"
                          >
                            <span className="font-semibold">
                              {String(blogId)}
                            </span>
                            <span className="text-blue-600 dark:text-blue-300">
                              ({info.count}개)
                            </span>
                            <span className="text-blue-500 dark:text-blue-400">
                              "{info.keyword}"
                            </span>
                            <span className="text-blue-400 dark:text-blue-500">
                              [{info.positions.slice(0, 3).join(', ')}
                              {info.positions.length > 3 ? '...' : ''}위]
                            </span>
                          </span>
                        ))}
                      </div>
                    </React.Fragment>
                  );
                } else {
                  return (
                    <React.Fragment>
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                        0개
                      </span>
                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                        (총 {blogSearchData.items.length}개 중)
                      </span>
                    </React.Fragment>
                  );
                }
              })()}
            </div>
          )}
        </div>
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            네이버 인기글 추출
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            네이버 검색 결과에서 인기 키워드별 블로그 글을 추출합니다
          </p>
        </div>

        <PopularViewerModal
          open={isViewerOpen}
          loading={isViewerLoading}
          item={viewerItem}
          onClose={() => setIsViewerOpen(false)}
        />

        <PopularSearchForm />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="pt-6  pl-6 text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                인기글 결과
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400 bg-green-100 dark:bg-green-900/30 rounded-full">
                  {data.count}개
                </span>
              </h2>
            </div>
            <PopularResults />
          </div>
        )}

        {/* 블로그 검색 결과 카드 UI */}
        {(blogSearchData !== null || isLoading) && (
          <div className="mb-8">
            <BlogResultList blogData={blogSearchData} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NaverPopularPage;

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
} from '@/features/naver-popular/components/_PopularViewerModal';
import { BLOG_IDS } from '@/constants';
import {
  copyPreviewToClipboard,
  copyFullContentToClipboard,
} from '@/features/naver-popular/lib';
import { MainHeader } from '@/features/naver-popular/components/_MainHeader';
import { useRecentSearch } from '@/features/naver-popular/hooks';

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
        // setBlogSearchData(null); // 블로그 데이터는 초기화하지 않음 (별도 API)
        const res = await fetch(endpoint);
        const json: { error?: string; blog?: typeof blogSearchData } & typeof data =
          await res.json();

        if (json.error) {
          setError(json.error);
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

  useEffect(() => {
    const query = (loaderData?.q ?? '').trim();

    if (!query || !data) return;

    const hasExposure = matchedIdList.length > 0;
    updateRecentSearchExposure(query, hasExposure);
  }, [data, matchedIdList.length, loaderData, updateRecentSearchExposure]);

  return (
    <div
      className={cn(
        'min-h-screen bg-white dark:bg-black transition-colors duration-300'
      )}
    >
      <div className={cn('absolute inset-0 -z-10')}>
        <div
          className={cn(
            'absolute inset-0 opacity-[0.015] dark:opacity-[0.03]',
            'bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)]',
            'dark:bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)]'
          )}
          style={{ backgroundSize: '24px 24px' }}
        />

        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/50',
            'dark:to-gray-950/50'
          )}
        />
      </div>

      <div className={cn('relative')}>
        <div
          className={cn(
            'container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16'
          )}
        >
          <PopularViewerModal
            open={isViewerOpen}
            loading={isViewerLoading}
            item={viewerItem}
            onClose={() => setIsViewerOpen(false)}
          />

          <PopularSearchForm />
          <div className={cn('mb-8 sm:mb-12')}>
            {data && data.items?.length > 0 && (
              <div
                className={cn(
                  'mb-6 p-6 rounded-2xl border',
                  'bg-white dark:bg-black',
                  'border-gray-200 dark:border-gray-800',
                  'shadow-sm hover:shadow-md transition-shadow duration-200'
                )}
              >
                <div className={cn('flex items-center justify-between')}>
                  <h3
                    className={cn(
                      'text-lg font-semibold text-black dark:text-white'
                    )}
                  >
                    노출 항목
                  </h3>

                  <div className={cn('flex items-center gap-3')}>
                    <span
                      className={cn('text-sm text-gray-600 dark:text-gray-400')}
                    >
                      노출항목:
                    </span>
                    {matchedIdList.length > 0 ? (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full',
                          'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                        )}
                      >
                        <div
                          className={cn('w-2 h-2 rounded-full bg-green-500')}
                        />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {matchedIdList.length}개 발견
                        </span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full',
                          'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                        )}
                      >
                        <div
                          className={cn('w-2 h-2 rounded-full bg-red-500')}
                        />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          매칭 없음
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {matchedIdList.length > 0 && (
                  <div className={cn('mt-4 flex flex-wrap gap-2')}>
                    {matchedIdList.map((el, idx) => (
                      <div
                        key={`popular-match-${el.id}-${idx}`}
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
                          'bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800',
                          'hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors'
                        )}
                      >
                        <span
                          className={cn(
                            'text-xs font-mono font-medium text-black dark:text-white'
                          )}
                        >
                          #{el.id}
                        </span>
                        <span
                          className={cn(
                            'text-sm text-gray-700 dark:text-gray-300'
                          )}
                        >
                          {el.item.blogName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {blogSearchData && blogSearchData.items?.length > 0 && (
              <div
                className={cn(
                  'mb-6 p-4 rounded-xl border',
                  'bg-white dark:bg-black',
                  'border-gray-200 dark:border-gray-800',
                  'shadow-sm'
                )}
              >
                <div className={cn('flex items-center justify-between mb-3')}>
                  <div className={cn('flex items-center gap-2')}>
                    <h4
                      className={cn(
                        'text-sm font-medium text-black dark:text-white'
                      )}
                    >
                      블로그 검색 매칭
                    </h4>
                    <span
                      className={cn('text-xs text-gray-500 dark:text-gray-400')}
                    >
                      "{blogSearchData.keyword}"
                    </span>
                  </div>
                </div>
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
                      <div className={cn('flex flex-wrap gap-2')}>
                        {matchedBlogArray.map(([blogId, info], idx) => (
                          <div
                            key={`blog-match-${String(blogId)}-${idx}`}
                            className={cn(
                              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                              'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800',
                              'text-green-800 dark:text-green-300'
                            )}
                          >
                            <span className={cn('font-mono font-bold')}>
                              #{String(blogId)}
                            </span>
                            <span
                              className={cn(
                                'text-green-600 dark:text-green-400'
                              )}
                            >
                              {info.count}개
                            </span>
                            <span
                              className={cn(
                                'text-green-500 dark:text-green-500'
                              )}
                            >
                              {info.positions.slice(0, 2).join(',')}
                              {info.positions.length > 2 ? '...' : ''}위
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                          'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800',
                          'text-red-800 dark:text-red-300'
                        )}
                      >
                        <span>매칭 없음</span>
                        <span className={cn('text-red-600 dark:text-red-400')}>
                          (총 {blogSearchData.items.length}개 중)
                        </span>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
          {error && (
            <div
              className={cn(
                'p-6 rounded-2xl border mb-8',
                'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
                'shadow-sm'
              )}
            >
              <div className={cn('flex items-center gap-3')}>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-red-500 flex-shrink-0'
                  )}
                />
                <p className="font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          <PopularResults />

          {(blogSearchData !== null || isLoading) && (
            <div className={cn('mb-12')}>
              <BlogResultList blogData={blogSearchData} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NaverPopularPage;

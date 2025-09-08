import React, { useEffect, useState } from 'react';
import type { Route } from './+types/naver-popular';
import { useToast } from '@/components/Toast';
import type { PopularItem } from '@/entities/naver/types';
import { useAtom } from 'jotai';
import {
  popularDataAtom,
  popularErrorAtom,
  viewerOpenAtom,
  viewerLoadingAtom,
  viewerItemAtom,
} from '@/features/naverPopular/store/atoms';
import { usePopularActions } from '@/features/naverPopular/hooks/usePopularActions';
import { PopularSearchForm } from '@/features/naverPopular/components/PopularSearchForm';
import { PopularResults } from '@/features/naverPopular/components/PopularResults';
import {
  PopularViewerModal,
  type PopularViewerItem,
} from '@/components/naverPopular/PopularViewerModal';
import {
  copyPreviewToClipboard,
  copyFullContentToClipboard,
} from '@/features/naverPopular/lib/clipboard';

export const meta = (_: Route.MetaArgs) => [
  { title: 'Naver 인기글 추출' },
  {
    name: 'description',
    content: '네이버 검색 결과의 인기글(블로그) 요소를 추출합니다.',
  },
];

const NaverPopularPage: React.FC = () => {
  const { show } = useToast();
  const [error] = useAtom(popularErrorAtom);
  const [data] = useAtom(popularDataAtom);
  const [isViewerOpen, setIsViewerOpen] = useAtom(viewerOpenAtom);
  const [isViewerLoading, setIsViewerLoading] = useAtom(viewerLoadingAtom);
  const [viewerItem, setViewerItem] = useAtom(viewerItemAtom);
  const { fetchPopular } = usePopularActions();

  const copyPreview = (item: PopularItem) =>
    copyPreviewToClipboard(item, (m, o) => show(m, o));
  const copyFullContent = (link: string) =>
    copyFullContentToClipboard(link, (m, o) => show(m, o));

  const openViewer = async (item: PopularItem) => {
    setIsViewerOpen(true);
    setIsViewerLoading(true);
    setViewerItem({ ...item });
    try {
      const res = await fetch(
        `/api/content?url=${encodeURIComponent(item.link)}`
      );
      const json = await res.json();
      if (json.error) {
        show(String(json.error), { type: 'error' });
        setIsViewerLoading(false);
        return;
      }
      setViewerItem((prev) =>
        prev
          ? {
              ...prev,
              title: json.title || prev.title,
              content: json.content || '',
              blogName: json.blogName || undefined,
              image: (json.images && json.images[0]) || prev.image,
              link: item.link,
            }
          : prev
      );
    } catch {
      show('본문을 가져오는데 실패했습니다.', { type: 'error' });
    } finally {
      setIsViewerLoading(false);
    }
  };

  useEffect(() => {
    if (data) show(`인기글 ${data.count}개 추출 완료`, { type: 'success' });
  }, [data, show]);

  return (
    <div className="relative py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-gradient-to-br from-green-200/40 via-blue-200/30 to-transparent blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                인기글 결과
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  {data.count}개
                </span>
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 break-all max-w-xs truncate">
                {data.url}
              </span>
            </div>
            <PopularResults
              itemList={data.items}
              onCopyPreview={copyPreview}
              onCopyFull={copyFullContent}
              onOpenViewer={openViewer}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NaverPopularPage;

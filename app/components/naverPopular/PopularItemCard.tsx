import type { PopularItem } from '@/entities/naver/types';
import React from 'react';

interface Props {
  item: PopularItem;
}

import { useToast } from '@/components/Toast';
import {
  copyPreviewToClipboard,
  copyFullContentToClipboard,
} from '@/features/naverPopular/lib/clipboard';
import { useSetAtom } from 'jotai';
import { viewerItemAtom } from '@/features/naverPopular/store/atoms';
import { useViewerActions } from '@/features/naverPopular/hooks/useViewerActions';

export const PopularItemCard: React.FC<Props> = ({ item }) => {
  const { show } = useToast();
  const setViewerItem = useSetAtom(viewerItemAtom);
  const { openViewer } = useViewerActions();
  const displayLink = item.link.replace('://blog.', '://m.blog.');
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 hover:shadow-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={displayLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
          >
            {item.title}
          </a>
          <a
            href={displayLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
          >
            {item.blogName}
          </a>

          <p className="mt-3 text-xs text-green-600 dark:text-green-400 break-all font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
            {item.link}
          </p>
        </div>
        {item.image && (
          <img
            src={item.image}
            alt="thumb"
            className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow"
          />
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => copyPreviewToClipboard(item, (m, o) => show(m, o))}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-sm"
        >
          미리보기 복사
        </button>
        {item.link.includes('blog.naver.com') && (
          <button
            onClick={() =>
              copyFullContentToClipboard(item.link, (m, o) => show(m, o))
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-700 transition-all hover:shadow-sm"
          >
            전체 본문 복사
          </button>
        )}
        {item.link.includes('blog.naver.com') && (
          <button
            onClick={() => {
              setViewerItem(item);
              openViewer(item.link);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-700 transition-all hover:shadow-sm"
          >
            미리보기
          </button>
        )}
      </div>
    </div>
  );
};

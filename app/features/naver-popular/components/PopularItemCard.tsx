import type { PopularItem } from '@/entities/naver/_types';
import React from 'react';
import { Download, Copy, FileText, Eye } from 'lucide-react';

interface Props {
  item: PopularItem;
}

import { useToast } from '@/shared/ui/Toast';
import { copyFullContentToClipboard, copyTitleToClipboard, downloadContentToFile } from '@/features/naver-popular/lib';
import { useSetAtom } from 'jotai';
import { useViewerActions, viewerItemAtom } from '@/features';

export const PopularItemCard: React.FC<Props> = ({ item }) => {
  const { show } = useToast();
  const setViewerItem = useSetAtom(viewerItemAtom);
  const { openViewer } = useViewerActions();
  const displayLink = item.link.replace('://blog.', '://m.blog.');

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 hover:shadow-xl bg-white dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-750 transition-all duration-200 hover:-translate-y-0.5">
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
          <p>
            <a
              href={item.blogLink}
              target=""
              className="text-md font-bold text-black dark:text-white hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
            >
              {item.blogName}
            </a>
          </p>

          <p className="mt-3 text-xs text-green-600 dark:text-green-400 break-all font-mono bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
            {item.link}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() =>
            copyTitleToClipboard(item.title, (m, o) => show(m, o))
          }
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-700 transition-all hover:shadow-sm hover:scale-110 cursor-pointer active:scale-105"
        >
          <Copy size={16} />
          제목 복사
        </button>

        <button
          onClick={() =>
            copyFullContentToClipboard(item.link, (m, o) => show(m, o))
          }
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-700 transition-all hover:shadow-sm hover:scale-110 cursor-pointer active:scale-105"
        >
          <FileText size={16} />
          전체 본문 복사
        </button>

        <button
          onClick={() =>
            downloadContentToFile(item.link, item.title, (m, o) => show(m, o))
          }
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-xl border border-orange-200 dark:border-orange-700 transition-all hover:shadow-sm hover:scale-110 cursor-pointer active:scale-105"
        >
          <Download size={16} />
          다운로드
        </button>

        <button
          onClick={() => {
            setViewerItem(item);
            openViewer(item.link);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-700 transition-all hover:shadow-sm hover:scale-110 cursor-pointer active:scale-105"
        >
          <Eye size={16} />
          미리보기
        </button>
      </div>
    </div>
  );
};

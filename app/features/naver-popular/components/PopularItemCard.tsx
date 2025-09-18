import type { PopularItem } from '@/entities/naver/_types';
import React from 'react';
import { Download, Copy, FileText, Eye } from 'lucide-react';
import { Button, cn } from '@/shared';

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
    <div className={cn(
      "border border-gray-200 dark:border-gray-600 rounded-2xl p-3 sm:p-5",
      "hover:shadow-xl bg-white dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-750",
      "transition-all duration-200 hover:-translate-y-0.5"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={displayLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400",
              "hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
            )}
          >
            {item.title}
          </a>
          <p>
            <a
              href={item.blogLink}
              target=""
              className={cn(
                "text-xs sm:text-md font-bold text-black dark:text-white",
                "hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
              )}
            >
              {item.blogName}
            </a>
          </p>

          <p className={cn(
            "mt-2 sm:mt-3 text-xs text-green-600 dark:text-green-400 break-all font-mono",
            "bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg"
          )}>
            {item.link}
          </p>
        </div>
      </div>
      <div className={cn(
        "mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3"
      )}>
        <Button
          variant="success"
          size="sm"
          icon={<Copy size={14} />}
          onClick={() =>
            copyTitleToClipboard(item.title, (m, o) => show(m, o))
          }
        >
          제목 복사
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<FileText size={14} />}
          onClick={() =>
            copyFullContentToClipboard(item.link, (m, o) => show(m, o))
          }
        >
          <span className="hidden sm:inline">전체 본문 복사</span>
          <span className="sm:hidden">본문 복사</span>
        </Button>

        <Button
          variant="warning"
          size="sm"
          icon={<Download size={14} />}
          onClick={() =>
            downloadContentToFile(item.link, item.title, (m, o) => show(m, o))
          }
        >
          다운로드
        </Button>

        <Button
          variant="info"
          size="sm"
          icon={<Eye size={14} />}
          onClick={() => {
            setViewerItem(item);
            openViewer(item.link);
          }}
        >
          미리보기
        </Button>
      </div>
    </div>
  );
};

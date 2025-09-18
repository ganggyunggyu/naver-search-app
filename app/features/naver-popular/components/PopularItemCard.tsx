import type { PopularItem } from '@/entities/naver/_types';
import React from 'react';
import { Download, Copy, FileText, Eye } from 'lucide-react';
import { Button, cn } from '@/shared';

interface Props {
  item: PopularItem;
  position?: number;
  isMatched?: boolean;
  blogId?: string;
  className?: string;
}

import { useToast } from '@/shared/ui/Toast';
import { copyFullContentToClipboard, copyTitleToClipboard, downloadContentToFile } from '@/features/naver-popular/lib';
import { useSetAtom } from 'jotai';
import { useViewerActions, viewerItemAtom } from '@/features';

export const PopularItemCard: React.FC<Props> = ({
  item,
  position,
  isMatched = false,
  blogId,
  className
}) => {
  const { show } = useToast();
  const setViewerItem = useSetAtom(viewerItemAtom);
  const { openViewer } = useViewerActions();
  const displayLink = item.link.replace('://blog.', '://m.blog.');

  return (
    <React.Fragment>
      <div className={cn(
        "border rounded-2xl p-3 sm:p-5 transition-all duration-200",
        "hover:shadow-xl hover:-translate-y-0.5",
        isMatched
          ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
          : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-750",
        className
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* 순위와 매칭 표시 (블로그 카드용) */}
            {position && (
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                  isMatched
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                )}>
                  {position}
                </span>
                {isMatched && blogId && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    매칭!
                  </span>
                )}
                {blogId && (
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    isMatched
                      ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  )}>
                    #{blogId}
                  </span>
                )}
              </div>
            )}

            {/* 제목 */}
            <a
              href={displayLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm sm:text-lg font-bold break-all transition-colors hover:underline",
                isMatched
                  ? "text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
                  : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              )}
            >
              {item.title}
            </a>

            {/* 블로그명 (인기글용) */}
            {item.blogName && item.blogLink && (
              <p>
                <a
                  href={item.blogLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-xs sm:text-md font-bold text-black dark:text-white",
                    "hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
                  )}
                >
                  {item.blogName}
                </a>
              </p>
            )}

            {/* 설명 (블로그용) */}
            {(item as any).description && (
              <p className={cn(
                "mt-2 text-xs sm:text-sm break-all",
                isMatched
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              )}>
                {((item as any).description as string).replace(/<[^>]*>/g, '')}
              </p>
            )}

            {/* 링크 */}
            <p className={cn(
              "mt-2 sm:mt-3 text-xs font-mono break-all px-2 py-1 rounded-lg",
              isMatched
                ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
                : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
            )}>
              {item.link}
            </p>
          </div>
        </div>

        {/* 액션 버튼들 */}
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
    </React.Fragment>
  );
};

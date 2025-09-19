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
        "border rounded-lg p-4 transition-all duration-200",
        "hover:shadow-md",
        isMatched
          ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-black",
        className
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* 순위와 매칭 표시 (블로그 카드용) */}
            {position && (
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold",
                  isMatched
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                )}>
                  {position}
                </span>
                {blogId && (
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded",
                    isMatched
                      ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
                  )}>
                    #{blogId}
                  </span>
                )}
                {isMatched && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                    MATCH
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
                "text-sm font-semibold break-all transition-colors hover:underline mb-2 block",
                "text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              {item.title}
            </a>

            {/* 블로그명 (인기글용) */}
            {item.blogName && item.blogLink && (
              <div className="mb-2">
                <a
                  href={item.blogLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-xs font-medium text-gray-600 dark:text-gray-200",
                    "hover:text-black dark:hover:text-white transition-colors"
                  )}
                >
                  {item.blogName}
                </a>
              </div>
            )}

            {/* 설명 (블로그용) - 간소화 */}
            {(item as any).description && (
              <p className={cn(
                "mt-2 text-xs text-gray-500 dark:text-gray-300 line-clamp-2"
              )}>
                {((item as any).description as string).replace(/<[^>]*>/g, '').slice(0, 120)}
                {((item as any).description as string).length > 120 ? '...' : ''}
              </p>
            )}

            {/* 링크 - 간소화 */}
            <div className={cn(
              "mt-2 text-xs font-mono text-gray-400 dark:text-gray-400 truncate"
            )}>
              {item.link}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 - 간소화된 검흰 버전 */}
        <div className={cn(
          "mt-4 pt-3 border-t border-gray-100 dark:border-gray-900",
          "flex flex-wrap gap-2"
        )}>
          <button
            onClick={() =>
              copyTitleToClipboard(item.title, (m, o) => show(m, o))
            }
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium",
              "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-100",
              "hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
              "border border-gray-200 dark:border-gray-800"
            )}
          >
            <Copy size={12} />
            제목
          </button>

          <button
            onClick={() =>
              copyFullContentToClipboard(item.link, (m, o) => show(m, o))
            }
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium",
              "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-100",
              "hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
              "border border-gray-200 dark:border-gray-800"
            )}
          >
            <FileText size={12} />
            <span className="hidden sm:inline">본문</span>
            <span className="sm:hidden">본문</span>
          </button>

          <button
            onClick={() =>
              downloadContentToFile(item.link, item.title, (m, o) => show(m, o))
            }
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium",
              "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-100",
              "hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
              "border border-gray-200 dark:border-gray-800"
            )}
          >
            <Download size={12} />
            저장
          </button>

          <button
            onClick={() => {
              setViewerItem(item);
              openViewer(item.link);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium",
              "bg-black dark:bg-white text-white dark:text-black",
              "hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            )}
          >
            <Eye size={12} />
            보기
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

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
        "relative rounded-2xl p-5 transition-all duration-300",
        "shadow-sm hover:shadow-lg active:scale-[0.98]",
        "border-2 overflow-hidden",
        isMatched
          ? "border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30"
          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-black hover:border-gray-200 dark:hover:border-gray-700",
        className
      )}>
        {/* 모바일 앱스러운 상단 인디케이터 */}
        {position && (
          <div className={cn("absolute top-0 left-0 right-0 h-1",
            isMatched
              ? "bg-gradient-to-r from-green-500 to-green-400"
              : "bg-gradient-to-r from-blue-500 to-purple-500"
          )} />
        )}

        {/* 상단 메타 정보 */}
        <div className={cn("flex items-center justify-between mb-4")}>
          <div className={cn("flex items-center gap-3")}>
            {position && (
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                isMatched
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
              )}>
                {position}
              </div>
            )}
            {blogId && (
              <span className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-full",
                isMatched
                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
              )}>
                #{blogId}
              </span>
            )}
          </div>
          {isMatched && (
            <div className={cn(
              "px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-400",
              "text-white text-xs font-bold rounded-full shadow-sm",
              "animate-pulse"
            )}>
              ✓ MATCH
            </div>
          )}
        </div>

        {/* 제목 - 앱스러운 스타일 */}
        <div className={cn("mb-4")}>
          <h3
            onClick={() => window.open(displayLink, '_blank', 'noopener,noreferrer')}
            className={cn(
              "text-base font-bold leading-snug text-black dark:text-white",
              "cursor-pointer line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400",
              "transition-colors duration-200"
            )}
          >
            {item.title}
          </h3>

          {/* 블로그명 */}
          {item.blogName && item.blogLink && (
            <div className={cn("mt-2 flex items-center gap-2")}>
              <div className={cn("w-2 h-2 rounded-full bg-blue-500")} />
              <span
                onClick={() => window.open(item.blogLink!, '_blank', 'noopener,noreferrer')}
                className={cn(
                  "text-sm font-medium text-gray-600 dark:text-gray-300",
                  "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                )}
              >
                {item.blogName}
              </span>
            </div>
          )}
        </div>

        {/* 설명 - 모바일 친화적 */}
        {(item as any).description && (
          <p className={cn(
            "text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4",
            "line-clamp-2"
          )}>
            {((item as any).description as string).replace(/<[^>]*>/g, '').slice(0, 100)}
            {((item as any).description as string).length > 100 ? '...' : ''}
          </p>
        )}

        {/* 모바일 앱스러운 액션 버튼들 */}
        <div className={cn("flex items-center gap-2")}>
          <button
            onClick={() => {
              setViewerItem(item);
              openViewer(item.link);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
              "bg-black dark:bg-white text-white dark:text-black font-semibold text-sm",
              "hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200",
              "shadow-sm hover:shadow-md active:scale-95"
            )}
          >
            <Eye size={16} />
            <span className="hidden sm:inline">자세히 보기</span>
            <span className="sm:hidden">보기</span>
          </button>

          <button
            onClick={() =>
              copyFullContentToClipboard(item.link, (m, o) => show(m, o))
            }
            className={cn(
              "p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700",
              "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <FileText size={16} className="text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={() =>
              copyTitleToClipboard(item.title, (m, o) => show(m, o))
            }
            className={cn(
              "p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700",
              "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={() =>
              downloadContentToFile(item.link, item.title, (m, o) => show(m, o))
            }
            className={cn(
              "p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700",
              "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <Download size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 하단 URL - 더 깔끔하게 */}
        <div className={cn(
          "mt-4 pt-3 border-t border-gray-100 dark:border-gray-800"
        )}>
          <div className={cn(
            "text-xs font-mono text-gray-400 dark:text-gray-500 truncate",
            "flex items-center gap-2"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full bg-gray-400")} />
            {item.link.replace('https://', '').slice(0, 50)}...
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

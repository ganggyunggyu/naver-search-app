import type { PopularItem } from '@/entities/naver/_types';
import React from 'react';
import { Download, Copy, FileText, Eye, Smartphone, Monitor, Edit } from 'lucide-react';
import { cn } from '@/shared';

interface Props {
  item: PopularItem;
  position?: number;
  isMatched?: boolean;
  blogId?: string;
  className?: string;
}

import { useToast } from '@/shared/ui/Toast';
import {
  copyFullContentToClipboard,
  copyTitleToClipboard,
  downloadContentToFile,
  copyMobileLinkToClipboard,
  copyDesktopLinkToClipboard,
  copyEditLinkToClipboard
} from '@/features/naver-popular/lib';
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
              <div className={cn("flex items-center gap-2")}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                  isMatched
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                )}>
                  {position}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isMatched
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  상단 {position}번째
                </span>
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
        <div className={cn('mb-4')}>
          <div className={cn('flex items-start gap-2')}>
            <h3
              onClick={() => window.open(displayLink, '_blank', 'noopener,noreferrer')}
              className={cn(
                'flex-1 text-base font-bold leading-snug text-black dark:text-white',
                'cursor-pointer line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400',
                'transition-colors duration-200'
              )}
            >
              {item.title}
            </h3>
            <button
              type="button"
              aria-label="수정 링크 복사"
              onClick={() => copyEditLinkToClipboard(item.link, (m, o) => show(m, o))}
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-all',
                'border-gray-200 bg-white text-gray-500 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600',
                'shadow-sm dark:border-gray-700 dark:bg-black dark:text-gray-400 dark:hover:border-orange-400 dark:hover:bg-orange-950/40 dark:hover:text-orange-400'
              )}
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              aria-label="제목 복사"
              onClick={() => copyTitleToClipboard(item.title, (m, o) => show(m, o))}
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-all',
                'border-gray-200 bg-white text-gray-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600',
                'shadow-sm dark:border-gray-700 dark:bg-black dark:text-gray-400 dark:hover:border-blue-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-400'
              )}
            >
              <Copy size={16} />
            </button>
          </div>

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
        <div className={cn("space-y-3")}>
          {/* 메인 액션 버튼 */}
          <button
            onClick={() => {
              setViewerItem(item);
              openViewer(item.link);
            }}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
              "bg-black dark:bg-white text-white dark:text-black font-semibold text-sm",
              "hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200",
              "shadow-sm hover:shadow-md active:scale-95"
            )}
          >
            <Eye size={16} />
            <span>자세히 보기</span>
          </button>

          {/* 첫 번째 줄: 콘텐츠 관련 액션 */}
          <div className={cn("flex items-center gap-2")}>
            <button
              onClick={() =>
                copyFullContentToClipboard(item.link, (m, o) => show(m, o))
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl",
                "border-2 border-gray-200 dark:border-gray-700",
                "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-all duration-200 active:scale-95"
              )}
            >
              <FileText size={14} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">본문</span>
            </button>

            <button
              onClick={() =>
                copyTitleToClipboard(item.title, (m, o) => show(m, o))
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl",
                "border-2 border-gray-200 dark:border-gray-700",
                "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-all duration-200 active:scale-95"
              )}
            >
              <Copy size={14} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">제목</span>
            </button>

            <button
              onClick={() =>
                downloadContentToFile(item.link, item.title, (m, o) => show(m, o))
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl",
                "border-2 border-gray-200 dark:border-gray-700",
                "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-all duration-200 active:scale-95"
              )}
            >
              <Download size={14} className="text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">저장</span>
            </button>
          </div>

          {/* 두 번째 줄: 링크 복사 액션 */}
          <div className={cn("flex items-center gap-2")}>
            <button
              onClick={() =>
                copyMobileLinkToClipboard(item.link, (m, o) => show(m, o))
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl",
                "border-2 border-blue-200 dark:border-blue-800",
                "bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50",
                "transition-all duration-200 active:scale-95"
              )}
            >
              <Smartphone size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">모바일링크</span>
            </button>

            <button
              onClick={() =>
                copyDesktopLinkToClipboard(item.link, (m, o) => show(m, o))
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl",
                "border-2 border-purple-200 dark:border-purple-800",
                "bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50",
                "transition-all duration-200 active:scale-95"
              )}
            >
              <Monitor size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">데스크탑링크</span>
            </button>
          </div>
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

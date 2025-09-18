import React from 'react';
import { Download, Copy, FileText, Eye, ExternalLink } from 'lucide-react';
import { Button, cn } from '@/shared';
import { useToast } from '@/shared/ui/Toast';

interface ActionButton {
  variant: 'success' | 'primary' | 'warning' | 'info' | 'secondary';
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}

interface ItemCardProps {
  title: string;
  link: string;
  displayLink?: string;
  blogName?: string;
  blogLink?: string;
  description?: string;
  position?: number;
  isMatched?: boolean;
  blogId?: string;
  actions: ActionButton[];
  className?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  title,
  link,
  displayLink,
  blogName,
  blogLink,
  description,
  position,
  isMatched = false,
  blogId,
  actions,
  className,
}) => {
  const { show } = useToast();
  const cleanTitle = title.replace(/<[^>]*>/g, '');
  const cleanDescription = description?.replace(/<[^>]*>/g, '');
  const finalDisplayLink = displayLink || link.replace('://blog.', '://m.blog.');

  return (
    <React.Fragment>
      <div className={cn(
        "border rounded-2xl p-3 sm:p-5 transition-all duration-200",
        "hover:shadow-xl hover:-translate-y-0.5",
        isMatched
          ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
          : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750",
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
              href={finalDisplayLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm sm:text-lg font-bold break-all transition-colors hover:underline",
                isMatched
                  ? "text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
                  : "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              )}
            >
              {cleanTitle}
            </a>

            {/* 블로그명 (인기글 카드용) */}
            {blogName && blogLink && (
              <p>
                <a
                  href={blogLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-xs sm:text-md font-bold text-black dark:text-white",
                    "hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all transition-colors"
                  )}
                >
                  {blogName}
                </a>
              </p>
            )}

            {/* 설명 (블로그 카드용) */}
            {description && (
              <p className={cn(
                "mt-2 text-xs sm:text-sm break-all",
                isMatched
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              )}>
                {cleanDescription}
              </p>
            )}

            {/* 링크 */}
            <p className={cn(
              "mt-2 sm:mt-3 text-xs font-mono break-all px-2 py-1 rounded-lg",
              isMatched
                ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
                : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
            )}>
              {link}
            </p>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className={cn(
          "mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3"
        )}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.children}
            </Button>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};
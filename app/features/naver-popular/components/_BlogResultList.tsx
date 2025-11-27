import React from 'react';
import { Search, Download } from 'lucide-react';
import { cn, Chip } from '@/shared';
import { PopularItemCard } from './_PopularItemCard';
import { BLOG_ID_SET } from '@/constants';
import { extractBlogIdFromUrl } from '@/shared/utils/_blog';
import { useToast } from '@/shared/ui/Toast';
import type { PopularItem } from '@/entities/naver/_types';

interface BlogItem {
  title: string;
  link: string;
  description: string;
  [key: string]: any;
}

interface BlogCrawlResponse {
  items: BlogItem[];
  total: number;
  keyword: string;
  url: string;
}

interface BlogResultListProps {
  blogData: BlogCrawlResponse | null;
  isLoading?: boolean;
  className?: string;
}

export const BlogResultList: React.FC<BlogResultListProps> = ({
  blogData,
  isLoading = false,
  className,
}) => {
  const { show } = useToast();

  const { allBlogs, matchedCount } = React.useMemo(() => {
    if (!blogData?.items) return { allBlogs: [], matchedCount: 0 };

    let matchedCount = 0;

    const allBlogs = blogData.items.slice(0, 20).map((item, index) => {
      const id = extractBlogIdFromUrl(item.link);
      const isMatched = id && BLOG_ID_SET.has(id);

      if (isMatched) matchedCount++;

      return {
        item,
        position: index + 1,
        blogId: id || undefined,
        isMatched,
        id: isMatched ? id : undefined,
      };
    });

    return { allBlogs, matchedCount };
  }, [blogData]);

  const handleDownloadAll = async () => {
    if (!blogData?.items) return;

    try {
      const content = blogData.items
        .map(
          (item, index) =>
            `${index + 1}. ${item.title.replace(/<[^>]*>/g, '')}\n${item.link}\n${item.description.replace(/<[^>]*>/g, '')}\n`
        )
        .join('\n---\n\n');

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `블로그_검색결과_${blogData.keyword}_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      show('블로그 결과가 다운로드되었습니다!', { type: 'success' });
    } catch {
      show('다운로드 실패', { type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div
          className={cn(
            'rounded-2xl border p-6 animate-pulse',
            'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
            'shadow-sm'
          )}
        >
          <div className={cn('flex items-center justify-between mb-6')}>
            <div
              className={cn('h-8 w-48 bg-gray-100 dark:bg-gray-900 rounded-lg')}
            />
            <div
              className={cn(
                'h-10 w-32 bg-gray-100 dark:bg-gray-900 rounded-lg'
              )}
            />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-32 bg-gray-50 dark:bg-gray-950 rounded-xl border',
                  'border-gray-100 dark:border-gray-900'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blogData || !blogData.items?.length) {
    return (
      <div
        className={cn(
          'rounded-2xl border p-12 text-center',
          'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
          'shadow-sm',
          className
        )}
      >
        <div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center'
          )}
        >
          <Search size={24} className="text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
          블로그 검색 결과가 없습니다
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          다른 키워드로 검색해보세요
        </p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className={cn('space-y-8', className)}>
        {/* 블로그 검색 결과 */}
        {allBlogs.length > 0 && (
          <section
            className={cn(
              'rounded-2xl border p-6',
              'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
              'shadow-sm hover:shadow-md transition-shadow duration-200'
            )}
          >
            {/* 블로그 섹션 헤더 - 모바일 친화적 */}
            <div className={cn('mb-4')}>
              <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3')}>
                <div className={cn('flex flex-col sm:flex-row sm:items-center gap-3')}>
                  <h3 className={cn('text-lg sm:text-xl font-bold text-black dark:text-white')}>
                    블로그 검색 결과
                  </h3>
                  <div className={cn('flex items-center gap-2 flex-wrap')}>
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full w-fit',
                        'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                      )}
                    >
                      <div className={cn('w-2 h-2 rounded-full bg-blue-500 animate-pulse')} />
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {blogData.total}개 발견
                      </span>
                    </div>
                    {matchedCount > 0 && (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full w-fit',
                          'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
                          'border border-green-200 dark:border-green-800'
                        )}
                      >
                        <div className={cn('w-2 h-2 rounded-full bg-green-500 animate-bounce')} />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          ✓ 매칭 {matchedCount}개
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 다운로드 버튼 */}
                {blogData.items.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold',
                      'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
                      'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700',
                      'hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800',
                      'shadow-sm hover:shadow-md transition-all duration-200 active:scale-95',
                      'w-fit'
                    )}
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">다운로드</span>
                    <span className="sm:hidden">저장</span>
                    <span className="text-xs opacity-70">({blogData.items.length})</span>
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {allBlogs.map((blog, index) => {
                const blogItem = blog.item;
                const popularItem: PopularItem = {
                  title: blogItem.title,
                  link: blogItem.link,
                  blogName: blog.blogId || '',
                  blogLink: blog.blogId
                    ? `https://blog.naver.com/${blog.blogId}`
                    : '',
                  group: '',
                  description: blogItem.description,
                } as PopularItem & { description: string };

                return (
                  <PopularItemCard
                    key={`blog-${blog.position}-${index}`}
                    item={popularItem}
                    position={blog.position}
                    isMatched={blog.isMatched || false}
                    blogId={blog.blogId}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </React.Fragment>
  );
};

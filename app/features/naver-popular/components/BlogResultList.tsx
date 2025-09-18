import React from 'react';
import { Search, Download } from 'lucide-react';
import { cn, Chip } from '@/shared';
import { PopularItemCard } from './PopularItemCard';
import { BLOG_IDS } from '@/constants';
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

  // 블로그 ID 추출 함수
  const getBlogId = (url: string): string => {
    try {
      const u = new URL(url);
      if (
        u.hostname.includes('blog.naver.com') ||
        u.hostname.includes('m.blog.naver.com')
      ) {
        const seg = u.pathname.replace(/^\//, '').split('/')[0];
        return (seg || '').toLowerCase();
      }
    } catch {}
    return '';
  };

  // 매칭된 블로그와 일반 블로그 분리
  const { matchedBlogs, otherBlogs } = React.useMemo(() => {
    if (!blogData?.items) return { matchedBlogs: [], otherBlogs: [] };

    const allowedIds = new Set(BLOG_IDS.map((v) => v.toLowerCase()));
    const matched: Array<{
      id: string;
      item: BlogItem;
      position: number;
    }> = [];
    const others: Array<{
      item: BlogItem;
      position: number;
      blogId?: string;
    }> = [];

    for (let index = 0; index < blogData.items.length; index++) {
      const item = blogData.items[index];
      const id = getBlogId(item.link);

      if (id && allowedIds.has(id)) {
        matched.push({
          id,
          item,
          position: index + 1,
        });
      } else {
        others.push({
          item,
          position: index + 1,
          blogId: id || undefined,
        });
      }
    }

    return { matchedBlogs: matched, otherBlogs: others.slice(0, 12) };
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
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"
              ></div>
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
          'text-center py-12 text-gray-500 dark:text-gray-400',
          className
        )}
      >
        <Search size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">블로그 검색 결과가 없습니다</p>
        <p className="text-sm">다른 키워드로 검색해보세요</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className={cn('space-y-8', className)}>
        {/* 전체 다운로드 버튼 */}
        {blogData.items.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleDownloadAll}
              className={cn(
                'flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3',
                'text-base sm:text-lg font-semibold',
                'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                'text-white rounded-2xl shadow-lg hover:shadow-xl',
                'transition-all duration-200 hover:scale-105 active:scale-95'
              )}
            >
              <Download size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                전체 블로그 검색 결과 다운로드
              </span>
              <span className="sm:hidden">전체 다운로드</span>
              <Chip
                variant="primary"
                size="sm"
                className="bg-white/20 text-white border-white/30"
              >
                {blogData.items.length}개
              </Chip>
            </button>
          </div>
        )}

        {/* 매칭된 블로그 섹션 */}
        {matchedBlogs.length > 0 && (
          <section className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-800 dark:to-green-900 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  매칭된 블로그
                </h3>
                <span className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full border border-green-200 dark:border-green-800">
                  {matchedBlogs.length}개 발견
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {matchedBlogs.map((matched, index) => {
                const blogItem = matched.item;

                const popularItem: PopularItem = {
                  title: blogItem.title,
                  link: blogItem.link,
                  blogName: blogItem.title, // 블로그 ID를 블로그명으로 사용
                  blogLink: `https://blog.naver.com/${matched.id}`,
                  group: '',
                  description: blogItem.description,
                } as PopularItem & { description: string };

                return (
                  <PopularItemCard
                    key={`matched-${matched.position}-${index}`}
                    item={popularItem}
                    position={matched.position}
                    isMatched={true}
                    blogId={matched.id}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* 일반 블로그 섹션 */}
        {otherBlogs.length > 0 && (
          <section className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  블로그 검색 결과
                </h3>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-full border border-blue-200 dark:border-blue-800">
                  "{blogData.keyword}" 총 {blogData.total}개
                </span>
              </div>
              {/* 네이버에서 더보기 버튼 */}
              <button
                onClick={() =>
                  window.open(blogData.url, '_blank', 'noopener,noreferrer')
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-700 transition-all hover:shadow-sm hover:scale-110 cursor-pointer active:scale-105"
              >
                네이버에서 더보기 ({blogData.total}개)
              </button>
            </div>
            <div className="space-y-4">
              {otherBlogs.map((blog, index) => {
                const blogItem = blog.item;
                const popularItem: PopularItem = {
                  title: blogItem.title,
                  link: blogItem.link,
                  blogName: blog.blogId || '', // 블로그 ID를 블로그명으로 사용
                  blogLink: blog.blogId
                    ? `https://blog.naver.com/${blog.blogId}`
                    : '',
                  group: '',
                  description: blogItem.description,
                } as PopularItem & { description: string };

                return (
                  <PopularItemCard
                    key={`other-${blog.position}-${index}`}
                    item={popularItem}
                    position={blog.position}
                    isMatched={false}
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

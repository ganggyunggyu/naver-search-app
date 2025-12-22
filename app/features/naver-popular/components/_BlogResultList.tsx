import React from 'react';
import { Search, Download } from 'lucide-react';
import { PopularItemCard } from './_PopularItemCard';
import { BLOG_ID_SET } from '@/constants';
import { extractBlogIdFromUrl } from '@/shared/utils/_blog';
import { useToast } from '@/shared/ui/Toast';
import type { PopularItem } from '@/entities/naver/_types';

interface BlogItem {
  title: string;
  link: string;
  description: string;
  blogName?: string;
  blogLink?: string;
  author?: string;
  date?: string;
  thumbnail?: string;
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
}

export const BlogResultList: React.FC<BlogResultListProps> = ({
  blogData,
  isLoading = false,
}) => {
  const { show } = useToast();

  const { allBlogs, matchedCount } = React.useMemo(() => {
    if (!blogData?.items) return { allBlogs: [], matchedCount: 0 };

    let matchedCount = 0;

    const allBlogs = blogData.items.map((item, index) => {
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
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-32 rounded bg-[var(--color-bg-tertiary)]" />
            <div className="h-4 w-20 rounded bg-[var(--color-bg-tertiary)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg bg-[var(--color-bg-tertiary)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blogData || !blogData.items?.length) {
    return (
      <div className="p-8 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)] text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] mb-3">
          <Search size={24} />
        </div>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
          블로그 검색 결과가 없습니다
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          다른 키워드로 검색해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {allBlogs.length > 0 && (
        <section>
          <header className="mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  블로그 검색 결과
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                    {blogData.total}개 발견
                  </span>
                  {matchedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-success)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                      ✓ 매칭 {matchedCount}개
                    </span>
                  )}
                </div>
              </div>

              {blogData.items.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-all"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">다운로드</span>
                  <span className="sm:hidden">저장</span>
                  <span className="text-[var(--color-text-tertiary)]">
                    ({blogData.items.length})
                  </span>
                </button>
              )}
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
  );
};

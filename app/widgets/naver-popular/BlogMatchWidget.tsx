import React, { useMemo } from 'react';
import { BLOG_ID_SET } from '@/constants';
import { extractBlogIdFromUrl } from '@/shared/utils/_blog';

interface BlogItem {
  link: string;
  blogName?: string;
}

interface BlogSearchData {
  keyword: string;
  items: BlogItem[];
}

interface BlogMatchInfo {
  count: number;
  keyword: string;
  blogName: string;
  positions: number[];
}

interface BlogMatchWidgetProps {
  blogSearchData: BlogSearchData;
}

export const BlogMatchWidget: React.FC<BlogMatchWidgetProps> = ({
  blogSearchData,
}) => {
  const matchedBlogArray = useMemo(() => {
    const matchedBlogs = new Map<string, BlogMatchInfo>();

    blogSearchData.items.forEach((item, index) => {
      const id = extractBlogIdFromUrl(item.link);
      if (id && BLOG_ID_SET.has(id)) {
        if (!matchedBlogs.has(id)) {
          matchedBlogs.set(id, {
            count: 0,
            keyword: blogSearchData.keyword,
            blogName: item?.blogName || '',
            positions: [],
          });
        }
        const current = matchedBlogs.get(id)!;
        current.count++;
        current.positions.push(index + 1);
      }
    });

    return Array.from(matchedBlogs.entries());
  }, [blogSearchData]);

  const hasMatches = matchedBlogArray.length > 0;

  return (
    <section
      aria-labelledby="blog-match-heading"
      className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
    >
      <header className="flex items-center gap-2 flex-wrap">
        <h4
          id="blog-match-heading"
          className="text-base font-semibold text-[var(--color-text-primary)]"
        >
          블로그 검색 매칭
        </h4>
        <span className="px-2 py-0.5 rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-medium">
          "{blogSearchData.keyword}"
        </span>
      </header>

      {hasMatches ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {matchedBlogArray.map(([blogId, info], idx) => (
            <li
              key={`blog-match-${blogId}-${idx}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-success-soft)] text-sm"
            >
              <code className="font-mono font-semibold text-[var(--color-success)]">
                #{blogId}
              </code>
              <span className="text-[var(--color-text-secondary)]">
                {info.count}개
              </span>
              <span className="text-[var(--color-text-tertiary)] text-xs">
                {info.positions.slice(0, 2).join(',')}
                {info.positions.length > 2 ? '...' : ''}위
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-error-soft)] text-sm">
          <span className="text-[var(--color-error)] font-medium">매칭 없음</span>
          <span className="text-[var(--color-text-tertiary)]">
            (총 {blogSearchData.items.length}개 중)
          </span>
        </p>
      )}
    </section>
  );
};

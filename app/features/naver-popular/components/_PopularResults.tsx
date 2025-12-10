import React, { useMemo } from 'react';
import type { PopularItem } from '@/entities/naver/_types';
import { PopularItemCard } from './_PopularItemCard';
import { useAtom } from 'jotai';
import { popularDataAtom } from '@/features/naver-popular/store';
import { useToast } from '@/shared/ui/Toast';
import { copyTitleToClipboard, downloadAllContentToFile } from '@/features/naver-popular/lib';
import { Download, Copy } from 'lucide-react';
import { BLOG_ID_SET } from '@/constants';
import { extractBlogIdFromUrl } from '@/shared/utils/_blog';

interface PopularItemWithMatch extends PopularItem {
  blogId?: string;
  isMatched: boolean;
}

const DEFAULT_GROUP = '비즈니스·경제 인기글';

export const PopularResults: React.FC = () => {
  const [data] = useAtom(popularDataAtom);
  const itemList = data?.items || [];
  const { show } = useToast();

  const { grouped, totalMatchedCount } = useMemo(() => {
    const map: Record<string, PopularItemWithMatch[]> = {};
    let totalMatchedCount = 0;

    for (const it of itemList || []) {
      const g = it.group || DEFAULT_GROUP;
      if (!map[g]) map[g] = [];

      let blogId = '';
      let isMatched = false;

      if (it.blogLink) {
        blogId = extractBlogIdFromUrl(it.blogLink);
        isMatched = Boolean(blogId && BLOG_ID_SET.has(blogId));
      }

      if (isMatched) {
        totalMatchedCount++;
      }

      const itemWithMatchInfo = {
        ...it,
        blogId: blogId || undefined,
        isMatched,
      };

      map[g].push(itemWithMatchInfo);
    }

    return {
      grouped: Object.entries(map),
      totalMatchedCount,
    };
  }, [itemList]);

  if (!itemList?.length) return null;

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <section>
        <header className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                인기글 추출 결과
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                  {data?.count || itemList.length}개 발견
                </span>
                {totalMatchedCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-success)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                    ✓ 매칭 {totalMatchedCount}개
                  </span>
                )}
              </div>
            </div>

            {itemList.length > 0 && (
              <button
                onClick={() =>
                  downloadAllContentToFile(itemList, (m, o) => show(m, o))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-all"
              >
                <Download size={14} />
                <span className="hidden sm:inline">전체 다운로드</span>
                <span className="sm:hidden">전체</span>
                <span className="text-[var(--color-text-tertiary)]">
                  ({itemList.length})
                </span>
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {grouped.map(([group, list]) => (
            <div key={group}>
              <header className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {group}
                    </h3>
                    <button
                      type="button"
                      aria-label="그룹 제목 복사"
                      onClick={() => copyTitleToClipboard(group, (m, o) => show(m, o))}
                      className="p-1 rounded hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                    {list.length}개
                  </span>
                </div>

                <button
                  onClick={() =>
                    downloadAllContentToFile(list, (m, o) => show(m, o))
                  }
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-all"
                >
                  <Download size={12} />
                  <span>저장</span>
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {list
                  .filter((item) => {
                    const link = item.blogLink || item.link || '';
                    return !link.includes('cafe.naver.com');
                  })
                  .map((item, idx) => (
                    <PopularItemCard
                      key={`${group}-${idx}`}
                      item={item}
                      position={idx + 1}
                      isMatched={item.isMatched}
                      blogId={item.blogId}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

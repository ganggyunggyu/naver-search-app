import React, { useMemo } from 'react';
import type { PopularItem } from '@/entities/naver/_types';
import { PopularItemCard } from './_PopularItemCard';
import { useAtom } from 'jotai';
import { popularDataAtom } from '@/features/naver-popular/store';
import { useToast } from '@/shared/ui/Toast';
import { copyTitleToClipboard, downloadAllContentToFile } from '@/features/naver-popular/lib';
import { Download, Copy } from 'lucide-react';
import { cn } from '@/shared';
import { BLOG_IDS } from '@/constants';

const DEFAULT_GROUP = '비즈니스·경제 인기글';

export const PopularResults: React.FC = () => {
  const [data] = useAtom(popularDataAtom);
  const itemList = data?.items || [];
  const { show } = useToast();

  // 블로그 ID 추출 함수 (BlogResultList와 동일)
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

  const { grouped, totalMatchedCount } = useMemo(() => {
    const map: Record<string, PopularItem[]> = {};
    const allowedIds = new Set(BLOG_IDS.map((v) => v.toLowerCase()));
    let totalMatchedCount = 0;

    for (const it of itemList || []) {
      const g = it.group || DEFAULT_GROUP;
      if (!map[g]) map[g] = [];

      // blogLink에서 블로그 ID 추출
      let blogId = '';
      let isMatched = false;

      if (it.blogLink) {
        blogId = getBlogId(it.blogLink);
        isMatched = Boolean(blogId && allowedIds.has(blogId));
      }

      // 매칭된 항목 카운트
      if (isMatched) {
        totalMatchedCount++;
      }

      // 아이템에 매칭 정보 추가
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
    <React.Fragment>
      <div className={cn('space-y-6')}>
        {/* 전체 다운로드 버튼을 위한 별도 섹션 */}
        <section
          className={cn(
            'rounded-2xl border p-6',
            'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
            'shadow-sm hover:shadow-md transition-shadow duration-200'
          )}
        >
          {/* 전체 헤더 - BlogResultList와 동일한 구조 */}
          <div className={cn('mb-4')}>
            <div
              className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between gap-3'
              )}
            >
              <div
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center gap-3'
                )}
              >
                <h2
                  className={cn(
                    'text-lg sm:text-xl font-bold text-black dark:text-white'
                  )}
                >
                  인기글 추출 결과
                </h2>
                <div className={cn('flex items-center gap-2 flex-wrap')}>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full w-fit',
                      'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full bg-blue-500 animate-pulse'
                      )}
                    />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {data?.count || itemList.length}개 발견
                    </span>
                  </div>
                  {totalMatchedCount > 0 && (
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full w-fit',
                        'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
                        'border border-green-200 dark:border-green-800'
                      )}
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full bg-green-500 animate-bounce'
                        )}
                      />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        ✓ 매칭 {totalMatchedCount}개
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 전체 다운로드 버튼 */}
              {itemList.length > 0 && (
                <button
                  onClick={() =>
                    downloadAllContentToFile(itemList, (m, o) => show(m, o))
                  }
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
                  <span className="hidden sm:inline">전체 다운로드</span>
                  <span className="sm:hidden">전체</span>
                  <span className="text-xs opacity-70">
                    ({itemList.length})
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 각 그룹별 섹션을 카드가 아닌 div로 변경 */}
          <div className="space-y-8">
            {grouped.map(([group, list]) => (
              <div key={group} className={cn('space-y-3')}>
                {/* 그룹 헤더 - 더 간소화 */}
                <div
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-900'
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center gap-2'
                    )}
                  >
                    <div className={cn('flex items-center gap-2')}>
                      <h3
                        className={cn(
                          'flex-1 text-base font-bold text-black dark:text-white'
                        )}
                      >
                        {group}
                      </h3>
                      <button
                        type="button"
                        aria-label="그룹 제목 복사"
                        onClick={() => copyTitleToClipboard(group, (m, o) => show(m, o))}
                        className={cn(
                          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-all',
                          'border-gray-200 bg-white text-gray-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600',
                          'shadow-sm dark:border-gray-700 dark:bg-black dark:text-gray-400 dark:hover:border-blue-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-400'
                        )}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-2 px-2 py-1 rounded-full w-fit text-xs',
                        'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
                        'border border-green-200 dark:border-green-800'
                      )}
                    >
                      <div
                        className={cn('w-1.5 h-1.5 rounded-full bg-green-500')}
                      />
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        {list.length}개
                      </span>
                    </div>
                  </div>

                  {/* 그룹별 다운로드 버튼 - 더 작게 */}
                  <button
                    onClick={() =>
                      downloadAllContentToFile(list, (m, o) => show(m, o))
                    }
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium',
                      'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400',
                      'hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800',
                      'transition-all duration-200 active:scale-95 w-fit'
                    )}
                  >
                    <Download size={12} />
                    <span>저장</span>
                  </button>
                </div>

                {/* 아이템 리스트 */}
                <div className="space-y-3">
                  {list
                    .filter((item: any) => {
                      const link = item.blogLink || item.link || '';
                      return !link.includes('cafe.naver.com');
                    })
                    .map((item: any, idx) => {
                      return (
                        <PopularItemCard
                          key={`${group}-${idx}`}
                          item={item}
                          position={idx + 1}
                          isMatched={item.isMatched || false}
                          blogId={item.blogId}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </React.Fragment>
  );
};

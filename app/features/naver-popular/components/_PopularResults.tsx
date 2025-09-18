import React, { useMemo } from 'react';
import type { PopularItem } from '@/entities/naver/_types';
import { PopularItemCard } from './_PopularItemCard';
import { useAtom } from 'jotai';
import { popularDataAtom } from '@/features/naver-popular/store';
import { useToast } from '@/shared/ui/Toast';
import { downloadAllContentToFile } from '@/features/naver-popular/lib';
import { Download } from 'lucide-react';
import { cn, Chip, Button } from '@/shared';

const DEFAULT_GROUP = '비즈니스·경제 인기글';

export const PopularResults: React.FC = () => {
  const [data] = useAtom(popularDataAtom);
  const itemList = data?.items || [];
  const { show } = useToast();

  const grouped = useMemo(() => {
    const map: Record<string, PopularItem[]> = {};
    for (const it of itemList || []) {
      const g = it.group || DEFAULT_GROUP;
      if (!map[g]) map[g] = [];
      map[g].push(it);
    }
    return Object.entries(map);
  }, [itemList]);

  if (!itemList?.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border mb-12',
        'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
        'shadow-sm hover:shadow-md transition-shadow duration-200'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-900'
        )}
      >
        <h2
          className={cn(
            'text-2xl font-bold text-black dark:text-white flex items-center gap-4'
          )}
        >
          인기글 추출 결과
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full bg-green-500')} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {data?.count || itemList.length}개 추출
            </span>
          </div>
        </h2>
        {itemList.length > 0 && (
          <div className={cn('flex justify-center mb-8')}>
            <button
              onClick={() =>
                downloadAllContentToFile(itemList, (m, o) => show(m, o))
              }
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
                'hover:bg-gray-200 dark:hover:bg-gray-800',
                'border border-gray-200 dark:border-gray-800',
                'transition-colors duration-200'
              )}
            >
              <Download size={14} />
              <span className="hidden sm:inline">전체 다운로드</span>
              <span className="sm:hidden">다운로드</span>
              <span className="text-xs">({itemList.length}개)</span>
            </button>
          </div>
        )}
      </div>
      <div className={cn('p-6')}>
        <div className="space-y-8">
          {/* 전체 다운로드 버튼 */}

          {grouped.map(([group, list]) => (
            <section
              key={group}
              className={cn(
                'border rounded-2xl p-6',
                'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
                'shadow-sm hover:shadow-md transition-shadow duration-200'
              )}
            >
              {/* 헤더 */}
              <div
                className={cn(
                  'flex items-center justify-between mb-6 pb-4',
                  'border-b border-gray-100 dark:border-gray-900'
                )}
              >
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">
                    {group}
                  </h3>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full',
                      'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full bg-green-500')} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {list.length}개 발견
                    </span>
                  </div>
                </div>

                {/* 섹션별 다운로드 버튼 */}
                <button
                  onClick={() =>
                    downloadAllContentToFile(list, (m, o) => show(m, o))
                  }
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                    'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
                    'hover:bg-gray-200 dark:hover:bg-gray-800',
                    'border border-gray-200 dark:border-gray-800',
                    'transition-colors duration-200'
                  )}
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">다운로드</span>
                  <span className="sm:hidden">저장</span>
                  <span className="text-xs">({list.length}개)</span>
                </button>
              </div>

              {/* 아이템 리스트 */}
              <div className="space-y-3">
                {list.map((item, idx) => (
                  <PopularItemCard key={`${group}-${idx}`} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import type { PopularItem } from '@/entities/naver/types';
import { PopularItemCard } from '@/components/naverPopular/PopularItemCard';
import { useAtom } from 'jotai';
import { popularDataAtom } from '@/features/naver-popular/store';

const DEFAULT_GROUP = '비즈니스·경제 인기글';

export const PopularResults: React.FC = () => {
  const [data] = useAtom(popularDataAtom);
  const itemList = data?.items || [];
  const grouped = useMemo(() => {
    const map: Record<string, PopularItem[]> = {};
    for (const it of itemList || []) {
      const g = it.group || DEFAULT_GROUP;
      if (!map[g]) map[g] = [];
      map[g].push(it);
    }
    return Object.entries(map);
  }, [itemList]);

  if (!itemList?.length)
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          인기글을 찾지 못했습니다
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          다른 키워드로 검색해보세요
        </p>
      </div>
    );

  return (
    <div className="space-y-8">
      {grouped.map(([group, list]) => (
        <section
          key={group}
          className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              {group}
              <span className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full border border-green-200 dark:border-green-800">
                {list.length}개 발견
              </span>
            </h3>
          </div>
          <div className="space-y-4">
            {list.map((item, idx) => (
              <PopularItemCard key={`${group}-${idx}`} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

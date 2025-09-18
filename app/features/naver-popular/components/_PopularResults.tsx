import React, { useMemo } from 'react';
import type { PopularItem } from '@/entities/naver/_types';
import { PopularItemCard } from './PopularItemCard';
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
      {/* 전체 다운로드 버튼 */}
      {itemList.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => downloadAllContentToFile(itemList, (m, o) => show(m, o))}
            className={cn(
              "flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3",
              "text-base sm:text-lg font-semibold",
              "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
              "text-white rounded-2xl shadow-lg hover:shadow-xl",
              "transition-all duration-200 hover:scale-105 active:scale-95"
            )}
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">전체 인기글 다운로드</span>
            <span className="sm:hidden">전체 다운로드</span>
            <Chip variant="primary" size="sm" className="bg-white/20 text-white border-white/30">
              {itemList.length}개
            </Chip>
          </button>
        </div>
      )}

      {grouped.map(([group, list]) => (
        <section
          key={group}
          className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {group}
              </h3>
              <span className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full border border-green-200 dark:border-green-800">
                {list.length}개 발견
              </span>
            </div>
            {/* 섹션별 다운로드 버튼 */}
            <button
              onClick={() => downloadAllContentToFile(list, (m, o) => show(m, o))}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-700 transition-all hover:shadow-sm hover:scale-110 cursor-pointer active:scale-105"
            >
              <Download size={16} />
              이 섹션 다운로드 ({list.length}개)
            </button>
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

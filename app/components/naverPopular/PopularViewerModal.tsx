import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { popularQueryAtom } from '@/features/naver-popular/store';
import type { PopularItem } from '@/entities/naver/types';
import { analyzeManuscript } from '@/shared';

export interface PopularViewerItem extends PopularItem {
  content?: string;
  blogName?: string;
  actualUrl?: string;
}

interface Props {
  open: boolean;
  loading: boolean;
  item: PopularViewerItem | null;
  onClose: () => void;
}


export const PopularViewerModal: React.FC<Props> = ({ open, loading, item, onClose }) => {
  const [query] = useAtom(popularQueryAtom);
  const content = item?.content || '';
  // hooks must be called unconditionally
  const analysis = useMemo(() => analyzeManuscript(content, query), [content, query]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h[85vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="min-w-0">
            <div className="text-sm text-gray-500 truncate">{item?.blogName ? item.blogName : '네이버 블로그'}</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{item?.title || '제목 없음'}</div>
          </div>
          <div className="flex items-center gap-2">
            {item?.link && (
              <a href={item.link} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white">원문</a>
            )}
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">닫기</button>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
          <div className="md:col-span-1">
            {item?.image ? (
              <img src={item.image} alt="대표 이미지" className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-800" />
            ) : (
              <div className="w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">이미지 없음</div>
            )}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 break-all">{item?.link}</div>
          </div>
          <div className="md:col-span-2">
            <div className="mb-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">원고 분석</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                <span>문자수: <strong>{analysis.charCount}</strong></span>
                <span>공백제외: <strong>{analysis.charCountNoSpace}</strong></span>
                <span>단어수: <strong>{analysis.wordCount}</strong></span>
                <span>예상 읽기: <strong>{analysis.readingTimeMin}분</strong></span>
              </div>
              {analysis.topKeywords.length > 0 && (
                <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                  키워드: {analysis.topKeywords.map((k) => (
                    <span key={k.word} className="inline-block mr-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">#{k.word} <span className="opacity-70">x{k.count}</span></span>
                  ))}
                </div>
              )}
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-gray-500">불러오는 중...</div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-6">{item?.content || '본문이 비어있습니다.'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

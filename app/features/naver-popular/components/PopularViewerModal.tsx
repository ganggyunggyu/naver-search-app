import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { X, ExternalLink, Copy, FileText, BarChart3 } from 'lucide-react';
import { popularQueryAtom } from '@/features/naver-popular/store';
import type { PopularItem } from '@/entities/naver/_types';
import { analyzeManuscript, formatManuscriptAnalysis, cn, Button } from '@/shared';
import { useToast } from '@/shared/ui/Toast';
import {
  copyPreviewToClipboard,
  copyFullContentToClipboard,
} from '@/features/naver-popular/lib';

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

export const PopularViewerModal: React.FC<Props> = ({
  open,
  loading,
  item,
  onClose,
}) => {
  const [query] = useAtom(popularQueryAtom);
  const { show } = useToast();
  const content = item?.content || '';
  // hooks must be called unconditionally
  const analysis = useMemo(
    () => analyzeManuscript(content, query),
    [content, query]
  );
  const copyAnalysis = async () => {
    if (!item) return;
    try {
      const text = formatManuscriptAnalysis(analysis, {
        title: item.title,
        url: item.link,
      });
      await navigator.clipboard.writeText(text);
      show('분석 결과가 복사되었습니다!', { type: 'success' });
    } catch {
      show('복사 실패', { type: 'error' });
    }
  };
  if (!open) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm",
        "flex items-center justify-center p-3 sm:p-4"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-xs sm:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[85vh]",
          "overflow-hidden rounded-2xl bg-white dark:bg-gray-950",
          "border border-gray-200 dark:border-gray-800 shadow-xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(
          "flex items-center justify-between p-3 sm:p-4",
          "border-b border-gray-200 dark:border-gray-800"
        )}>
          <div className={cn("min-w-0 flex-1 mr-3")}>
            <div className={cn("text-xs sm:text-sm text-gray-500 truncate")}>
              {item?.blogName ? item.blogName : '네이버 블로그'}
            </div>
            <div className={cn(
              "text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
            )}>
              {item?.title || '제목 없음'}
            </div>
          </div>
          <div className={cn("flex items-center gap-1 sm:gap-2 flex-shrink-0")}>
            {item?.link && (
              <Button
                variant="primary"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
                className="hidden sm:inline-flex"
              >
                원문
              </Button>
            )}
            {item?.link && (
              <Button
                variant="primary"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
                className="sm:hidden"
              />
            )}
            {item && (
              <>
                {item.link && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={<FileText size={14} />}
                    onClick={() => copyFullContentToClipboard(item.link!, show)}
                    className="hidden sm:inline-flex"
                  >
                    전체 복사
                  </Button>
                )}
                {item.link && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={<FileText size={14} />}
                    onClick={() => copyFullContentToClipboard(item.link!, show)}
                    className="sm:hidden"
                  />
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<BarChart3 size={14} />}
                  onClick={copyAnalysis}
                  className="hidden sm:inline-flex"
                >
                  분석 복사
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<BarChart3 size={14} />}
                  onClick={copyAnalysis}
                  className="sm:hidden"
                />
              </>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<X size={14} />}
              onClick={onClose}
              className="hidden sm:inline-flex"
            >
              닫기
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<X size={14} />}
              onClick={onClose}
              className="sm:hidden"
            />
          </div>
        </div>
        <div
          className={cn(
            "p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto"
          )}
          style={{ maxHeight: 'calc(85vh - 64px)' }}
        >
          <div className={cn("lg:col-span-1")}>
            {item?.image ? (
              <img
                src={item.image}
                alt="대표 이미지"
                className={cn(
                  "w-full h-32 sm:h-48 object-cover rounded-lg",
                  "border border-gray-200 dark:border-gray-800"
                )}
              />
            ) : (
              <div className={cn(
                "w-full h-32 sm:h-48 rounded-lg bg-gray-100 dark:bg-gray-800",
                "flex items-center justify-center text-gray-400 text-xs sm:text-sm"
              )}>
                이미지 없음
              </div>
            )}
            <div className={cn(
              "mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all"
            )}>
              {item?.link}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="mb-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                원고 분석
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  문자수: <strong>{analysis.charCount}</strong>
                </span>
                <span>
                  공백제외: <strong>{analysis.charCountNoSpace}</strong>
                </span>
                <span>
                  단어수: <strong>{analysis.wordCount}</strong>
                </span>
                <span>
                  예상 읽기: <strong>{analysis.readingTimeMin}분</strong>
                </span>
              </div>
              {analysis.topKeywords.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                    키워드 ({analysis.topKeywords.length}개):
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs text-gray-700 dark:text-gray-300">
                    {analysis.topKeywords.map((k) => (
                      <span
                        key={k.word}
                        className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      >
                        #{k.word} <span className="opacity-70">x{k.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-gray-500">
                불러오는 중...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-6">
                {item?.content || '본문이 비어있습니다.'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

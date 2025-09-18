import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { X, ExternalLink, Copy, FileText, BarChart3 } from 'lucide-react';
import { popularQueryAtom } from '@/features/naver-popular/store';
import type { PopularItem } from '@/entities/naver/_types';
import { analyzeManuscript, formatManuscriptAnalysis, cn } from '@/shared';
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
        "fixed inset-0 z-[60] bg-black/50 backdrop-blur-md",
        "flex items-center justify-center p-4 sm:p-6"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[90vh] sm:max-h-[85vh]",
          "overflow-hidden rounded-2xl bg-white dark:bg-black",
          "border border-gray-200 dark:border-gray-800 shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(
          "flex items-center justify-between p-4 sm:p-6",
          "border-b border-gray-100 dark:border-gray-900",
          "bg-gray-50 dark:bg-gray-950"
        )}>
          <div className={cn("min-w-0 flex-1 mr-4")}>
            <div className={cn("text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mb-1")}>
              {item?.blogName ? item.blogName : '네이버 블로그'}
            </div>
            <h2 className={cn(
              "text-sm sm:text-xl font-bold text-black dark:text-white truncate"
            )}>
              {item?.title || '제목 없음'}
            </h2>
          </div>
          <div className={cn("flex items-center gap-2 flex-shrink-0")}>
            {item?.link && (
              <button
                onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "bg-black dark:bg-white text-white dark:text-black",
                  "hover:bg-gray-800 dark:hover:bg-gray-200",
                  "hidden sm:flex"
                )}
              >
                <ExternalLink size={14} />
                원문
              </button>
            )}
            {item?.link && (
              <button
                onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                  "bg-black dark:bg-white text-white dark:text-black",
                  "hover:bg-gray-800 dark:hover:bg-gray-200",
                  "sm:hidden"
                )}
              >
                <ExternalLink size={14} />
              </button>
            )}
            {item?.link && (
              <>
                <button
                  onClick={() => copyFullContentToClipboard(item.link!, show)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-200 dark:hover:bg-gray-800",
                    "border border-gray-200 dark:border-gray-800",
                    "hidden sm:flex"
                  )}
                >
                  <FileText size={14} />
                  복사
                </button>
                <button
                  onClick={() => copyFullContentToClipboard(item.link!, show)}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                    "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-200 dark:hover:bg-gray-800",
                    "border border-gray-200 dark:border-gray-800",
                    "sm:hidden"
                  )}
                >
                  <FileText size={14} />
                </button>
                <button
                  onClick={copyAnalysis}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-200 dark:hover:bg-gray-800",
                    "border border-gray-200 dark:border-gray-800",
                    "hidden sm:flex"
                  )}
                >
                  <BarChart3 size={14} />
                  분석
                </button>
                <button
                  onClick={copyAnalysis}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                    "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-200 dark:hover:bg-gray-800",
                    "border border-gray-200 dark:border-gray-800",
                    "sm:hidden"
                  )}
                >
                  <BarChart3 size={14} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300",
                "hover:bg-gray-200 dark:hover:bg-gray-800",
                "border border-gray-200 dark:border-gray-800",
                "hidden sm:flex"
              )}
            >
              <X size={14} />
              닫기
            </button>
            <button
              onClick={onClose}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300",
                "hover:bg-gray-200 dark:hover:bg-gray-800",
                "border border-gray-200 dark:border-gray-800",
                "sm:hidden"
              )}
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div
          className={cn(
            "p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto"
          )}
          style={{ maxHeight: 'calc(85vh - 80px)' }}
        >
          <div className={cn("lg:col-span-1")}>
            {item?.image ? (
              <img
                src={item.image}
                alt="대표 이미지"
                className={cn(
                  "w-full h-40 sm:h-52 object-cover rounded-xl",
                  "border border-gray-200 dark:border-gray-800"
                )}
              />
            ) : (
              <div className={cn(
                "w-full h-40 sm:h-52 rounded-xl bg-gray-50 dark:bg-gray-950",
                "flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 text-sm",
                "border border-gray-100 dark:border-gray-900"
              )}>
                <FileText size={24} className="mb-2" />
                <span>이미지 없음</span>
              </div>
            )}
            <div className={cn(
              "mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900"
            )}>
              <div className={cn("text-xs font-medium text-gray-600 dark:text-gray-400 mb-1")}>
                URL
              </div>
              <div className={cn(
                "text-xs text-gray-500 dark:text-gray-500 break-all font-mono"
              )}>
                {item?.link}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className={cn(
              "mb-4 p-4 rounded-xl border border-gray-100 dark:border-gray-900",
              "bg-gray-50 dark:bg-gray-950"
            )}>
              <div className={cn("flex items-center gap-3 mb-3")}>
                <div className={cn("w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center")}>
                  <BarChart3 size={16} className="text-white dark:text-black" />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  문서 분석
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className={cn("text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-900")}>
                  <div className="text-lg font-bold text-black dark:text-white">{analysis.charCount}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">문자수</div>
                </div>
                <div className={cn("text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-900")}>
                  <div className="text-lg font-bold text-black dark:text-white">{analysis.charCountNoSpace}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">공백제외</div>
                </div>
                <div className={cn("text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-900")}>
                  <div className="text-lg font-bold text-black dark:text-white">{analysis.wordCount}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">단어수</div>
                </div>
                <div className={cn("text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-900")}>
                  <div className="text-lg font-bold text-black dark:text-white">{analysis.readingTimeMin}<span className="text-sm">분</span></div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">예상시간</div>
                </div>
              </div>

              {analysis.topKeywords.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    주요 키워드 ({analysis.topKeywords.length}개)
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {analysis.topKeywords.map((k) => (
                      <span
                        key={k.word}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                          "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
                          "border border-gray-200 dark:border-gray-800"
                        )}
                      >
                        {k.word}
                        <span className="opacity-70 text-xs">{k.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={cn(
              "rounded-xl border border-gray-100 dark:border-gray-900",
              "bg-white dark:bg-black p-4"
            )}>
              <div className={cn("flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-900")}>
                <FileText size={16} className="text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-black dark:text-white">본문 내용</h4>
              </div>
              {loading ? (
                <div className={cn(
                  "h-48 flex items-center justify-center",
                  "bg-gray-50 dark:bg-gray-950 rounded-lg"
                )}>
                  <div className="text-center">
                    <div className={cn("w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2")} />
                    <div className="text-sm text-gray-500 dark:text-gray-400">불러오는 중...</div>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "max-h-96 overflow-y-auto p-4 rounded-lg",
                  "bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900"
                )}>
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-relaxed font-sans">
                    {item?.content || '본문이 비어있습니다.'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
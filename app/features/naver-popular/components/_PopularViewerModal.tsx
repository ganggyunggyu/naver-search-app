import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { X, ExternalLink, FileText, BarChart3 } from 'lucide-react';
import { popularQueryAtom } from '@/features/naver-popular/store';
import type { PopularItem } from '@/entities/naver/_types';
import { analyzeManuscript, formatManuscriptAnalysis } from '@/shared';
import { useToast } from '@/shared/ui/Toast';
import { copyFullContentToClipboard } from '@/features/naver-popular/lib';

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
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div>
          <div>
            <div>{item?.blogName ? item.blogName : '네이버 블로그'}</div>
            <h2>{item?.title || '제목 없음'}</h2>
          </div>
          <div>
            {item?.link && (
              <button
                onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink size={14} />
                원문
              </button>
            )}
            {item?.link && (
              <button
                onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink size={14} />
              </button>
            )}
            {item?.link && (
              <>
                <button onClick={() => copyFullContentToClipboard(item.link!, show)}>
                  <FileText size={14} />
                  복사
                </button>
                <button onClick={() => copyFullContentToClipboard(item.link!, show)}>
                  <FileText size={14} />
                </button>
                <button onClick={copyAnalysis}>
                  <BarChart3 size={14} />
                  분석
                </button>
                <button onClick={copyAnalysis}>
                  <BarChart3 size={14} />
                </button>
              </>
            )}
            <button onClick={onClose}>
              <X size={14} />
              닫기
            </button>
            <button onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div style={{ maxHeight: 'calc(85vh - 80px)' }}>
          <div>
            {item?.image ? (
              <img src={item.image} alt="대표 이미지" />
            ) : (
              <div>
                <FileText size={24} />
                <span>이미지 없음</span>
              </div>
            )}
            <div>
              <div>URL</div>
              <div>{item?.link}</div>
            </div>
          </div>

          <div>
            <div>
              <div>
                <div>
                  <BarChart3 size={16} />
                </div>
                <h3>문서 분석</h3>
              </div>

              <div>
                <div>
                  <div>{analysis.charCount}</div>
                  <div>문자수</div>
                </div>
                <div>
                  <div>{analysis.charCountNoSpace}</div>
                  <div>공백제외</div>
                </div>
                <div>
                  <div>{analysis.wordCount}</div>
                  <div>단어수</div>
                </div>
                <div>
                  <div>{analysis.readingTimeMin}<span>분</span></div>
                  <div>예상시간</div>
                </div>
              </div>

              {analysis.topKeywords.length > 0 && (
                <div>
                  <div>
                    <div>
                      <span>#</span>
                    </div>
                    <h4>주요 키워드 분석</h4>
                    <div>{analysis.topKeywords.length}개 발견</div>
                  </div>
                  <div>
                    {analysis.topKeywords.map((k, index) => (
                      <span key={k.word}>
                        <span>{k.word}</span>
                        <span>{k.count}</span>
                      </span>
                    ))}
                  </div>
                  <div>
                    <div />
                    <span>상위 5개 키워드는 특별히 강조됩니다</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div>
                <FileText size={16} />
                <h4>본문 내용</h4>
              </div>
              {loading ? (
                <div>
                  <div>
                    <div />
                    <div>불러오는 중...</div>
                  </div>
                </div>
              ) : (
                <div>
                  <pre>{item?.content || '본문이 비어있습니다.'}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

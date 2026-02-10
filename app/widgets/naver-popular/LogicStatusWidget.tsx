import React from 'react';
import { Chip, cn } from '@/shared';
import type { LogicCheckResult } from '@/entities/naver/types';

interface LogicStatusWidgetProps {
  data: LogicCheckResult | null;
  isLoading: boolean;
  errorMessage?: string;
}

const EMPTY_MESSAGE = '검색어 입력 후 로직을 확인할 수 있습니다.';
const FALLBACK_ERROR_MESSAGE = '로직 확인 중 오류가 발생했습니다.';

const LOGIC_STATUS = {
  newLogic: {
    label: '신로직',
    className: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
    dotClassName: 'bg-[var(--color-success)]',
  },
  oldLogic: {
    label: '구로직',
    className: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
    dotClassName: 'bg-[var(--color-warning)]',
  },
};

export const LogicStatusWidget: React.FC<LogicStatusWidgetProps> = ({
  data,
  isLoading,
  errorMessage,
}) => {
  const topicNameList = data?.topicNames ?? [];
  const logicStatus = data?.isNewLogic
    ? LOGIC_STATUS.newLogic
    : LOGIC_STATUS.oldLogic;

  return (
    <section
      aria-labelledby="logic-status-heading"
      className={cn(
        'p-4 sm:p-5 rounded-xl bg-[var(--color-surface)] shadow-[var(--shadow-card)]'
      )}
    >
      <header className={cn('flex items-center justify-between gap-3 flex-wrap')}>
        <div className={cn('flex items-center gap-2 flex-wrap')}>
          <h3
            id="logic-status-heading"
            className={cn('text-base font-semibold text-[var(--color-text-primary)]')}
          >
            로직 판별
          </h3>
          {data && (
            <Chip variant="primary" size="sm">
              {data.keyword}
            </Chip>
          )}
        </div>
        {data && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              logicStatus.className
            )}
          >
            <span
              className={cn('w-1.5 h-1.5 rounded-full', logicStatus.dotClassName)}
            />
            {logicStatus.label}
          </span>
        )}
      </header>

      {isLoading && (
        <p className={cn('mt-3 text-sm text-[var(--color-text-secondary)]')}>
          로직 확인 중입니다.
        </p>
      )}

      {!isLoading && errorMessage && (
        <p className={cn('mt-3 text-sm text-[var(--color-error)]')}>
          {errorMessage || FALLBACK_ERROR_MESSAGE}
        </p>
      )}

      {!isLoading && !errorMessage && data && (
        <div className={cn('mt-3')}>
          <div className={cn('flex flex-wrap gap-2')}>
            <div
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] text-sm'
              )}
            >
              <span className={cn('text-[var(--color-text-secondary)]')}>
                아이템
              </span>
              <span className={cn('font-semibold text-[var(--color-text-primary)]')}>
                {data.itemCount}개
              </span>
            </div>
          </div>

          <div className={cn('mt-4')}>
            <p className={cn('text-xs text-[var(--color-text-tertiary)]')}>
              인기 주제
            </p>
            {topicNameList.length > 0 ? (
              <div className={cn('mt-2 flex flex-wrap gap-2')}>
                {topicNameList.map((topicName) => (
                  <Chip
                    key={topicName}
                    variant={data.isNewLogic ? 'primary' : 'warning'}
                    size="sm"
                  >
                    {topicName}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className={cn('mt-2 text-sm text-[var(--color-text-tertiary)]')}>
                주제를 찾지 못했습니다.
              </p>
            )}
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && !data && (
        <p className={cn('mt-3 text-sm text-[var(--color-text-tertiary)]')}>
          {EMPTY_MESSAGE}
        </p>
      )}
    </section>
  );
};

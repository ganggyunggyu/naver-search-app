import { cn } from '@/shared';
import { DarkModeToggle } from '@/shared/ui/DarkModeToggle';

export const MainHeader = () => {
  return (
    <div className={cn('relative text-center mb-16 sm:mb-20')}>
      {/* 다크모드 토글 - 우상단 고정 */}
      <div className={cn('absolute top-0 right-0')}>
        <DarkModeToggle />
      </div>
      <div className={cn('relative inline-block')}>
        <h1
          className={cn(
            'text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight',
            'text-black dark:text-white',
            'relative z-10'
          )}
        >
          NAVER
          <span
            className={cn(
              'block text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide mt-1',
              'text-gray-600 dark:text-gray-400'
            )}
          >
            SEARCH ENGINE
          </span>
        </h1>

        {/* 서브틀한 백그라운드 엘리먼트 */}
        <div
          className={cn(
            'absolute -inset-4 bg-gray-50 dark:bg-gray-950/50 rounded-2xl -z-10',
            'border border-gray-100 dark:border-gray-900'
          )}
        />
      </div>

      <p
        className={cn(
          'mt-8 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed',
          'text-gray-700 dark:text-gray-300'
        )}
      >
        네이버 검색 결과에서 인기 키워드별 블로그 글을 추출하고 분석합니다
      </p>

      {/* 스테이터스 인디케이터 */}
      <div
        className={cn(
          'mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full',
          'bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
        )}
      >
        <div
          className={cn('w-2 h-2 rounded-full bg-green-500 animate-pulse')}
        />
        <span
          className={cn('text-sm font-medium text-gray-700 dark:text-gray-300')}
        >
          SYSTEM ACTIVE
        </span>
      </div>
    </div>
  );
};

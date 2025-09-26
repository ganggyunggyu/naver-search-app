import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  refreshThreshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className
}) => {
  const [isPulling, setIsPulling] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [startY, setStartY] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // 스크롤이 맨 위에 있을 때만 동작
    if (window.scrollY > 0 || document.documentElement.scrollTop > 0) return;

    if (e.touches.length === 1) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || startY === 0) return;
    if (window.scrollY > 0 || document.documentElement.scrollTop > 0) return;

    if (e.touches.length === 1) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        e.preventDefault();
        const distance = Math.min(deltaY * 0.5, refreshThreshold * 1.5);
        setPullDistance(distance);
        setIsPulling(distance > 20);

        // 햅틱 피드백 (임계점 도달 시)
        if (distance > refreshThreshold && !isPulling) {
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > refreshThreshold && onRefresh && !isRefreshing) {
      setIsRefreshing(true);

      // 강한 햅틱 피드백
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    setStartY(0);
  };

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);
  const shouldTrigger = pullDistance > refreshThreshold;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh 인디케이터 */}
      {(isPulling || isRefreshing) && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 flex items-center justify-center',
            'bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/50',
            'border-b border-blue-200 dark:border-blue-800',
            'transition-all duration-300 z-10'
          )}
          style={{
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(${isRefreshing ? 0 : -20}px)`
          }}
        >
          <div className={cn(
            'flex flex-col items-center gap-2 py-2',
            'text-blue-600 dark:text-blue-400'
          )}>
            <div
              className={cn(
                'transition-transform duration-300',
                isRefreshing && 'animate-spin'
              )}
              style={{
                transform: `rotate(${isRefreshing ? 0 : refreshProgress * 360}deg)`
              }}
            >
              <RefreshCw
                size={20}
                className={cn(
                  'transition-colors duration-200',
                  shouldTrigger
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-600'
                )}
              />
            </div>

            <div className={cn(
              'text-xs font-medium transition-colors duration-200',
              shouldTrigger
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            )}>
              {isRefreshing
                ? '새로고침 중...'
                : shouldTrigger
                  ? '놓으면 새로고침'
                  : '아래로 당겨서 새로고침'
              }
            </div>

            {/* 진행 바 */}
            <div className={cn(
              'w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'
            )}>
              <div
                className={cn(
                  'h-full bg-blue-500 rounded-full transition-all duration-200',
                  isRefreshing && 'animate-pulse'
                )}
                style={{
                  width: `${isRefreshing ? 100 : refreshProgress * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        className={cn('transition-transform duration-300')}
        style={{
          transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};
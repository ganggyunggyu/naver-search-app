import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  refreshThreshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshThreshold = 80
}) => {
  const [isPulling, setIsPulling] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [startY, setStartY] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
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
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all overflow-hidden"
          style={{
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(${isRefreshing ? 0 : -20}px)`
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={`text-[var(--color-primary)] transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${refreshProgress * 360}deg)`
              }}
            >
              <RefreshCw size={20} />
            </div>

            <span className="text-xs text-[var(--color-text-secondary)]">
              {isRefreshing
                ? '새로고침 중...'
                : shouldTrigger
                  ? '놓으면 새로고침'
                  : '아래로 당겨서 새로고침'
              }
            </span>

            <div className="w-24 h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] transition-all"
                style={{
                  width: `${isRefreshing ? 100 : refreshProgress * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className="transition-transform"
        style={{
          transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

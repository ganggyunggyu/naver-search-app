import React from 'react';
import { cn } from '@/shared';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className,
  swipeThreshold = 100
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [currentX, setCurrentX] = React.useState(0);
  const [translateX, setTranslateX] = React.useState(0);

  const cardRef = React.useRef<HTMLDivElement>(null);

  // 터치 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    setIsPressed(true);
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);

    // 햅틱 피드백
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // 터치 이동
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPressed || e.touches.length !== 1) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;

    setCurrentX(touch.clientX);
    setTranslateX(deltaX);

    if (Math.abs(deltaX) > 10 && !isDragging) {
      setIsDragging(true);
    }
  };

  // 터치 종료
  const handleTouchEnd = () => {
    if (!isPressed) return;

    const deltaX = currentX - startX;
    const absDeltaX = Math.abs(deltaX);

    // 스와이프 감지
    if (absDeltaX > swipeThreshold && isDragging) {
      if (deltaX > 0 && onSwipeRight) {
        // 오른쪽 스와이프
        onSwipeRight();

        // 강한 햅틱 피드백
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      } else if (deltaX < 0 && onSwipeLeft) {
        // 왼쪽 스와이프
        onSwipeLeft();

        // 강한 햅틱 피드백
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      }
    } else if (absDeltaX < 10 && !isDragging && onTap) {
      // 탭 감지
      onTap();

      // 가벼운 햅틱 피드백
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }

    // 상태 초기화
    setIsPressed(false);
    setIsDragging(false);
    setTranslateX(0);
    setStartX(0);
    setCurrentX(0);
  };

  // 마우스 이벤트 (데스크톱 대응)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPressed(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPressed) return;

    const deltaX = e.clientX - startX;
    setCurrentX(e.clientX);
    setTranslateX(deltaX);

    if (Math.abs(deltaX) > 10 && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    if (!isPressed) return;

    const deltaX = currentX - startX;
    const absDeltaX = Math.abs(deltaX);

    if (absDeltaX > swipeThreshold && isDragging) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absDeltaX < 10 && !isDragging && onTap) {
      onTap();
    }

    setIsPressed(false);
    setIsDragging(false);
    setTranslateX(0);
    setStartX(0);
    setCurrentX(0);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative touch-none select-none transition-all duration-200',
        'cursor-pointer',
        isPressed && 'scale-[0.98]',
        isDragging && 'transition-none',
        className
      )}
      style={{
        transform: `translateX(${translateX * 0.3}px)`, // 부드러운 움직임을 위해 0.3 곱함
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}

      {/* 스와이프 인디케이터 */}
      {isDragging && (
        <React.Fragment>
          {/* 왼쪽 스와이프 인디케이터 */}
          {translateX < -50 && onSwipeLeft && (
            <div className={cn(
              'absolute top-1/2 right-4 transform -translate-y-1/2',
              'w-8 h-8 bg-red-500 rounded-full flex items-center justify-center',
              'text-white text-sm animate-pulse shadow-lg'
            )}>
              ←
            </div>
          )}

          {/* 오른쪽 스와이프 인디케이터 */}
          {translateX > 50 && onSwipeRight && (
            <div className={cn(
              'absolute top-1/2 left-4 transform -translate-y-1/2',
              'w-8 h-8 bg-green-500 rounded-full flex items-center justify-center',
              'text-white text-sm animate-pulse shadow-lg'
            )}>
              →
            </div>
          )}
        </React.Fragment>
      )}

      {/* 스와이프 배경 효과 */}
      {isDragging && (
        <div
          className={cn(
            'absolute inset-0 rounded-2xl transition-opacity duration-200',
            translateX > 50 && onSwipeRight && 'bg-green-500/10',
            translateX < -50 && onSwipeLeft && 'bg-red-500/10'
          )}
          style={{
            opacity: Math.min(Math.abs(translateX) / 100, 0.3)
          }}
        />
      )}
    </div>
  );
};
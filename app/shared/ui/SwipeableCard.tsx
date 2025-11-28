import React from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  swipeThreshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  swipeThreshold = 100
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [currentX, setCurrentX] = React.useState(0);
  const [translateX, setTranslateX] = React.useState(0);

  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    setIsPressed(true);
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);

    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

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

  const handleTouchEnd = () => {
    if (!isPressed) return;

    const deltaX = currentX - startX;
    const absDeltaX = Math.abs(deltaX);

    if (absDeltaX > swipeThreshold && isDragging) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      }
    } else if (absDeltaX < 10 && !isDragging && onTap) {
      onTap();
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }

    setIsPressed(false);
    setIsDragging(false);
    setTranslateX(0);
    setStartX(0);
    setCurrentX(0);
  };

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
      style={{
        transform: `translateX(${translateX * 0.3}px)`
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

      {isDragging && (
        <React.Fragment>
          {translateX < -50 && onSwipeLeft && <div>←</div>}
          {translateX > 50 && onSwipeRight && <div>→</div>}
        </React.Fragment>
      )}

      {isDragging && (
        <div
          style={{
            opacity: Math.min(Math.abs(translateX) / 100, 0.3)
          }}
        />
      )}
    </div>
  );
};
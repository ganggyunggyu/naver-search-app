import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const variantStyles = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700',
  primary: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  secondary: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50',
  success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30',
  warning: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30',
  danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onRemove,
  onClick,
  className,
  disabled = false,
}) => {
  const isClickable = !!(onClick && !disabled);
  const isRemovable = !!(onRemove && !disabled);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const ChipElement = isClickable ? 'button' : 'div';

  return (
    <ChipElement
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        // 기본 스타일
        'inline-flex items-center gap-1.5 rounded-full border transition-all',
        'whitespace-nowrap flex-shrink-0 font-medium',
        // 모바일 반응형
        'text-xs sm:text-sm',
        'px-2 py-1 sm:px-3 sm:py-1.5',
        // 사이즈 및 변형
        sizeStyles[size],
        variantStyles[variant],
        // 인터랙션 스타일
        isClickable && 'cursor-pointer hover:scale-105 active:scale-95',
        isClickable && !disabled && 'hover:shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        !isClickable && !disabled && 'cursor-default',
        className
      )}
      disabled={isClickable ? disabled : undefined}
      type={isClickable ? 'button' : undefined}
    >
      <span className="truncate max-w-32 sm:max-w-40">{children}</span>
      {isRemovable && (
        <button
          onClick={handleRemove}
          className={cn(
            'ml-1 p-0.5 rounded-full transition-colors',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'focus:outline-none focus:ring-1 focus:ring-current'
          )}
          aria-label="제거"
          type="button"
        >
          <X size={12} />
        </button>
      )}
    </ChipElement>
  );
};
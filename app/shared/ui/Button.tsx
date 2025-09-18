import React from 'react';
import { cn } from '@/shared';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  secondary: 'bg-gray-100 dark:bg-gray-900/30 hover:bg-gray-200 dark:hover:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  success: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  warning: 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
  danger: 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  info: 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        // 기본 스타일
        'inline-flex items-center gap-2 font-medium rounded-xl border transition-all',
        'hover:shadow-sm hover:scale-105 cursor-pointer active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        // 모바일 반응형
        'text-xs sm:text-sm',
        'px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2',
        // 사이즈 및 변형
        sizeStyles[size],
        variantStyles[variant],
        disabled && 'hover:scale-100',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
};
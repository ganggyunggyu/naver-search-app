import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  secondary: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] border border-[var(--color-border)]',
  success: 'bg-[var(--color-success)] text-white hover:opacity-90',
  warning: 'bg-[var(--color-warning)] text-white hover:opacity-90',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90',
  info: 'bg-[var(--color-info)] text-white hover:opacity-90',
};

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

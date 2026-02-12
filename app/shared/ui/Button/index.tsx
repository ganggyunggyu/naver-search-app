import React from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

type ButtonSize = 'chip' | 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] hover:shadow-md',
  secondary:
    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] border border-[var(--color-border)] hover:shadow-sm',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]',
  success:
    'bg-[var(--color-success)] text-white hover:opacity-90 hover:shadow-md',
  warning:
    'bg-[var(--color-warning)] text-white hover:opacity-90 hover:shadow-md',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90 hover:shadow-md',
  info: 'bg-[var(--color-info)] text-white hover:opacity-90 hover:shadow-md',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  chip: 'px-3 py-1 text-xs gap-1 rounded-full',
  sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  icon: 'p-1.5 rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isIconOnly = icon && !children;

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium
        cursor-pointer select-none
        transition-all duration-150 ease-out
        hover:scale-[1.02]
        active:scale-[0.96] active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:scale-100 disabled:active:scale-100
        ${VARIANT_STYLES[variant]}
        ${isIconOnly ? SIZE_STYLES.icon : SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};

export type { ButtonProps, ButtonVariant, ButtonSize };

import React from 'react';
import { X } from 'lucide-react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

const VARIANT_STYLES: Record<NonNullable<ChipProps['variant']>, string> = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  secondary: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-error-soft)] text-[var(--color-error)]',
};

const SIZE_STYLES: Record<NonNullable<ChipProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
};

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onRemove,
  onClick,
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

  const baseStyles = `
    inline-flex items-center rounded-full font-medium
    transition-all
    ${isClickable ? 'cursor-pointer hover:opacity-80 active:scale-[0.98]' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${VARIANT_STYLES[variant]}
    ${SIZE_STYLES[size]}
  `;

  const ChipElement = isClickable ? 'button' : 'div';

  return (
    <ChipElement
      onClick={isClickable ? handleClick : undefined}
      disabled={isClickable ? disabled : undefined}
      type={isClickable ? 'button' : undefined}
      className={baseStyles}
    >
      <span>{children}</span>
      {isRemovable && (
        <button
          onClick={handleRemove}
          aria-label="제거"
          type="button"
          className="ml-0.5 p-0.5 rounded-full hover:bg-[var(--color-hover)] transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </ChipElement>
  );
};

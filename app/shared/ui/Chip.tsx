import React from 'react';
import { X } from 'lucide-react';

type ChipVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  onRemove?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

const VARIANT_STYLES: Record<ChipVariant, string> = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  secondary: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-error-soft)] text-[var(--color-error)]',
};

const SIZE_STYLES: Record<ChipSize, string> = {
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
    transition-all duration-150 ease-out select-none
    hover:scale-105 hover:shadow-sm
    active:scale-95 active:shadow-none
    ${isClickable ? 'cursor-pointer' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100' : ''}
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
          className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 active:scale-90 transition-all cursor-pointer"
        >
          <X size={12} />
        </button>
      )}
    </ChipElement>
  );
};

export type { ChipProps, ChipVariant, ChipSize };

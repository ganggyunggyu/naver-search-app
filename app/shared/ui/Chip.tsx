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

  const ChipElement = isClickable ? 'button' : 'div';

  return (
    <ChipElement
      onClick={isClickable ? handleClick : undefined}
      disabled={isClickable ? disabled : undefined}
      type={isClickable ? 'button' : undefined}
    >
      <span>{children}</span>
      {isRemovable && (
        <button onClick={handleRemove} aria-label="제거" type="button">
          <X size={12} />
        </button>
      )}
    </ChipElement>
  );
};
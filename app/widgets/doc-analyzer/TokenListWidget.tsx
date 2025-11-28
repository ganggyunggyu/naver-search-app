import React from 'react';

interface Token {
  word: string;
  count: number;
}

interface TokenListWidgetProps {
  title: string;
  tokens: Token[];
  emptyMessage: string;
  variant?: 'primary' | 'success';
}

export const TokenListWidget: React.FC<TokenListWidgetProps> = ({
  title,
  tokens,
  emptyMessage,
  variant = 'primary',
}) => {
  const variantStyles = {
    primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
    success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  };

  return (
    <section aria-label={title}>
      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h4>
      {tokens.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((token) => (
            <span
              key={token.word}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${variantStyles[variant]}`}
            >
              #{token.word}
              <span className="opacity-70">x{token.count}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-tertiary)]">{emptyMessage}</p>
      )}
    </section>
  );
};

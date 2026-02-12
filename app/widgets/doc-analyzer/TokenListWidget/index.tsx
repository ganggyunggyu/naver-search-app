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
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success-soft text-success',
  };

  return (
    <section aria-label={title}>
      <h4 className="text-sm font-semibold text-text-primary mb-2">
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
        <p className="text-xs text-text-tertiary">{emptyMessage}</p>
      )}
    </section>
  );
};

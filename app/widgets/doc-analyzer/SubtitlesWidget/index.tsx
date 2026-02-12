import React from 'react';
import { Copy, List } from 'lucide-react';

interface SubtitlesWidgetProps {
  subtitles: string[];
  onCopy: () => void;
}

export const SubtitlesWidget: React.FC<SubtitlesWidgetProps> = ({
  subtitles,
  onCopy,
}) => {
  return (
    <section aria-labelledby="subtitles-heading">
      <header className="flex items-center justify-between mb-2">
        <h4
          id="subtitles-heading"
          className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5"
        >
          <List size={14} />
          부제 정리
        </h4>
        {subtitles.length > 0 && (
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-colors"
          >
            <Copy size={12} />
            복사
          </button>
        )}
      </header>
      {subtitles.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {subtitles.map((subtitle, index) => (
            <li
              key={`${subtitle}-${index}`}
              className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <span>{subtitle}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          부제 후보를 찾지 못했습니다.
        </p>
      )}
    </section>
  );
};

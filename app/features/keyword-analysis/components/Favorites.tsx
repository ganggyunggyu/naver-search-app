import React from 'react';
import { Star, X, Clock } from 'lucide-react';
import type { SavedKeyword } from '../types';

interface FavoritesProps {
  favorites: SavedKeyword[];
  visible: boolean;
  onToggleVisible: () => void;
  onSelectKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  visible,
  onToggleVisible,
  onSelectKeyword,
  onRemoveKeyword,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <React.Fragment>
      <button
        type="button"
        onClick={onToggleVisible}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          visible
            ? 'bg-yellow-500/10 text-yellow-600 border-2 border-yellow-500/30'
            : 'bg-[var(--color-hover)] text-[var(--color-text-secondary)] border-2 border-transparent hover:border-[var(--color-border)]'
        }`}
      >
        <Star className={`w-4 h-4 ${visible ? 'fill-yellow-500' : ''}`} />
        즐겨찾기
        {favorites.length > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-xs ${visible ? 'bg-yellow-500/20' : 'bg-[var(--color-border)]'}`}>
            {favorites.length}
          </span>
        )}
      </button>

      {visible && favorites.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            <h3 className="font-semibold text-[var(--color-text-primary)]">저장된 키워드</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {favorites.map((saved, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-yellow-500/50 transition-all"
              >
                <button
                  type="button"
                  onClick={() => onSelectKeyword(saved.keyword)}
                  className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                >
                  {saved.keyword}
                </button>
                <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
                  <Clock className="w-3 h-3" />
                  {formatDate(saved.savedAt)}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(saved.keyword)}
                  className="p-1 text-[var(--color-text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

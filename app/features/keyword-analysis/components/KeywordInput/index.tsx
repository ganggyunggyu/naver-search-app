import React, { useState, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface KeywordInputProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onAnalyze: () => void;
  loading: boolean;
  suggestions: string[];
  suggestionsLoading: boolean;
  suggestionsVisible: boolean;
  onInputChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({
  keywords,
  onKeywordsChange,
  onAnalyze,
  loading,
  suggestions,
  suggestionsLoading,
  suggestionsVisible,
  onInputChange,
  onFocus,
  onBlur,
  onSelectSuggestion,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onInputChange(value);
    },
    [onInputChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // 한글 IME 조합 중에는 무시
      if (e.nativeEvent.isComposing) return;

      const cleanedValue = inputValue.replace(/\s/g, '');
      if (e.key === 'Enter' && cleanedValue) {
        e.preventDefault();
        if (keywords.length < 5 && !keywords.includes(cleanedValue)) {
          onKeywordsChange([...keywords, cleanedValue]);
          setInputValue('');
        }
      } else if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
        onKeywordsChange(keywords.slice(0, -1));
      }
    },
    [inputValue, keywords, onKeywordsChange]
  );

  const removeKeyword = useCallback(
    (keywordToRemove: string) => {
      onKeywordsChange(keywords.filter((k) => k !== keywordToRemove));
    },
    [keywords, onKeywordsChange]
  );

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      const cleanedSuggestion = suggestion.replace(/\s/g, '');
      if (keywords.length < 5 && !keywords.includes(cleanedSuggestion) && cleanedSuggestion) {
        onKeywordsChange([...keywords, cleanedSuggestion]);
        setInputValue('');
        onSelectSuggestion(cleanedSuggestion);
      }
    },
    [keywords, onKeywordsChange, onSelectSuggestion]
  );

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="flex flex-wrap items-center gap-2 min-h-[52px] px-4 py-2 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl focus-within:border-[var(--color-primary)] transition-colors">
            <Search className="w-5 h-5 text-[var(--color-text-tertiary)] flex-shrink-0" />

            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="p-0.5 hover:bg-[var(--color-primary)]/20 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={keywords.length === 0 ? '키워드 입력 후 Enter (최대 5개)' : keywords.length < 5 ? '추가 키워드...' : ''}
              disabled={keywords.length >= 5}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] disabled:cursor-not-allowed"
            />
          </div>

          {suggestionsVisible && (suggestions.length > 0 || suggestionsLoading) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestionsLoading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-text-tertiary)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  검색 중...
                </div>
              )}
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => selectSuggestion(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[var(--color-hover)] transition-colors"
                >
                  <Search className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                  <span className="text-[var(--color-text-primary)]">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading || keywords.length === 0}
          className="h-[52px] px-8 bg-[var(--color-primary)] text-white rounded-2xl font-semibold disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/25"
        >
          {loading ? (
            <React.Fragment>
              <Loader2 className="w-5 h-5 animate-spin" />
              분석 중
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Search className="w-5 h-5" />
              분석하기
            </React.Fragment>
          )}
        </button>
      </div>

      {keywords.length > 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {keywords.length}/5 키워드 선택됨
        </p>
      )}
    </div>
  );
};

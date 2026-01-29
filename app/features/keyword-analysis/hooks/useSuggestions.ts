import { useState, useRef, useCallback } from 'react';

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.includes(',')) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://ac.search.naver.com/nx/ac?q=${encodeURIComponent(query)}&q_enc=UTF-8&st=100&frm=nv&r_format=json&r_enc=UTF-8&r_unicode=0&t_koreng=1&ans=2&run=2&rev=4`
      );
      const data = await res.json();
      const items = data.items?.[0] || [];
      setSuggestions(items.map((item: string[]) => item[0]).slice(0, 8));
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
        setVisible(true);
      }, 300);
    },
    [fetchSuggestions]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setVisible(false);
  }, []);

  const showSuggestions = useCallback(() => {
    if (suggestions.length > 0) {
      setVisible(true);
    }
  }, [suggestions.length]);

  const hideSuggestions = useCallback(() => {
    setTimeout(() => setVisible(false), 200);
  }, []);

  return {
    suggestions,
    loading,
    visible,
    debouncedFetch,
    clearSuggestions,
    showSuggestions,
    hideSuggestions,
  };
};

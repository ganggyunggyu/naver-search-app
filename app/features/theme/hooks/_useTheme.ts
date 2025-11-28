import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { themeAtomWithPersistence, type Theme } from '../store';

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtomWithPersistence);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme: setSpecificTheme,
  };
};

import React from 'react';
import { Moon, Sun } from 'lucide-react';

export const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);

    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = stored === 'true' || (stored === null && prefersDark);
    setIsDark(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);

    localStorage.setItem('darkMode', String(newDarkMode));

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!isClient) {
    return (
      <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="
        relative w-10 h-10 rounded-lg
        bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-hover)]
        text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
        transition-all active:scale-95
        flex items-center justify-center
      "
    >
      <Sun
        size={20}
        className={`absolute transition-all duration-200 ${
          isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        size={20}
        className={`absolute transition-all duration-200 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
        }`}
      />
    </button>
  );
};

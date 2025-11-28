import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = () => {
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
    return <div />;
  }

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div />
      <div>
        <Sun size={24} style={{ display: isDark ? 'none' : 'block' }} />
        <Moon size={24} style={{ display: isDark ? 'block' : 'none' }} />
      </div>
      <div />
    </button>
  );
};
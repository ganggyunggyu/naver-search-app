import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/features/theme';

const navigationItems = [
  { to: '/', label: '인기글' },
  { to: '/keyword-test', label: '키워드' },
  { to: '/url-search', label: 'URL검색' },
  { to: '/doc-analyzer', label: '문서 분석' },
  { to: '/doc-compare', label: '문서 비교' },
];

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)]/80 backdrop-blur-lg border-b border-[var(--color-border)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]"
          >
            <span className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold">
              NS
            </span>
            <span className="hidden sm:inline">Naver Search</span>
            <span className="sm:hidden">NS</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            aria-label={isClient && isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors"
          >
            {isClient && isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

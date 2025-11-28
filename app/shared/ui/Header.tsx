import React from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/features/theme';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isDark, toggleTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { to: '/', label: '인기글' },
    { to: '/url-search', label: 'URL검색' },
    { to: '/doc-analyzer', label: '문서 분석' },
    { to: '/doc-compare', label: '문서 비교' },
  ];

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

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleMobileMenu}
              aria-label="메뉴 토글"
              className="sm:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <nav className="flex flex-col py-2 px-4">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
        </div>
      )}
    </header>
  );
};

export default Header;

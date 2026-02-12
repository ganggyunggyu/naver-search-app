import React from 'react';
import { NavLink } from 'react-router';
import { Flame, Link2, FileSearch, GitCompare } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: '인기글', icon: Flame, path: '/' },
  { label: 'URL', icon: Link2, path: '/url-search' },
  { label: '분석', icon: FileSearch, path: '/doc-analyzer' },
  { label: '비교', icon: GitCompare, path: '/doc-compare' },
];

export const BottomNavigation: React.FC = () => {
  return (
    <React.Fragment>
      <nav
        className="fixed bottom-0 left-0 right-0 z-[var(--z-fixed)] bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-border)] sm:hidden"
        role="navigation"
        aria-label="메인 네비게이션"
      >
        <div className="flex items-center justify-around h-14 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-95 ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-tertiary)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-xl transition-colors ${
                        isActive ? 'bg-[var(--color-primary-soft)]' : ''
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isActive ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        {/* iOS Safe Area */}
        <div className="h-[env(safe-area-inset-bottom)] bg-[var(--color-surface)]" />
      </nav>
      {/* Spacer for content */}
      <div className="h-[calc(3.5rem+env(safe-area-inset-bottom))] sm:hidden" />
    </React.Fragment>
  );
};

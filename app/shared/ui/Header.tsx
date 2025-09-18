import React from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X } from 'lucide-react';
import { cn } from '@/shared';

interface Props {}

const Header: React.FC<Props> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { to: '/', label: '인기글', color: 'purple' },
    { to: '/url-search', label: 'URL검색', color: 'amber' },
    { to: '/doc-analyzer', label: '문서 분석', color: 'purple' },
    { to: '/doc-compare', label: '문서 비교', color: 'indigo' },
  ];

  const getNavLinkClassName = (isActive: boolean, color: string) => cn(
    "px-2 py-1 rounded-md transition-colors",
    isActive
      ? `text-${color}-700 bg-${color}-50 dark:text-${color}-300 dark:bg-${color}-900/30`
      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
  );

  return (
    <React.Fragment>
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur",
        "bg-white/80 dark:bg-gray-950/70",
        "border-b border-gray-200/60 dark:border-gray-800/60"
      )}>
        <div className={cn(
          "container mx-auto px-3 sm:px-4 h-12 sm:h-14",
          "flex items-center justify-between"
        )}>
          <Link to="/" className={cn(
            "inline-flex items-center gap-2 group"
          )}>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br from-green-500 to-blue-600 shadow-sm" />
            <span className={cn(
              "font-semibold tracking-tight text-gray-900 dark:text-gray-100",
              "group-hover:opacity-90 text-sm sm:text-base"
            )}>
              <span className="hidden sm:inline">Naver Search</span>
              <span className="sm:hidden">NS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-sm">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => getNavLinkClassName(isActive, item.color)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={cn(
              "md:hidden p-2 rounded-md transition-colors",
              "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100",
              "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            aria-label="메뉴 토글"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={cn(
            "md:hidden border-t border-gray-200/60 dark:border-gray-800/60",
            "bg-white/95 dark:bg-gray-950/95 backdrop-blur"
          )}>
            <nav className="container mx-auto px-3 py-3 space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "block px-3 py-2 rounded-md transition-colors text-sm",
                    isActive
                      ? `text-${item.color}-700 bg-${item.color}-50 dark:text-${item.color}-300 dark:bg-${item.color}-900/30`
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>
    </React.Fragment>
  );
};

export default Header;

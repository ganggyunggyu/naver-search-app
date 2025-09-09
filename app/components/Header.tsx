import { Link, NavLink } from 'react-router';

interface Props {}

const Header: React.FC<Props> = () => (
  <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-gray-950/70 border-b border-gray-200/60 dark:border-gray-800/60">
    <div className="container mx-auto px-4 h-14 flex items-center justify-between">
      <Link to="/" className="inline-flex items-center gap-2 group">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-blue-600 shadow-sm" />
        <span className="font-semibold tracking-tight text-gray-900 dark:text-gray-100 group-hover:opacity-90">
          Naver Search
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-2 py-1 rounded-md transition-colors ${
              isActive
                ? 'text-purple-700 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          인기글
        </NavLink>
        <NavLink
          to="/url-search"
          className={({ isActive }) =>
            `px-2 py-1 rounded-md transition-colors ${
              isActive
                ? 'text-amber-700 bg-amber-50'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          URL검색
        </NavLink>
        <NavLink
          to="/doc-analyzer"
          className={({ isActive }) =>
            `px-2 py-1 rounded-md transition-colors ${
              isActive
                ? 'text-purple-700 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          문서 분석
        </NavLink>
        <NavLink
          to="/doc-compare"
          className={({ isActive }) =>
            `px-2 py-1 rounded-md transition-colors ${
              isActive
                ? 'text-indigo-700 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          문서 비교
        </NavLink>
      </nav>
    </div>
  </header>
);

export default Header;

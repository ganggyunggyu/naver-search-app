import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search, FileText } from 'lucide-react';
import { cn } from '@/shared';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: '인기글검색',
    icon: Search,
    path: '/',
    color: 'text-blue-500'
  },
  {
    id: 'compare',
    label: '문서비교',
    icon: FileText,
    path: '/doc-compare',
    color: 'text-purple-500'
  }
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeId, setActiveId] = React.useState<string>('home');

  React.useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => {
      if (item.path === '/' && currentPath === '/') return true;
      if (item.path !== '/' && currentPath.startsWith(item.path)) return true;
      return false;
    });

    if (activeItem) {
      setActiveId(activeItem.id);
    } else {
      // 동적 라우트 처리 (/:keyword 같은 경우)
      if (currentPath !== '/' && !navItems.some(item => currentPath.startsWith(item.path))) {
        setActiveId('home'); // 동적 키워드 검색은 홈으로 처리
      }
    }
  }, [location.pathname]);

  const handleNavClick = (item: NavItem) => {
    setActiveId(item.id);
    navigate(item.path);

    // 햅틱 피드백 (지원하는 기기에서만)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <React.Fragment>
      {/* 하단 네비게이션 바 */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white/80 dark:bg-black/80 backdrop-blur-xl',
        'border-t border-gray-200 dark:border-gray-800',
        'pb-safe-area-inset-bottom' // Safe area 대응
      )}>
        <div className={cn(
          'flex items-center justify-around px-2 py-2',
          'max-w-md mx-auto' // 큰 화면에서는 중앙 정렬
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'p-2 rounded-xl transition-all duration-300',
                  'min-w-[60px] active:scale-95',
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-900'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-950'
                )}
              >
                {/* 아이콘 */}
                <div className={cn(
                  'relative mb-1 transition-all duration-300',
                  isActive && 'transform -translate-y-0.5'
                )}>
                  <Icon
                    size={20}
                    className={cn(
                      'transition-colors duration-300',
                      isActive
                        ? item.color
                        : 'text-gray-400 dark:text-gray-600'
                    )}
                  />

                  {/* 활성 상태 인디케이터 */}
                  {isActive && (
                    <div className={cn(
                      'absolute -top-1 -right-1 w-2 h-2 rounded-full',
                      'bg-gradient-to-br from-blue-500 to-purple-500',
                      'animate-pulse shadow-sm'
                    )} />
                  )}
                </div>

                {/* 라벨 */}
                <span className={cn(
                  'text-xs font-medium transition-all duration-300',
                  isActive
                    ? 'text-black dark:text-white scale-105'
                    : 'text-gray-500 dark:text-gray-400'
                )}>
                  {item.label}
                </span>

                {/* 활성 상태 밑줄 */}
                {isActive && (
                  <div className={cn(
                    'absolute bottom-0 left-1/2 transform -translate-x-1/2',
                    'w-6 h-0.5 rounded-full',
                    'bg-gradient-to-r from-blue-500 to-purple-500',
                    'animate-in slide-in-from-bottom-2 duration-300'
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* 홈 인디케이터 (iOS 스타일) */}
        <div className={cn(
          'flex justify-center py-1'
        )}>
          <div className={cn(
            'w-32 h-1 bg-gray-300 dark:bg-gray-700 rounded-full'
          )} />
        </div>
      </div>

      {/* 하단 네비게이션 공간 확보 */}
      <div className={cn('h-20 md:h-0')} />
    </React.Fragment>
  );
};
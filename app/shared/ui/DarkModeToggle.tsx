import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/shared';

interface DarkModeToggleProps {
  className?: string;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className }) => {
  const [isDark, setIsDark] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  // 클라이언트에서만 실행
  React.useEffect(() => {
    setIsClient(true);

    // localStorage에서 다크모드 상태 확인
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = stored === 'true' || (stored === null && prefersDark);
    setIsDark(shouldBeDark);

    // HTML 클래스 적용
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);

    // localStorage에 저장
    localStorage.setItem('darkMode', String(newDarkMode));

    // HTML 클래스 토글
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 서버 사이드에서는 렌더링하지 않음 (hydration 오류 방지)
  if (!isClient) {
    return (
      <div className={cn(
        'w-10 h-10 rounded-lg border border-gray-200 bg-gray-100',
        className
      )} />
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        'relative w-12 h-12 rounded-xl transition-all duration-500',
        'flex items-center justify-center overflow-hidden',
        'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black',
        'border border-gray-200/50 dark:border-gray-800/50',
        'hover:border-gray-300 dark:hover:border-gray-700',
        'hover:shadow-xl hover:scale-105 active:scale-95',
        'backdrop-blur-sm',
        'group cursor-pointer',
        // 시크한 내부 그림자 효과
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
        className
      )}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* 배경 애니메이션 오버레이 */}
      <div className={cn(
        'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100',
        'bg-gradient-to-br transition-opacity duration-300',
        isDark
          ? 'from-blue-500/10 to-indigo-500/5'
          : 'from-yellow-500/10 to-orange-500/5'
      )} />

      {/* 아이콘 컨테이너 */}
      <div className="relative w-6 h-6 z-10">
        {/* Sun Icon - 더 시크한 애니메이션 */}
        <Sun
          size={24}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-out',
            isDark
              ? 'scale-0 rotate-180 opacity-0 blur-sm'
              : 'scale-100 rotate-0 opacity-100 text-gray-700 group-hover:text-yellow-600 group-hover:drop-shadow-sm'
          )}
        />

        {/* Moon Icon - 더 시크한 애니메이션 */}
        <Moon
          size={24}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-out',
            isDark
              ? 'scale-100 rotate-0 opacity-100 text-gray-300 group-hover:text-blue-400 group-hover:drop-shadow-sm'
              : 'scale-0 -rotate-180 opacity-0 blur-sm'
          )}
        />
      </div>

      {/* 미세한 반짝이 효과 */}
      <div className={cn(
        'absolute top-1 right-1 w-1 h-1 rounded-full',
        'bg-white dark:bg-gray-400 opacity-60',
        'animate-pulse'
      )} />
    </button>
  );
};
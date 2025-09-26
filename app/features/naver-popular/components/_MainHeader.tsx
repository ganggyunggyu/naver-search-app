import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { cn } from '@/shared';
import { DarkModeToggle } from '@/shared/ui/DarkModeToggle';

export const MainHeader = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <React.Fragment>
      {/* 모바일 앱 스타일 상단 바 */}
      <div
        className={cn(
          'sticky top-0 z-50 px-4 py-3 transition-all duration-300',
          'backdrop-blur-xl border-b',
          isScrolled
            ? 'bg-white/80 dark:bg-black/80 border-gray-200 dark:border-gray-800 shadow-sm'
            : 'bg-transparent border-transparent'
        )}
      >
        <div className={cn('flex items-center justify-between')}>
          {/* 왼쪽: 메뉴/로고 */}
          <div className={cn('flex items-center gap-3')}>
            <button className={cn(
              'p-2 rounded-full transition-colors lg:hidden',
              'hover:bg-gray-100 dark:hover:bg-gray-900'
            )}>
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div className={cn('flex items-center gap-2')}>
              <div className={cn(
                'w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl',
                'flex items-center justify-center shadow-md'
              )}>
                <Search size={16} className="text-white" />
              </div>
              <div className={cn('hidden sm:block')}>
                <h1 className={cn('text-lg font-bold text-black dark:text-white')}>
                  네이버 검색
                </h1>
                <p className={cn('text-xs text-gray-500 dark:text-gray-400 -mt-1')}>
                  Search Engine
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className={cn('flex items-center gap-2')}>
            <button className={cn(
              'p-2 rounded-full transition-colors relative',
              'hover:bg-gray-100 dark:hover:bg-gray-900'
            )}>
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              <div className={cn(
                'absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full',
                'flex items-center justify-center'
              )}>
                <div className={cn('w-1.5 h-1.5 bg-white rounded-full')} />
              </div>
            </button>
            <DarkModeToggle />
            <button className={cn(
              'p-2 rounded-full transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-900'
            )}>
              <User size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 앱 스타일 메인 타이틀 섹션 */}
      <div className={cn('px-4 pt-8 pb-6')}>
        {/* 그라디언트 배경 */}
        <div className={cn(
          'relative rounded-3xl p-6 mb-8',
          'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
          'dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30',
          'border border-gray-200 dark:border-gray-800',
          'shadow-sm overflow-hidden'
        )}>
          {/* 배경 패턴 */}
          <div className={cn(
            'absolute inset-0 opacity-20',
            'bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]',
            'bg-[radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.15),transparent_50%)]'
          )} />

          <div className={cn('relative z-10 text-center')}>
            <div className={cn('flex items-center justify-center gap-3 mb-4')}>
              <div className={cn(
                'w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl',
                'flex items-center justify-center shadow-lg',
                'animate-pulse'
              )}>
                <Search size={24} className="text-white" />
              </div>
              <div>
                <h1 className={cn('text-2xl font-black text-black dark:text-white')}>
                  NAVER SEARCH
                </h1>
                <p className={cn('text-sm text-gray-600 dark:text-gray-400 font-medium')}>
                  AI 분석 엔진
                </p>
              </div>
            </div>

            <p className={cn(
              'text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-sm mx-auto'
            )}>
              키워드 검색부터 블로그 분석까지<br/>
              원클릭으로 완료하세요
            </p>

            {/* 실시간 스테이터스 */}
            <div className={cn(
              'mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
              'bg-white/50 dark:bg-black/30 backdrop-blur-sm',
              'border border-white/20 dark:border-gray-700'
            )}>
              <div className={cn('flex items-center gap-1')}>
                <div className={cn('w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse')} />
                <div className={cn('w-1 h-1 rounded-full bg-green-400 animate-pulse')} style={{ animationDelay: '0.2s' }} />
                <div className={cn('w-1 h-1 rounded-full bg-green-300 animate-pulse')} style={{ animationDelay: '0.4s' }} />
              </div>
              <span className={cn('text-xs font-medium text-gray-700 dark:text-gray-300')}>
                실시간 분석 준비완료
              </span>
            </div>
          </div>
        </div>

        {/* 퀵 액션 버튼들 (모바일 앱 스타일) */}
        <div className={cn('grid grid-cols-2 gap-3 mb-6')}>
          <div className={cn(
            'p-4 rounded-2xl border border-gray-200 dark:border-gray-800',
            'bg-white dark:bg-black shadow-sm',
            'flex items-center gap-3 transition-all duration-200',
            'hover:shadow-md active:scale-95'
          )}>
            <div className={cn(
              'w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl',
              'flex items-center justify-center'
            )}>
              <Search size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={cn('text-sm font-semibold text-black dark:text-white')}>
                키워드 검색
              </p>
              <p className={cn('text-xs text-gray-500 dark:text-gray-400')}>
                인기글 추출
              </p>
            </div>
          </div>

          <div className={cn(
            'p-4 rounded-2xl border border-gray-200 dark:border-gray-800',
            'bg-white dark:bg-black shadow-sm',
            'flex items-center gap-3 transition-all duration-200',
            'hover:shadow-md active:scale-95'
          )}>
            <div className={cn(
              'w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl',
              'flex items-center justify-center'
            )}>
              <Bell size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className={cn('text-sm font-semibold text-black dark:text-white')}>
                URL 분석
              </p>
              <p className={cn('text-xs text-gray-500 dark:text-gray-400')}>
                직접 추출
              </p>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
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
      <div>
        <div>
          <div>
            <button>
              <Menu size={20} />
            </button>
            <div>
              <div>
                <Search size={16} />
              </div>
              <div>
                <h1>네이버 검색</h1>
                <p>Search Engine</p>
              </div>
            </div>
          </div>

          <div>
            <button>
              <Bell size={18} />
              <div>
                <div />
              </div>
            </button>
            <DarkModeToggle />
            <button>
              <User size={18} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div />

          <div>
            <div>
              <div>
                <Search size={24} />
              </div>
              <div>
                <h1>NAVER SEARCH</h1>
                <p>AI 분석 엔진</p>
              </div>
            </div>

            <p>
              키워드 검색부터 블로그 분석까지<br/>
              원클릭으로 완료하세요
            </p>

            <div>
              <div>
                <div />
                <div style={{ animationDelay: '0.2s' }} />
                <div style={{ animationDelay: '0.4s' }} />
              </div>
              <span>실시간 분석 준비완료</span>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div>
              <Search size={18} />
            </div>
            <div>
              <p>키워드 검색</p>
              <p>인기글 추출</p>
            </div>
          </div>

          <div>
            <div>
              <Bell size={18} />
            </div>
            <div>
              <p>URL 분석</p>
              <p>직접 추출</p>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search, FileText } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: '인기글검색', icon: Search, path: '/' },
  { id: 'compare', label: '문서비교', icon: FileText, path: '/doc-compare' }
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
      if (currentPath !== '/' && !navItems.some(item => currentPath.startsWith(item.path))) {
        setActiveId('home');
      }
    }
  }, [location.pathname]);

  const handleNavClick = (item: NavItem) => {
    setActiveId(item.id);
    navigate(item.path);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <React.Fragment>
      <div>
        <div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button key={item.id} onClick={() => handleNavClick(item)}>
                <div>
                  <Icon size={20} />
                  {isActive && <div />}
                </div>
                <span>{item.label}</span>
                {isActive && <div />}
              </button>
            );
          })}
        </div>
        <div>
          <div />
        </div>
      </div>
      <div />
    </React.Fragment>
  );
};
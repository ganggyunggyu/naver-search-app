import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { ToastProvider } from './shared/ui/Toast';
import Header from './shared/ui/Header';
import { BottomNavigation } from './shared/ui/BottomNavigation';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      <Meta />
      <Links />
    </head>
    <body>
      <ToastProvider>
        {/* 데스크톱에서만 기존 Header 표시 */}
        <div className="hidden lg:block">
          <Header />
        </div>

        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 pb-20 lg:pb-0 lg:pt-14">
          {children}
        </div>

        {/* 모바일/태블릿에서만 하단 네비게이션 표시 */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </ToastProvider>
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);

const App: React.FC = () => <Outlet />;

export default App;

export const ErrorBoundary: React.FC<Route.ErrorBoundaryProps> = ({ error }) => {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
};

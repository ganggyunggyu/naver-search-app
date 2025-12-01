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
    href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css',
  },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="ko">
    <head>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <Meta />
      <Links />
    </head>
    <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] antialiased">
      <ToastProvider>
        {/* Desktop Header */}
        <div className="hidden sm:block">
          <Header />
        </div>

        {/* Main Content */}
        <div className="min-h-screen pb-20 sm:pb-0">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="sm:hidden">
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

export const ErrorBoundary: React.FC<Route.ErrorBoundaryProps> = ({
  error,
}) => {
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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
          {message}
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-4">{details}</p>
        {stack && (
          <pre className="text-left p-4 rounded-xl bg-[var(--color-bg-tertiary)] text-xs overflow-x-auto max-w-lg mx-auto">
            <code className="text-[var(--color-text-tertiary)]">{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
};

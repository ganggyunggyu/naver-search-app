# Naver Search Engine - Project Context

## Project Overview
**Naver Search Engine** is a frontend search engine application that integrates with the Naver Search API. It's built using React Router v7 (Remix-style) with TypeScript and TailwindCSS. The application provides features like blog search, news search, and scraping of Naver's popular posts section.

## Project Structure (FSD Architecture)

```
app/
├── constants/        # Constants (headers, selectors, blog-ids)
├── entities/         # Domain entities
├── features/         # Feature modules (FSD architecture)
│   ├── naver-popular/ # Main popular search feature
│   ├── search/       # Search functionality
│   └── doc/          # Document analysis features
├── routes/           # API and page routes
├── shared/           # Shared utilities and components
├── welcome/          # Welcome page
├── app.css
├── root.tsx
└── routes.ts
```

## Core Technologies
- **Frontend Framework**: React 19 + React Router v7 (with SSR support)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4
- **State Management**: Jotai (atomic state management)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **HTML Parsing**: Cheerio (for scraping Naver search results)

## Key Features
1. **Naver Blog Search API Integration**: Search blog posts using Naver's API
2. **Naver Popular Posts Scraping**: Parse and extract popular posts from Naver search results
3. **News Search**: Search news articles using Naver's API
4. **Document Analysis**: Features for document analysis and comparison
5. **Responsive Design**: Mobile-friendly design using TailwindCSS

## API Endpoints
- `GET /api/search` - Blog search
- `GET /api/news` - News search
- `GET /api/naver-search` - Naver content scraping
- `GET /api/naver-popular` - Popular posts extraction
- Dynamic routes like `/:keyword` and `/url/:encoded`

## Development Commands
```bash
npm run dev          # Start development server on port 4001
npm run build        # Create production build
npm run start        # Start production server
npm run typecheck    # Run type checking
```

## Environment Variables
Required environment variables:
```env
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

## Architecture & Patterns

### Component Structure
Components follow a consistent pattern with proper TypeScript typing:
```typescript
interface ComponentProps {
  // Define all props with types
}

export const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  return (
    <React.Fragment> {/* Use React.Fragment instead of <> */}
      {/* Component content */}
    </React.Fragment>
  );
};
```

### State Management (Jotai)
- Uses Jotai atoms for state management
- Separate atoms for different concerns (search term, results, loading state)
- Derived atoms for computed values
- Action atoms for async operations

### FSD (Feature-Sliced Design)
Each feature follows the structure:
```
features/feature-name/
├── components/       # UI components
├── hooks/           # Custom hooks
├── lib/            # Business logic
├── store/          # Jotai atoms
└── index.ts        # Public API
```

## Naver HTML Structure Parsing
The application scrapes Naver search results using Cheerio. The current CSS selectors for popular posts are:
- Container: `.fds-ugc-single-intention-item-list`
- Item: `.w0FkNRfc2K6rffX0LJFd`
- Title link: `.Pcw4FFPrGxhURyUmBGxh`
- Preview: `.XEJeYBY31zkS37HszIeB`

The application includes fallback strategies for when Naver changes their HTML structure.

## Development Conventions
1. Use absolute imports with `@/` prefix
2. Always use `React.Fragment` instead of `<>`
3. Use `cn()` utility for className management
4. Define TypeScript interfaces for all component props
5. Follow Jotai patterns for state management
6. Implement proper error handling
7. Use TailwindCSS for styling with responsive patterns

## Deployment
- Supports Docker deployment
- Production build creates both client and server bundles
- Can be deployed to platforms like Vercel, AWS, GCP, etc.

## Important Notes
- Naver Search API has a limit of 25,000 calls per day
- The project includes extensive fallback mechanisms for scraping since Naver changes their HTML structure periodically
- Uses React Router v7 with SSR enabled
- Implements FSD architectural pattern for better code organization
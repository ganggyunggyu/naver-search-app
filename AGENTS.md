# AGENTS.md

Agent working guide for this repository. Applies to the entire repo (root scope).

## Stack Overview

- Runtime: React 19 + React Router v7 (SSR via `@react-router/node`)
- Build: Vite 6, TypeScript (strict), Tailwind CSS v4
- State: Jotai
- Paths: `@/*` resolves to `./app/*` (see `tsconfig.json`)
- Server handlers: Route loaders/actions in `app/routes/*.ts(x)` using `Response` Web API

## Directory Structure (FSD‑oriented)

- `app/entities/` domain models and types only (no side effects)
- `app/features/` feature slices (state, hooks, UI for one feature)
- `app/routes/` view routes and server handlers (React Router v7)
- `app/components/` reusable UI components (feature‑agnostic)
- `app/shared/` cross‑cutting utils, constants, adapters
- Prefer adding new code under these folders. Treat `app/.utils` as legacy; do not add new files there.

## Naming Rules (must)

- Variables/functions: camelCase (`searchQuery`)
- Arrays: suffix `List` (`postList`)
- Boolean: `is` prefix (`isLoading`, `isOpen`)
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE (`RECENT_SEARCH_STORAGE_KEY`)
- CRUD functions: `create*`, `get*`, `update*`, `remove*`
- Boolean toggle: `toggle*`
- Transformers: `convert*`
- Collection processors after iteration: `filter*`, `find*`, `convert*`
- Event handlers: `handle<EventName>` (`handleSubmit`)
- No magic numbers: lift to named constants

## React Conventions (must)

- Functional components as arrow functions, named exports where possible
- Props must use an interface; no inline `any`
- Use `<React.Fragment>` instead of shorthand `<> ... </>`
- Hooks must prefix `use`; no conditional hook calls
- Keep components presentational; move logic to hooks/services when it grows

Example (component):

```tsx
// app/components/SearchInput.tsx
import React from 'react';

export interface SearchInputProps {
  value: string;
  placeholder?: string;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder = '검색어 입력',
  isDisabled = false,
  onChange,
  onEnter,
}) => (
  <div className="w-full">
    <input
      className="w-full rounded-md border px-3 py-2 text-sm"
      value={value}
      placeholder={placeholder}
      disabled={isDisabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
    />
  </div>
);
```

## Router Handlers (server) (must)

- Co-locate server logic with routes: `app/routes/*.ts(x)`
- Type handlers via generated `Route` types in `app/routes/+types/*`
- Use `Response.json` with helpers from `app/shared/utils/_response.ts`
- Avoid `any`; use generics with concrete interfaces

Example (loader):

```ts
// app/routes/api.example.ts
import type { Route } from './+types/api.example';
import { jsonError, jsonOk } from '@/shared';

interface ExampleItem { id: string; title: string }
interface ExampleResponse<TItem> { total: number; items: TItem[] }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';
  if (!query) return jsonError('검색어가 필요합니다.', 400);

  const data: ExampleResponse<ExampleItem> = {
    total: 1,
    items: [{ id: '1', title: `echo:${query}` }],
  };
  return jsonOk(data, 200);
};
```

## Jotai State (must)

- Atom names reflect domain, booleans with `is*`
- Persisted atoms use `atomWithStorage` and a stable UPPER_SNAKE_CASE key

Example:

```ts
// app/features/example/store/atoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const exampleQueryAtom = atom<string>('');
export const exampleIsLoadingAtom = atom<boolean>(false);

export const EXAMPLE_RECENT_SEARCH_KEY = 'exampleRecentSearchList';
export const exampleRecentSearchListAtom = atomWithStorage<string[]>(
  EXAMPLE_RECENT_SEARCH_KEY,
  []
);
```

## Utilities (must)

- Put cross‑cutting helpers in `app/shared/utils/*`
- Reuse existing HTTP helpers: `fetchHtml`, `fetchNaverOpenApi<T>()`
- Define request/response interfaces near their usage; export if reused

Example (converter):

```ts
// app/shared/utils/_convert.ts
export interface RawItem { id: string; ttl?: string }
export interface NormalizedItem { id: string; title: string }

export const convertRawToNormalized = (item: RawItem): NormalizedItem => ({
  id: item.id,
  title: item.ttl ?? '제목 없음',
});
```

## Styling

- Prefer Tailwind utility classes; keep global styles in `app/app.css`
- Keep components accessible (labels, aria‑ attributes)

## Environment

- `.env` supplies `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET` for OpenAPI
- Do not commit secrets; read via `process.env.*`

## Migration Notes

- For “naver popular” feature, prefer `app/features/naver-popular/*` for new code
- Gradually migrate from legacy `naverPopular/*` to `naver-popular/*`

## Do / Don’t

- Do: keep functions small, single‑responsibility, extract shared logic
- Do: write concrete types; use generics instead of `any`
- Don’t: introduce new top‑level folders without discussion
- Don’t: inline magic numbers/strings; centralize as constants

## Scripts

- `npm run dev` run in dev mode (React Router)
- `npm run build` build server/client bundles
- `npm run start` serve built app
- `npm run typecheck` generate router types and run `tsc`


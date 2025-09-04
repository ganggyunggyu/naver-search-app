import type { Route } from './+types/home';
import { useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Naver Search Engine' },
    { name: 'description', content: 'Search with Naver API' },
  ];
}

export default function Home() {
  const [query, setQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="relative py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-gradient-to-br from-green-200/40 via-blue-200/30 to-transparent blur-3xl" />
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Naver Search Engine
          </h1>
        </div>

        <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
          <div className="group flex items-center gap-2 rounded-2xl border border-gray-300 bg-white p-2 shadow-sm transition focus-within:ring-2 focus-within:ring-green-500 dark:bg-gray-900 dark:border-gray-700">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="flex-1 px-4 py-3 rounded-xl bg-white text-black dark:text-black placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-green-600 text-white font-medium shadow hover:bg-green-700 active:scale-[.99] transition"
            >
              검색
            </button>
          </div>
        </form>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <a
            href="/search"
            className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition dark:bg-gray-900 dark:border-gray-800"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              블로그/뉴스 검색
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              네이버 결과를 빠르게 탐색하고 복사
            </p>
          </a>
          <a
            href="/search"
            className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition dark:bg-gray-900 dark:border-gray-800"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              텍스트 추출
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              검색결과 페이지에서 원하는 텍스트만 추출
            </p>
          </a>
          <a
            href="/naver-popular"
            className="rounded-xl border border-green-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition dark:bg-gray-900 dark:border-gray-800"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              인기글 추출
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              인기글 섹션의 블로그 제목/링크/요약 추출
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

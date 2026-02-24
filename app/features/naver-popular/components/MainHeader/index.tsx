import React from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { DarkModeToggle } from '@/shared';

export const MainHeader = () => {
  return (
    <React.Fragment>
      {/* Compact Header - Mobile & Desktop */}
      <header className="sticky top-0 z-sticky bg-surface/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Search size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary leading-tight">
                  NAVER SEARCH
                </span>
                <span className="text-xs text-text-tertiary leading-tight hidden sm:block">
                  인기글 분석 엔진
                </span>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Desktop only */}
      <section className="hidden sm:block py-8 bg-gradient-to-b from-bg-primary to-surface">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Search size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-text-primary">
                NAVER SEARCH
              </h1>
              <p className="text-sm text-text-secondary">
                AI 분석 엔진
              </p>
            </div>
          </div>

          <p className="text-text-secondary text-sm mb-4">
            키워드 검색부터 블로그 분석까지 원클릭으로 완료하세요
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-soft text-success">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-xs font-medium">실시간 분석 준비완료</span>
          </div>
        </div>
      </section>

      {/* Feature Cards - Desktop only */}
      <section className="hidden sm:block pb-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                <Search size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">키워드 검색</p>
                <p className="text-xs text-text-tertiary">인기글 추출</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
              <div className="w-10 h-10 rounded-lg bg-info-soft flex items-center justify-center">
                <Search size={18} className="text-info" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">URL 분석</p>
                <p className="text-xs text-text-tertiary">직접 추출</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Summary Skeleton */}
      <div className="p-5 bg-surface border border-border rounded-2xl">
        <div className="h-4 w-24 bg-hover rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 bg-hover rounded-xl">
              <div className="h-3 w-16 bg-border rounded mb-2" />
              <div className="h-6 w-20 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Card Skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-hover rounded" />
              <div className="flex gap-2">
                <div className="h-7 w-20 bg-hover rounded-full" />
                <div className="h-7 w-20 bg-hover rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-hover rounded-full" />
              <div className="flex-1 h-6 bg-hover rounded" />
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="p-3 bg-hover rounded-xl">
                  <div className="h-3 w-12 bg-border rounded mb-2" />
                  <div className="h-5 w-16 bg-border rounded" />
                </div>
              ))}
            </div>
            <div className="mt-4 h-24 bg-hover rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

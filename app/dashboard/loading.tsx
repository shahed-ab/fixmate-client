import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-44 sm:h-48 w-full rounded-3xl bg-muted/60 border border-border" />

      {/* 4 Stats Cards Skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded-md" />
              <div className="h-8 w-8 rounded-xl bg-muted" />
            </div>
            <div className="h-7 w-20 bg-muted/80 rounded-md" />
            <div className="h-3 w-36 bg-muted/60 rounded-md" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-44 bg-muted rounded-md" />
          <div className="h-60 w-full bg-muted/40 rounded-xl" />
        </div>
        <div className="h-80 rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-36 bg-muted rounded-md" />
          <div className="h-40 w-40 mx-auto rounded-full bg-muted/40" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-muted/50 rounded-md" />
            <div className="h-4 w-3/4 bg-muted/50 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

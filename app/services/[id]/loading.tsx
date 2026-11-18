import React from 'react';
import { Container } from '@/components/Container';

export default function ServiceDetailsLoading() {
  return (
    <div className="flex-1 py-8 md:py-12 space-y-10 animate-pulse">
      <Container className="space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-64 bg-muted/60 rounded-md" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Left Skeleton */}
          <div className="lg:col-span-8 space-y-8">
            <div className="aspect-[16/10] w-full rounded-3xl bg-muted/70" />

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-muted/60 rounded-full" />
                <div className="h-6 w-28 bg-muted/60 rounded-full" />
              </div>
              <div className="h-10 w-3/4 bg-muted/80 rounded-xl" />
              <div className="h-4 w-full bg-muted/50 rounded-md" />
              <div className="h-4 w-5/6 bg-muted/50 rounded-md" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 bg-muted/50 rounded-2xl" />
              <div className="h-20 bg-muted/50 rounded-2xl" />
              <div className="h-20 bg-muted/50 rounded-2xl" />
            </div>

            <div className="space-y-4 pt-4 border-t border-border/70">
              <div className="h-6 w-48 bg-muted/70 rounded-md" />
              <div className="h-24 bg-muted/50 rounded-2xl" />
              <div className="h-24 bg-muted/50 rounded-2xl" />
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-4 w-full space-y-4">
            <div className="h-96 rounded-3xl bg-muted/60" />
            <div className="h-20 rounded-2xl bg-muted/40" />
          </div>
        </div>
      </Container>
    </div>
  );
}

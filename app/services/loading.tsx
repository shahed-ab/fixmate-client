import React from 'react';
import { Container } from '@/components/Container';
import { ServiceCardSkeleton } from '@/components/ServiceCard';

export default function ServicesLoading() {
  return (
    <div className="flex-1 py-8 md:py-12 space-y-8 md:space-y-10 animate-pulse">
      <Container className="space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-32 bg-muted/70 rounded-md" />

        {/* Page Header Skeleton */}
        <div className="space-y-3 max-w-xl">
          <div className="h-6 w-48 bg-muted/60 rounded-full" />
          <div className="h-10 w-80 bg-muted/80 rounded-xl" />
          <div className="h-4 w-96 bg-muted/50 rounded-md" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="p-4 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col lg:flex-row gap-3">
          <div className="h-11 flex-1 bg-muted/50 rounded-xl" />
          <div className="grid grid-cols-3 gap-2.5 w-full lg:w-96">
            <div className="h-11 bg-muted/50 rounded-xl" />
            <div className="h-11 bg-muted/50 rounded-xl" />
            <div className="h-11 bg-muted/50 rounded-xl" />
          </div>
        </div>

        {/* Services Grid (8 Skeletons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}

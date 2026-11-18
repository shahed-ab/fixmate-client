import React from 'react';
import { Wrench } from 'lucide-react';
import { Container } from '@/components/Container';

export default function Loading() {
  return (
    <div
      className="flex-1 min-h-[60vh] flex flex-col items-center justify-center py-20"
      role="status"
      aria-label="Loading FixMate"
    >
      <Container className="flex flex-col items-center text-center space-y-6 max-w-md">
        {/* Animated Brand Wrench Pulse */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-primary/20 animate-ping duration-1000" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Wrench className="h-8 w-8 animate-spin duration-3000" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            Fix<span className="text-primary">Mate</span> Diagnostics
          </h2>
          <p className="text-xs text-muted-foreground animate-pulse">
            Connecting to technician dispatch network & loading service modules...
          </p>
        </div>

        {/* Loading Skeleton Bars */}
        <div className="w-full space-y-3 pt-4">
          <div className="h-2.5 w-full bg-muted/80 rounded-full animate-pulse" />
          <div className="h-2.5 w-3/4 mx-auto bg-muted/60 rounded-full animate-pulse delay-75" />
          <div className="h-2.5 w-1/2 mx-auto bg-muted/40 rounded-full animate-pulse delay-150" />
        </div>
      </Container>
    </div>
  );
}

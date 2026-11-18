'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Home,
  AlertTriangle,
  ChevronDown,
  Wrench,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [showTelemetry, setShowTelemetry] = useState(false);

  useEffect(() => {
    // Log unexpected runtime error to console
    console.error('FixMate Workbench Error:', error);
  }, [error]);

  const quickCategories = [
    { label: 'Smartphone', href: '/services?category=Smartphone' },
    { label: 'AC Servicing', href: '/services?category=AC' },
    { label: 'Laptop & PC', href: '/services?category=Laptop%20%26%20PC' },
    { label: 'Refrigerator', href: '/services?category=Refrigerator' },
  ];

  return (
    <div className="flex-1 py-16 md:py-24 flex items-center justify-center">
      <Container className="max-w-3xl text-center">
        {/* Diagnostic Code Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-medium mb-8">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span>DIAGNOSTIC CODE: ERR_500_SYSTEM_MALFUNCTION</span>
        </div>

        {/* Toolbox Visual Illustration */}
        <div className="relative mx-auto my-6 flex items-center justify-center">
          <div className="relative w-48 h-32 md:w-56 md:h-36 rounded-2xl bg-teal-800 border-4 border-teal-900 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
            {/* Toolbox Handle */}
            <div className="absolute -top-4 w-20 h-8 rounded-t-xl border-4 border-teal-950 bg-transparent" />
            {/* Toolbox Latches */}
            <div className="absolute top-4 left-6 w-3 h-6 bg-zinc-300 rounded-sm shadow-xs" />
            <div className="absolute top-4 right-6 w-3 h-6 bg-zinc-300 rounded-sm shadow-xs" />
            {/* Caution Warning Triangle */}
            <div className="flex flex-col items-center justify-center p-3 rounded-full bg-amber-400/20 backdrop-blur-xs">
              <AlertTriangle className="h-12 w-12 text-amber-400 animate-pulse" />
            </div>
            {/* Toolbox Seam */}
            <div className="absolute bottom-6 w-full h-0.5 bg-teal-950" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Our diagnostic system detected an unexpected disruption on the workbench.
            Our repair engineers have been alerted and are currently investigating the issue.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => reset()}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Try Again
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/">
                <Home className="h-4 w-4 mr-1.5 text-primary" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Telemetry Details Section */}
        <div className="mt-10 max-w-2xl mx-auto text-left">
          <div className="rounded-xl border border-border bg-white shadow-xs overflow-hidden">
            <button
              onClick={() => setShowTelemetry((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-medium text-foreground/80 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span>Diagnostic System Telemetry</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  500 Failover
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-[11px]">{showTelemetry ? 'Hide' : 'Telemetry Details'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showTelemetry ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {showTelemetry && (
              <div className="p-4 border-t border-border bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto space-y-2">
                <p className="text-rose-400 font-semibold">
                  Error: {error.message || 'An unknown runtime exception occurred.'}
                </p>
                {error.digest && (
                  <p className="text-zinc-400 text-[11px]">Digest: {error.digest}</p>
                )}
                {error.stack && (
                  <pre className="text-[10px] text-zinc-500 whitespace-pre-wrap leading-tight pt-2 border-t border-zinc-800">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Direct Service Shortcuts */}
        <div className="mt-8 text-xs text-muted-foreground max-w-xl mx-auto">
          <p className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground/80 mb-2">
            Or Jump Directly to Service Areas
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickCategories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-colors text-xs font-medium text-foreground/80"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

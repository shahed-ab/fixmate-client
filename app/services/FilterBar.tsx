'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  RotateCcw,
  X,
  SlidersHorizontal,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  total: number;
}

export function FilterBar({ total }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read current query params from URL
  const currentQ = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || 'All';
  const currentMode = searchParams.get('mode') || 'All';
  const currentSort = searchParams.get('sort') || 'newest';

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(currentQ);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(currentQ);
  }, [currentQ]);

  // Helper to construct updated query string and navigate
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (!val || val === 'All' || (key === 'sort' && val === 'newest')) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });

      // Reset page back to 1 whenever filters change (unless page itself is explicitly updated)
      if (!('page' in updates)) {
        params.delete('page');
      }

      const queryString = params.toString();
      startTransition(() => {
        router.push(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [router, pathname, searchParams]
  );

  // Debounce search input (300ms)
  useEffect(() => {
    if (searchInput === currentQ) return;

    const timer = setTimeout(() => {
      updateParams({ q: searchInput.trim() ? searchInput.trim() : null });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, currentQ, updateParams]);

  const handleReset = () => {
    setSearchInput('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    currentQ ||
      (currentCategory && currentCategory !== 'All') ||
      (currentMode && currentMode !== 'All') ||
      (currentSort && currentSort !== 'newest')
  );

  return (
    <div className="space-y-4">
      {/* Main Filter Controls Bar */}
      <div className="p-3 md:p-4 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, device model, or category..."
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-muted/40 border border-transparent focus:border-primary/40 focus:bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                updateParams({ q: null });
              }}
              className="absolute right-3 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => updateParams({ category: e.target.value })}
              className="w-full h-11 appearance-none px-3.5 pr-8 rounded-xl bg-muted/40 border border-transparent focus:border-primary/40 focus:bg-white text-xs font-semibold text-foreground focus:outline-none cursor-pointer transition-all"
            >
              <option value="All">All Categories</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Service Mode Dropdown */}
          <div className="relative">
            <select
              value={currentMode}
              onChange={(e) => updateParams({ mode: e.target.value })}
              className="w-full h-11 appearance-none px-3.5 pr-8 rounded-xl bg-muted/40 border border-transparent focus:border-primary/40 focus:bg-white text-xs font-semibold text-foreground focus:outline-none cursor-pointer transition-all"
            >
              <option value="All">All Service Modes</option>
              <option value="Home Visit">Home Visit</option>
              <option value="Shop Drop-off">Shop Drop-off</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="w-full h-11 appearance-none px-3.5 pr-8 rounded-xl bg-muted/40 border border-transparent focus:border-primary/40 focus:bg-white text-xs font-semibold text-foreground focus:outline-none cursor-pointer transition-all"
            >
              <option value="newest">Newest Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="h-11 px-3.5 rounded-xl border border-border hover:border-destructive/40 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Applied Filters & Summary Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground px-1">
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Applied:
            </span>
          )}

          {currentQ && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              Search: &ldquo;{currentQ}&rdquo;
              <button
                onClick={() => {
                  setSearchInput('');
                  updateParams({ q: null });
                }}
                className="hover:text-teal-950 p-0.5"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {currentCategory && currentCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              {currentCategory}
              <button
                onClick={() => updateParams({ category: null })}
                className="hover:text-teal-950 p-0.5"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {currentMode && currentMode !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              {currentMode}
              <button
                onClick={() => updateParams({ mode: null })}
                className="hover:text-teal-950 p-0.5"
                aria-label="Remove mode filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {currentSort && currentSort !== 'newest' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              Sort:{' '}
              {currentSort === 'price-asc'
                ? 'Price: Low to High'
                : currentSort === 'price-desc'
                ? 'Price: High to Low'
                : 'Oldest'}
              <button
                onClick={() => updateParams({ sort: null })}
                className="hover:text-teal-950 p-0.5"
                aria-label="Remove sort filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        {/* Counter and Verified Indicator */}
        <div className="flex items-center gap-4 ml-auto">
          <span>
            Showing <strong className="text-foreground">{total}</strong> services
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-teal-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Technicians verified today</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;

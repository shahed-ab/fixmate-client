'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export function Pagination({ page, pages, total, limit }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pages <= 1 && total === 0) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pages || newPage === page) return;

    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: true,
    });
  };

  // Generate page numbers array (with ellipsis if large)
  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      range.unshift('...');
    }
    if (page + delta < pages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (pages > 1) {
      range.push(pages);
    }

    return range;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/70 text-xs">
      <span className="text-muted-foreground">
        Showing <strong className="text-foreground">{start}</strong> -{' '}
        <strong className="text-foreground">{end}</strong> of{' '}
        <strong className="text-foreground">{total}</strong> services
      </span>

      {pages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className={cn(
              'h-9 px-3 rounded-xl border border-border flex items-center gap-1 font-semibold transition-colors',
              page <= 1
                ? 'opacity-40 cursor-not-allowed bg-muted/20 text-muted-foreground'
                : 'hover:bg-muted/60 text-foreground'
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Number Buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="h-9 w-8 flex items-center justify-center text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isCurrent = pageNum === page;

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={cn(
                    'h-9 w-9 rounded-xl text-xs font-bold transition-all',
                    isCurrent
                      ? 'bg-primary text-white shadow-xs'
                      : 'hover:bg-muted/70 text-foreground/80 border border-border/60'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= pages}
            className={cn(
              'h-9 px-3 rounded-xl border border-border flex items-center gap-1 font-semibold transition-colors',
              page >= pages
                ? 'opacity-40 cursor-not-allowed bg-muted/20 text-muted-foreground'
                : 'hover:bg-muted/60 text-foreground'
            )}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;

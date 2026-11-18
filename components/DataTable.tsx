'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
  mobileLabel?: string;
  isAction?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string;
  mobileCardRender?: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string | React.ReactNode;
  emptyIcon?: LucideIcon;
  isLoading?: boolean;
  skeletonRows?: number;
  onRowClick?: (item: T) => void;
  className?: string;
  containerClassName?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  mobileCardRender,
  emptyMessage = 'No records found',
  emptyIcon: EmptyIcon = Inbox,
  isLoading = false,
  skeletonRows = 5,
  onRowClick,
  className,
  containerClassName,
}: DataTableProps<T>) {
  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className={cn('w-full space-y-4', containerClassName)}>
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="border-b border-border bg-muted/40 px-6 py-3.5">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-24 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <div key={rIdx} className="grid grid-cols-4 gap-4 px-6 py-4 items-center">
                {Array.from({ length: 4 }).map((_, cIdx) => (
                  <div key={cIdx} className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3"
            >
              <div className="h-5 w-1/3 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-xs',
          containerClassName
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
          <EmptyIcon className="h-7 w-7 stroke-[1.5]" />
        </div>
        <div className="mt-4 text-base font-semibold text-foreground">
          {typeof emptyMessage === 'string' ? emptyMessage : 'No data available'}
        </div>
        {typeof emptyMessage !== 'string' && <div className="mt-2">{emptyMessage}</div>}
      </div>
    );
  }

  const renderCellValue = (column: Column<T>, item: T, index: number) => {
    if (column.cell) {
      return column.cell(item, index);
    }
    if (column.accessorKey) {
      const val = item[column.accessorKey];
      return val !== undefined && val !== null ? String(val) : '—';
    }
    return null;
  };

  return (
    <div className={cn('w-full', containerClassName)}>
      {/* ============================================================== */}
      {/* DESKTOP TABLE VIEW (visible on md and up)                     */}
      {/* ============================================================== */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
        <table className={cn('w-full text-left text-sm', className)}>
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={cn('px-6 py-3.5 whitespace-nowrap', col.headerClassName)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors duration-150 hover:bg-muted/30',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-6 py-4 text-foreground text-sm align-middle',
                      col.className
                    )}
                  >
                    {renderCellValue(col, item, rowIdx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* MOBILE CARDS VIEW (visible on mobile / below md)              */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((item, rowIdx) => {
          const key = keyExtractor(item, rowIdx);

          // If a custom card renderer is provided, use it
          if (mobileCardRender) {
            return (
              <div
                key={key}
                onClick={() => onRowClick?.(item)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {mobileCardRender(item, rowIdx)}
              </div>
            );
          }

          // Otherwise, build an automatic mobile card
          const regularCols = columns.filter(
            (c) => !c.hideOnMobile && !c.isAction
          );
          const actionCols = columns.filter(
            (c) => !c.hideOnMobile && c.isAction
          );

          return (
            <div
              key={key}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'rounded-2xl border border-border bg-card p-4 shadow-xs transition-shadow duration-150 hover:shadow-md space-y-3',
                onRowClick && 'cursor-pointer'
              )}
            >
              <div className="space-y-2.5 divide-y divide-border/60">
                {regularCols.map((col, colIdx) => {
                  const label =
                    col.mobileLabel ||
                    (typeof col.header === 'string' ? col.header : '');

                  return (
                    <div
                      key={colIdx}
                      className={cn(
                        'flex items-center justify-between gap-3 text-sm',
                        colIdx > 0 && 'pt-2.5'
                      )}
                    >
                      {label && (
                        <span className="text-xs font-medium text-muted-foreground shrink-0">
                          {label}
                        </span>
                      )}
                      <div className="text-right text-foreground font-medium truncate flex-1 flex justify-end">
                        {renderCellValue(col, item, rowIdx)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action column(s) placed at bottom of the card */}
              {actionCols.length > 0 && (
                <div className="pt-2 border-t border-border flex flex-wrap items-center justify-end gap-2">
                  {actionCols.map((col, cIdx) => (
                    <div key={cIdx}>{renderCellValue(col, item, rowIdx)}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DataTable;

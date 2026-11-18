'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartItem {
  month: string;
  revenue: number;
  bookings: number;
}

interface AdminActivityChartProps {
  data: ChartItem[];
  title?: string;
  subtitle?: string;
}

export function AdminActivityChart({
  data,
  title = 'Platform Revenue & Volume',
  subtitle = 'Monthly tracking of gross marketplace booking value and customer orders',
}: AdminActivityChartProps) {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState<'revenue' | 'bookings'>('revenue');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
        <div className="mt-2 h-4 w-72 bg-muted animate-pulse rounded-md" />
        <div className="mt-8 h-64 w-full bg-muted/40 animate-pulse rounded-xl" />
      </div>
    );
  }

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>

          {/* Metric Selector Toggle */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border shrink-0">
            <button
              onClick={() => setMetric('revenue')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                metric === 'revenue'
                  ? 'bg-card text-teal-700 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setMetric('bookings')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                metric === 'bookings'
                  ? 'bg-card text-teal-700 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bookings (#)
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-72 w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="adminBookingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={metric === 'revenue' ? (val) => `$${val}` : undefined}
                dx={-4}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as ChartItem;
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
                        <p className="text-xs font-bold text-foreground mb-1.5">{label}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-teal-600" />
                            <span className="text-muted-foreground">Gross Revenue:</span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(item.revenue)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-sky-600" />
                            <span className="text-muted-foreground">Bookings:</span>
                            <span className="font-semibold text-foreground">
                              {item.bookings} repairs
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {metric === 'revenue' ? (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminRevenueGrad)"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminBookingsGrad)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Operational Escrow Settlement: Real-time</span>
        <span className="font-medium text-teal-700">99.8% SLA Target Met</span>
      </div>
    </div>
  );
}

export default AdminActivityChart;

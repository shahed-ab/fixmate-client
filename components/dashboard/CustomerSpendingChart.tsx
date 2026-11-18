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
  requests: number;
  spent: number;
}

interface CustomerSpendingChartProps {
  data: ChartItem[];
  title?: string;
  subtitle?: string;
}

export function CustomerSpendingChart({
  data,
  title = 'Repair Spending & Requests',
  subtitle = 'Monthly breakdown of your service bookings and total expenditure',
}: CustomerSpendingChartProps) {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState<'spent' | 'requests'>('spent');

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

  const formatCurrency = (val: number) => `$${val}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        {/* Metric Selector Toggle */}
        <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border">
          <button
            onClick={() => setMetric('spent')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              metric === 'spent'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Spending ($)
          </button>
          <button
            onClick={() => setMetric('requests')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              metric === 'requests'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Requests (#)
          </button>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E2DA"
              opacity={0.6}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={metric === 'spent' ? formatCurrency : (v) => `${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value;
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
                      <p className="text-xs font-medium text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-teal-700">
                        {metric === 'spent' ? `$${val}` : `${val} repair requests`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {metric === 'spent' ? (
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#0F766E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendingGradient)"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#requestsGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CustomerSpendingChart;

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Search,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react';
import { getAdminPayments } from '@/lib/data';
import { Payment } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { PaymentBadge } from '@/components/PaymentBadge';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [apiTotalRevenue, setApiTotalRevenue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminPayments();
      setPayments(data.payments);
      setApiTotalRevenue(data.totalRevenue);
    } catch (err) {
      console.error('Failed to load platform transactions:', err);
      toast.error('Unable to fetch transaction records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filtered transactions
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const query = searchQuery.toLowerCase();
    return payments.filter((p) => {
      const txnMatch = p.transactionId.toLowerCase().includes(query);
      const serviceMatch = p.serviceTitle.toLowerCase().includes(query);
      const customerMatch =
        p.customerName.toLowerCase().includes(query) ||
        p.customerEmail.toLowerCase().includes(query);
      const techMatch =
        p.technicianName.toLowerCase().includes(query) ||
        p.technicianEmail.toLowerCase().includes(query);
      return txnMatch || serviceMatch || customerMatch || techMatch;
    });
  }, [payments, searchQuery]);

  // Aggregate Metrics for Header Banner
  const totalRevenue = useMemo(() => {
    if (apiTotalRevenue !== null && !searchQuery.trim()) {
      return apiTotalRevenue;
    }
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments, apiTotalRevenue, searchQuery]);

  const avgOrderValue = useMemo(() => {
    if (filteredPayments.length === 0) return 0;
    return totalRevenue / filteredPayments.length;
  }, [filteredPayments, totalRevenue]);

  // Columns definition
  const columns: Column<Payment>[] = [
    {
      header: 'Customer',
      cell: (p) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <User className="h-3 w-3 text-muted-foreground shrink-0" />
            {p.customerName}
          </p>
          <p className="text-muted-foreground truncate">{p.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Technician',
      cell: (p) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
            {p.technicianName}
          </p>
          <p className="text-muted-foreground truncate">{p.technicianEmail}</p>
        </div>
      ),
    },
    {
      header: 'Service',
      className: 'w-[260px]',
      cell: (p) => (
        <p className="font-medium text-foreground text-sm line-clamp-1">
          {p.serviceTitle}
        </p>
      ),
    },
    {
      header: 'Amount',
      cell: (p) => (
        <span className="font-bold text-sm text-foreground">
          ${p.amount.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Transaction ID',
      cell: (p) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
          {p.transactionId}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      cell: (p) => <PaymentBadge status="paid" />,
    },
    {
      header: 'Payment Date',
      cell: (p) => (
        <span className="text-xs text-muted-foreground">
          {new Date(p.paidAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Receipt className="h-3.5 w-3.5" />
            Settlement Engine • Immutable Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Financial Transactions & Escrow Logs
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Audit platform revenue, automated escrow releases, customer payouts, and dispute holds across regional repair clusters.
          </p>
        </div>
      </div>

      {/* Prominent Total Revenue Summary Above Table */}
      <div className="rounded-3xl border border-border bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
              Total Platform Volume
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight">
                ${isLoading ? '—' : totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                +16.8% vs last month
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-teal-950/40 border border-teal-600/40 px-3 py-1.5 text-xs text-teal-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Direct Escrow Safe
            </span>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-teal-700/60">
          <div>
            <span className="text-xs text-teal-200">Cleared Volume</span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">
              ${(totalRevenue * 0.88).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-teal-300">Technician Payouts</span>
          </div>
          <div>
            <span className="text-xs text-teal-200">Platform Take-rate</span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">
              ${(totalRevenue * 0.12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-teal-300">12% Service fee</span>
          </div>
          <div>
            <span className="text-xs text-teal-200">Transactions</span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">
              {payments.length}
            </p>
            <span className="text-[11px] text-teal-300">Completed Payments</span>
          </div>
          <div>
            <span className="text-xs text-teal-200">Average Order</span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">
              ${avgOrderValue.toFixed(2)}
            </p>
            <span className="text-[11px] text-teal-300">Per repair dispatch</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">
          Transaction Records ({filteredPayments.length})
        </h3>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search txn ID, service, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Transactions DataTable */}
      <DataTable
        data={filteredPayments}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        skeletonRows={5}
        emptyMessage={
          searchQuery
            ? `No transaction records match "${searchQuery}".`
            : 'No financial transaction records found.'
        }
        emptyIcon={Receipt}
        mobileCardRender={(p) => (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                  {p.transactionId}
                </span>
                <h4 className="font-semibold text-foreground text-sm mt-1">
                  {p.serviceTitle}
                </h4>
              </div>
              <PaymentBadge status="paid" />
            </div>

            <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium text-foreground">{p.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Technician:</span>
                <span className="font-medium text-foreground">{p.technicianName}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Date:</span>
                <span>
                  {new Date(p.paidAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-foreground">Total Settled:</span>
                <span className="text-teal-700">${p.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

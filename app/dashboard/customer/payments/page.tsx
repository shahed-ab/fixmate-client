'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Copy,
  Check,
  Receipt,
  Calendar,
} from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { getPayments } from '@/lib/data';
import { Payment } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { PaymentBadge } from '@/components/PaymentBadge';
import { StatsCard } from '@/components/StatsCard';
import { toast } from 'sonner';

export default function CustomerPaymentHistoryPage() {
  const { user } = useMockSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPayments() {
      try {
        setIsLoading(true);
        const data = await getPayments(user?.email);
        if (isMounted) {
          setPayments(data);
        }
      } catch (err) {
        console.error('Failed to load payment history:', err);
        toast.error('Unable to load payment history.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPayments();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const handleCopyTransactionId = (txnId: string) => {
    navigator.clipboard.writeText(txnId);
    setCopiedId(txnId);
    toast.success('Transaction ID copied to clipboard');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

  const columns: Column<Payment>[] = [
    {
      header: 'Service',
      mobileLabel: 'Service',
      cell: (p) => (
        <div>
          <p className="font-semibold text-foreground truncate max-w-[220px]">
            {p.serviceTitle}
          </p>
          <p className="text-xs text-muted-foreground">ID: {p.bookingId}</p>
        </div>
      ),
    },
    {
      header: 'Technician',
      mobileLabel: 'Technician',
      cell: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.technicianName}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {p.technicianEmail}
          </p>
        </div>
      ),
    },
    {
      header: 'Transaction ID',
      mobileLabel: 'Txn ID',
      cell: (p) => (
        <button
          onClick={() => handleCopyTransactionId(p.transactionId)}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition"
          title="Click to copy Transaction ID"
        >
          <span className="truncate max-w-[120px]">{p.transactionId}</span>
          {copiedId === p.transactionId ? (
            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
          )}
        </button>
      ),
    },
    {
      header: 'Date & Time',
      mobileLabel: 'Date',
      cell: (p) => {
        const dateStr = p.paidAt
          ? new Date(p.paidAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—';
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
            <span>{dateStr}</span>
          </div>
        );
      },
    },
    {
      header: 'Amount',
      mobileLabel: 'Amount',
      cell: (p) => (
        <span className="font-bold text-foreground">
          ${p.amount.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      mobileLabel: 'Status',
      className: 'text-right md:text-left',
      headerClassName: 'text-right md:text-left',
      cell: (p) => <PaymentBadge status={p.paymentStatus} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Payment History
        </h2>
        <p className="text-sm text-muted-foreground">
          View all completed repair invoices and Stripe payment receipts.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard
          title="Total Spent"
          value={isLoading ? '—' : `$${totalSpent.toFixed(2)}`}
          icon={DollarSign}
          description="Cumulative repair payments"
        />
        <StatsCard
          title="Completed Transactions"
          value={isLoading ? '—' : payments.length}
          icon={CreditCard}
          description="Verified paid repair orders"
        />
      </div>

      {/* Payments DataTable */}
      <DataTable
        data={payments}
        columns={columns}
        keyExtractor={(p) => p._id}
        isLoading={isLoading}
        emptyIcon={Receipt}
        emptyMessage="No payment records found. Completed and paid repair invoices will appear here."
      />
    </div>
  );
}

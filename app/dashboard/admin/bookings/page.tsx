'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ClipboardList,
  Search,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  User,
  Wrench,
} from 'lucide-react';
import { getAdminBookings } from '@/lib/data';
import { Booking } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { BookingDetailsModal } from '@/components/dashboard/BookingDetailsModal';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

type AdminStatusFilter =
  | 'all'
  | 'requested'
  | 'accepted'
  | 'in-progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export default function AdminAllBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Booking for Detailed Modal Inspection
  const [inspectingBooking, setInspectingBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAdminBookings(statusFilter);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
      toast.error('Unable to fetch platform bookings.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Client-side search filtering
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const query = searchQuery.toLowerCase();
    return bookings.filter((b) => {
      const idMatch = b._id.toLowerCase().includes(query);
      const titleMatch = b.serviceTitle.toLowerCase().includes(query);
      const customerMatch =
        b.customerName.toLowerCase().includes(query) ||
        b.customerEmail.toLowerCase().includes(query);
      const techMatch =
        b.technicianName.toLowerCase().includes(query) ||
        b.technicianEmail.toLowerCase().includes(query);
      return idMatch || titleMatch || customerMatch || techMatch;
    });
  }, [bookings, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter((b) =>
      ['requested', 'accepted', 'in-progress'].includes(b.status)
    ).length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const grossValue = bookings.reduce((sum, b) => sum + (b.finalAmount || b.basePrice || 0), 0);

    return { total, active, completed, grossValue };
  }, [bookings]);

  // Table Columns
  const columns: Column<Booking>[] = [
    {
      header: 'Service Details',
      className: 'w-[280px]',
      cell: (b) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border">
              #{b._id.slice(-6)}
            </span>
            <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md">
              {b.category}
            </span>
          </div>
          <p className="font-semibold text-foreground text-sm line-clamp-1 leading-snug">
            {b.serviceTitle}
          </p>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (b) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <User className="h-3 w-3 text-muted-foreground" />
            {b.customerName}
          </p>
          <p className="text-muted-foreground truncate">{b.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Technician',
      cell: (b) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-muted-foreground" />
            {b.technicianName}
          </p>
          <p className="text-muted-foreground truncate">{b.technicianEmail}</p>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      hideOnMobile: true,
      cell: (b) => (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{b.preferredDate}</span>
        </div>
      ),
    },
    {
      header: 'Final Amount',
      cell: (b) => (
        <span className="font-bold text-sm text-foreground">
          ${b.finalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Job Status',
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Payment',
      cell: (b) => <PaymentBadge status={b.paymentStatus} />,
    },
    {
      header: 'Audit',
      isAction: true,
      className: 'text-right',
      cell: (b) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInspectingBooking(b)}
          className="border-border text-foreground hover:bg-muted text-xs px-2.5 py-1 h-7.5 gap-1.5"
        >
          <Eye className="h-3.5 w-3.5 text-teal-700" />
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <ClipboardList className="h-3.5 w-3.5" />
            Central Dispatch System • Read-Only Audit Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            All Platform Bookings
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Audit and track live marketplace bookings across all service categories, customer dispatches, technician assignments, and escrow transactions.
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Volume"
          value={isLoading ? '—' : metrics.total}
          icon={ClipboardList}
          description="Cumulative repair requests"
        />
        <StatsCard
          title="Active Dispatches"
          value={isLoading ? '—' : metrics.active}
          icon={Clock}
          description="In progress & scheduled"
        />
        <StatsCard
          title="Completed Jobs"
          value={isLoading ? '—' : metrics.completed}
          icon={CheckCircle2}
          description="Successfully resolved repairs"
        />
        <StatsCard
          title="Platform Volume"
          value={isLoading ? '—' : `$${metrics.grossValue.toLocaleString()}`}
          icon={DollarSign}
          description="Cumulative booking value"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-muted/60 p-1.5 border border-border">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Bookings
          </button>
          <button
            onClick={() => setStatusFilter('requested')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'requested'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Requested
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'accepted'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'in-progress'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'completed'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search booking ID, customer, pro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Bookings DataTable */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        skeletonRows={6}
        emptyMessage={
          searchQuery
            ? `No bookings match "${searchQuery}".`
            : 'No bookings found in this status category.'
        }
        emptyIcon={ClipboardList}
        mobileCardRender={(b) => (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                  #{b._id.slice(-6)}
                </span>
                <h4 className="font-semibold text-foreground text-sm mt-1">
                  {b.serviceTitle}
                </h4>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={b.status} />
                <PaymentBadge status={b.paymentStatus} />
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium text-foreground">{b.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Technician:</span>
                <span className="font-medium text-foreground">{b.technicianName}</span>
              </div>
              <div className="flex justify-between">
                <span>Preferred Date:</span>
                <span>{b.preferredDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Settled Amount:</span>
                <span className="font-bold text-teal-700">${b.finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInspectingBooking(b)}
                className="text-xs px-3 py-1 h-7.5"
              >
                Inspect Details
              </Button>
            </div>
          </div>
        )}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={inspectingBooking}
        isOpen={!!inspectingBooking}
        onClose={() => setInspectingBooking(null)}
      />
    </div>
  );
}

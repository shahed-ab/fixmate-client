'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Search,
  Filter,
  CreditCard,
  XCircle,
  Plus,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { getMyBookings, cancelBooking, mockPayBooking } from '@/lib/data';
import { Booking, BookingStatus } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

type StatusFilter = 'all' | BookingStatus;

export default function MyBookingsPage() {
  const { user } = useMockSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Cancel Modal State
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Pay Now State
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await getMyBookings(user?.email);
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Unable to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.email]);

  // Handle Cancel Booking confirmation
  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    try {
      setIsCancelling(true);
      await cancelBooking(selectedBookingForCancel._id, user?.email);
      toast.success('Booking cancelled successfully.');
      setSelectedBookingForCancel(null);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel booking.';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Pay Now
  const handlePayNow = async (booking: Booking) => {
    try {
      setPayingBookingId(booking._id);
      /* replaced by Stripe in Phase 3 */
      await mockPayBooking(booking._id);
      toast.success(
        `Payment of $${booking.finalAmount || booking.basePrice} processed successfully!`
      );
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed.';
      toast.error(msg);
    } finally {
      setPayingBookingId(null);
    }
  };

  // Filter bookings based on search & tab
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === 'all' ? true : b.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.serviceTitle.toLowerCase().includes(q) ||
        b.technicianName.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Table Columns
  const columns: Column<Booking>[] = [
    {
      header: 'Service',
      mobileLabel: 'Service',
      cell: (b) => (
        <div className="flex items-center gap-3">
          {b.serviceImage ? (
            <img
              src={b.serviceImage}
              alt={b.serviceTitle}
              className="h-10 w-10 shrink-0 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <CalendarClock className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate max-w-[200px]">
              {b.serviceTitle}
            </p>
            <p className="text-xs text-muted-foreground">{b.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Technician',
      mobileLabel: 'Technician',
      cell: (b) => (
        <div>
          <p className="font-medium text-foreground">{b.technicianName}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {b.technicianEmail}
          </p>
        </div>
      ),
    },
    {
      header: 'Preferred Date',
      mobileLabel: 'Date',
      cell: (b) => {
        const dateStr = b.preferredDate
          ? new Date(b.preferredDate).toLocaleDateString('en-US', {
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
      header: 'Price',
      mobileLabel: 'Price',
      cell: (b) => (
        <span className="font-bold text-foreground">
          ${b.finalAmount || b.basePrice}
        </span>
      ),
    },
    {
      header: 'Status',
      mobileLabel: 'Status',
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Payment',
      mobileLabel: 'Payment',
      cell: (b) => <PaymentBadge status={b.paymentStatus} />,
    },
    {
      header: 'Action',
      isAction: true,
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (b) => {
        // 1. Cancelable only when status === 'requested'
        if (b.status === 'requested') {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedBookingForCancel(b)}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs h-8 px-3 font-semibold"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          );
        }

        // 2. Pay Now only when completed + unpaid
        if (b.status === 'completed' && b.paymentStatus === 'unpaid') {
          return (
            <Button
              size="sm"
              onClick={() => handlePayNow(b)}
              disabled={payingBookingId === b._id}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs h-8 px-3 font-semibold shadow-xs"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1" />
              {payingBookingId === b._id ? 'Processing...' : 'Pay Now'}
            </Button>
          );
        }

        // 3. Already paid
        if (b.paymentStatus === 'paid') {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
              <CheckCircle className="h-3 w-3" />
              Paid
            </span>
          );
        }

        return <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  const filterTabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Requested', value: 'requested' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            My Bookings
          </h2>
          <p className="text-sm text-muted-foreground">
            Track real-time status of your repairs and complete pending payments.
          </p>
        </div>
        <Link href="/services">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Book a Repair
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                statusFilter === tab.value
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service, tech..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Bookings DataTable */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        keyExtractor={(b) => b._id}
        isLoading={isLoading}
        emptyMessage={
          searchQuery || statusFilter !== 'all'
            ? 'No bookings found matching your filters.'
            : 'You have no repair bookings yet.'
        }
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedBookingForCancel)}
        onClose={() => setSelectedBookingForCancel(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
        title="Cancel Repair Request"
        description={
          <span>
            Are you sure you want to cancel your repair request for{' '}
            <strong className="text-foreground">
              {selectedBookingForCancel?.serviceTitle}
            </strong>
            ? This action cannot be undone.
          </span>
        }
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
      />
    </div>
  );
}

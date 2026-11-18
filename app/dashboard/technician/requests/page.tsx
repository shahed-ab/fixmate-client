'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle,
  XCircle,
  Play,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { getTechnicianBookings, updateBookingStatus } from '@/lib/data';
import { Booking, BookingStatus } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { MarkCompletedModal } from '@/components/dashboard/MarkCompletedModal';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'requested' | 'accepted' | 'in-progress' | 'completed';

export default function ManageRequestsPage() {
  const { user } = useMockSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Reject Confirmation State
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Complete Job Modal State
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);

  // Action Loading State per booking
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await getTechnicianBookings(user?.email);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load technician requests:', err);
      toast.error('Unable to load customer requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.email]);

  // Handle Accept (requested -> accepted)
  const handleAcceptRequest = async (booking: Booking) => {
    try {
      setActionLoadingId(booking._id);
      await updateBookingStatus(booking._id, 'accepted', {
        technicianEmail: user?.email,
      });
      toast.success(`Accepted request for ${booking.serviceTitle}.`);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept request.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Confirmation (requested -> rejected)
  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    try {
      setIsRejecting(true);
      await updateBookingStatus(rejectingBooking._id, 'rejected', {
        technicianEmail: user?.email,
      });
      toast.success(`Request from ${rejectingBooking.customerName} rejected.`);
      setRejectingBooking(null);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject request.';
      toast.error(msg);
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle Start Work (accepted -> in-progress)
  const handleStartWork = async (booking: Booking) => {
    try {
      setActionLoadingId(booking._id);
      await updateBookingStatus(booking._id, 'in-progress', {
        technicianEmail: user?.email,
      });
      toast.success(`Work started for ${booking.serviceTitle}!`);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start work.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Mark Completed (in-progress -> completed)
  const handleConfirmCompletion = async (bookingId: string, finalAmount: number) => {
    await updateBookingStatus(bookingId, 'completed', {
      finalAmount,
      technicianEmail: user?.email,
    });
    toast.success(`Repair completed! Final bill recorded as $${finalAmount}.`);
    setCompletingBooking(null);
    await fetchBookings();
  };

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesFilter =
        statusFilter === 'all' ? true : b.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.serviceTitle.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.customerPhone.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.problemDescription.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, statusFilter, searchQuery]);

  // Columns Configuration
  const columns: Column<Booking>[] = [
    {
      header: 'Service & Customer',
      mobileLabel: 'Service & Customer',
      cell: (b) => (
        <div className="space-y-1.5 max-w-xs">
          <div>
            <p className="font-semibold text-foreground truncate">
              {b.serviceTitle}
            </p>
            <span className="inline-flex items-center text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {b.category}
            </span>
          </div>

          <div className="space-y-0.5 text-xs text-muted-foreground border-t border-border/60 pt-1.5">
            <p className="font-medium text-foreground">{b.customerName}</p>
            <div className="flex items-center gap-1 truncate">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{b.customerPhone}</span>
            </div>
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{b.address}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Problem Description',
      mobileLabel: 'Problem',
      cell: (b) => (
        <div className="max-w-xs">
          <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
            {b.problemDescription}
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
      header: 'Price / Quote',
      mobileLabel: 'Price',
      cell: (b) => (
        <div>
          <span className="font-bold text-foreground">
            ${b.finalAmount || b.basePrice}
          </span>
          {b.status === 'completed' && (
            <span className="block text-[10px] text-muted-foreground">
              Final Amount
            </span>
          )}
        </div>
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
      header: 'Actions',
      isAction: true,
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (b) => {
        const isActionRunning = actionLoadingId === b._id;

        // 1. Requested: Accept or Reject
        if (b.status === 'requested') {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                size="sm"
                onClick={() => handleAcceptRequest(b)}
                disabled={isActionRunning}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs h-8 px-2.5 font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectingBooking(b)}
                disabled={isActionRunning}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 px-2.5 font-semibold"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>
            </div>
          );
        }

        // 2. Accepted: Start Work
        if (b.status === 'accepted') {
          return (
            <Button
              size="sm"
              onClick={() => handleStartWork(b)}
              disabled={isActionRunning}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8 px-3 font-semibold shadow-xs"
            >
              <Play className="h-3.5 w-3.5 mr-1 fill-current" />
              Start Work
            </Button>
          );
        }

        // 3. In Progress: Mark Completed
        if (b.status === 'in-progress') {
          return (
            <Button
              size="sm"
              onClick={() => setCompletingBooking(b)}
              disabled={isActionRunning}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 font-semibold shadow-xs"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Mark Completed
            </Button>
          );
        }

        // 4. Completed: Shows Payment Badge
        if (b.status === 'completed') {
          return (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle className="h-4 w-4" />
              <span>Finished</span>
            </div>
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
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Repair Requests
        </h2>
        <p className="text-sm text-muted-foreground">
          Review incoming requests, accept jobs, update progress, and invoice customers.
        </p>
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
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, problem..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Requests DataTable */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        keyExtractor={(b) => b._id}
        isLoading={isLoading}
        emptyIcon={ClipboardList}
        emptyMessage={
          searchQuery || statusFilter !== 'all'
            ? 'No requests found matching your filters.'
            : 'You currently have no repair requests assigned.'
        }
      />

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(rejectingBooking)}
        onClose={() => setRejectingBooking(null)}
        onConfirm={handleConfirmReject}
        isLoading={isRejecting}
        title="Reject Repair Request"
        description={
          <span>
            Are you sure you want to reject the repair request from{' '}
            <strong className="text-foreground">
              {rejectingBooking?.customerName}
            </strong>{' '}
            for <strong className="text-foreground">{rejectingBooking?.serviceTitle}</strong>?
            This will permanently mark the request as rejected.
          </span>
        }
        confirmText="Yes, Reject Request"
        cancelText="Keep Pending"
        variant="danger"
      />

      {/* Mark Completed Modal */}
      <MarkCompletedModal
        isOpen={Boolean(completingBooking)}
        booking={completingBooking}
        onClose={() => setCompletingBooking(null)}
        onConfirm={handleConfirmCompletion}
      />
    </div>
  );
}

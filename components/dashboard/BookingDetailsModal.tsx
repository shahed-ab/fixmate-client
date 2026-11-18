'use client';

import React, { useEffect, useCallback } from 'react';
import {
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Wrench,
  User,
  FileText,
} from 'lucide-react';
import { Booking } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { Button } from '@/components/Button';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
}: BookingDetailsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !booking) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-details-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pr-8 border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              #{booking._id}
            </span>
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {booking.category}
            </span>
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.paymentStatus} />
          </div>

          <h2
            id="booking-details-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            {booking.serviceTitle}
          </h2>
          <p className="text-xs text-muted-foreground">
            Created on {new Date(booking.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Content Grid */}
        <div className="py-6 space-y-6">
          {/* Customer & Technician Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="h-4 w-4 text-teal-700" />
                Customer Info
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{booking.customerName}</p>
                <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{booking.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{booking.customerPhone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technician Box */}
            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Wrench className="h-4 w-4 text-sky-700" />
                Assigned Technician
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{booking.technicianName}</p>
                <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{booking.technicianEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Scheduled: {booking.preferredDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="rounded-2xl border border-border p-4 bg-card space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="h-4 w-4 text-teal-700" />
              Customer Issue Description
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {booking.problemDescription}
            </p>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-2xl border border-border p-4 bg-muted/10 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base Service Rate</span>
              <span className="font-medium text-foreground">${booking.basePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-border pt-2">
              <span className="font-semibold text-foreground">Final Settled Amount</span>
              <span className="text-lg font-bold text-teal-700">
                ${booking.finalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BookingDetailsModal;

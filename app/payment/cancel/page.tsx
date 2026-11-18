'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  RotateCcw,
  Clock,
  ShieldCheck,
  Headphones,
  Lock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { getMyBookings } from '@/lib/data';
import { Booking } from '@/lib/types';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { PaymentBadge } from '@/components/PaymentBadge';

function PaymentCancelContent() {
  const searchParams = useSearchParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState(59 * 60 + 39); // 59m 39s timer

  useEffect(() => {
    async function loadLatestBooking() {
      try {
        const bookingsList = await getMyBookings();
        const bookingIdParam = searchParams.get('booking_id');

        let matched: Booking | undefined;
        if (bookingIdParam) {
          matched = bookingsList.find((b) => b._id === bookingIdParam);
        }

        if (!matched && bookingsList.length > 0) {
          // Find any unpaid completed or latest booking
          matched =
            bookingsList.find((b) => b.paymentStatus === 'unpaid') ||
            bookingsList[0];
        }

        if (matched) {
          setBooking(matched);
        }
      } catch (err) {
        console.error('Failed to load booking for cancelled payment:', err);
      }
    }

    loadLatestBooking();
  }, [searchParams]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayService =
    searchParams.get('service') ||
    booking?.serviceTitle ||
    'iPhone 13 Pro Max OLED Screen & Battery Replacement';

  const displayAmount = searchParams.get('amount')
    ? Number(searchParams.get('amount'))
    : booking?.finalAmount ?? 85.0;

  const displayBookingId =
    searchParams.get('booking_id') ||
    (booking?._id ? `#${booking._id.slice(-8)}` : 'BK-984210-FXM');

  return (
    <div className="py-12 sm:py-16 bg-muted/20 min-h-[85vh] flex items-center">
      <Container className="max-w-xl">
        <div className="space-y-6">
          {/* Top Status Pill */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800 border border-amber-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              PAYMENT STATUS: TRANSACTION CANCELLED • ESCROW RELEASED
            </span>
          </div>

          {/* Main Cancellation Card */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-8">
            {/* Warning Icon & Header */}
            <div className="text-center space-y-3">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
                <AlertTriangle className="h-9 w-9 stroke-[2.2]" />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  ✕
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Payment Cancelled
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                No charges were made. You can try again anytime or choose another payment method at technician arrival.
              </p>
            </div>

            {/* Booking Reference Box */}
            <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Booking Ref
                  </span>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {displayBookingId}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
                    CANCELLED
                  </span>
                  <PaymentBadge status="unpaid" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    Reserved Service
                  </span>
                  <h4 className="font-semibold text-foreground text-sm">
                    {displayService}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-muted-foreground">
                    Pending Total
                  </span>
                  <p className="text-xl font-bold text-foreground">
                    ${displayAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Slot Hold Notice */}
              <div className="flex items-center gap-2.5 rounded-xl bg-card p-3 border border-border text-xs text-muted-foreground">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Your technician slot remains reserved for the next{' '}
                  <strong className="text-foreground font-mono">
                    {formatTimer(timeLeft)}
                  </strong>
                  . Your card or mobile wallet has <strong>not</strong> been billed.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link href="/dashboard/customer/bookings" className="block w-full">
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 h-11">
                  <RotateCcw className="h-4 w-4" />
                  <span>Try Payment Again</span>
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-4 text-xs font-medium pt-1">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Home</span>
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/dashboard/customer/bookings"
                  className="text-teal-700 hover:text-teal-800 font-semibold transition"
                >
                  Select Cash on Service
                </Link>
              </div>
            </div>

            {/* Offline Support Banner */}
            <div className="flex items-center gap-3 rounded-2xl bg-muted/40 border border-border p-3.5 text-xs text-muted-foreground">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Headphones className="h-4 w-4" />
              </div>
              <p>
                Having trouble with online checkout? Call Dispatch Support directly at{' '}
                <strong className="text-foreground">+880 1700-FIXMATE</strong> for instant offline verification.
              </p>
            </div>
          </div>

          {/* Security & Escrow Guarantee Footer */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-teal-700" />
              PCI-DSS Level 1 Secure
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-teal-700" />
              Zero Unauthorized Charges
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-teal-700" />
              Escrow Protection Guarantee
            </span>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}

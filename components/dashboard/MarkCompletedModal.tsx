'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, DollarSign, X, Loader2, AlertCircle } from 'lucide-react';
import { Booking } from '@/lib/types';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

interface MarkCompletedModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (bookingId: string, finalAmount: number) => Promise<void>;
}

export function MarkCompletedModal({
  isOpen,
  booking,
  onClose,
  onConfirm,
}: MarkCompletedModalProps) {
  const [finalAmount, setFinalAmount] = useState<number | string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (booking) {
      setFinalAmount(booking.finalAmount || booking.basePrice || 50);
      setError('');
    }
  }, [booking]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
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
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(finalAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Final repair amount must be a positive number greater than $0.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onConfirm(booking._id, amountNum);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete job.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mark-completed-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!isLoading) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3
              id="mark-completed-title"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              Mark Job as Completed
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Confirm the final repair bill for this customer.
            </p>
          </div>
        </div>

        {/* Booking Brief Info */}
        <div className="mt-5 rounded-2xl bg-muted/40 p-4 border border-border space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-semibold text-foreground truncate max-w-[200px]">
              {booking.serviceTitle}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-semibold text-foreground">
              {booking.customerName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Quote:</span>
            <span className="font-semibold text-foreground">
              ${booking.basePrice}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground">
              Final Amount ($ USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                min="1"
                value={finalAmount}
                onChange={(e) => {
                  setFinalAmount(e.target.value);
                  setError('');
                }}
                placeholder="50.00"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Include any parts replaced or additional labor agreed with the customer.
            </p>
            {error && (
              <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-teal-700 hover:bg-teal-800 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Repair
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MarkCompletedModal;

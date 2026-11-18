'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Download,
  Copy,
  Check,
  CreditCard,
  Wrench,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import { getPayments } from '@/lib/data';
import { Payment } from '@/lib/types';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load latest payment from mock data or URL params
  useEffect(() => {
    async function loadPaymentDetails() {
      try {
        setIsLoading(true);
        const paymentsList = await getPayments();

        // Check if query params specify booking or transaction
        const txnParam = searchParams.get('txn') || searchParams.get('transaction_id');
        const bookingParam = searchParams.get('booking_id');

        let matched: Payment | undefined;
        if (txnParam) {
          matched = paymentsList.find((p) => p.transactionId === txnParam);
        } else if (bookingParam) {
          matched = paymentsList.find((p) => p.bookingId === bookingParam);
        }

        if (!matched && paymentsList.length > 0) {
          // Default to latest recorded payment
          matched = paymentsList[0];
        }

        if (matched) {
          setPayment(matched);
        }
      } catch (err) {
        console.error('Failed to load payment details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPaymentDetails();
  }, [searchParams]);

  // Derived or fallback data
  const paramAmount = searchParams.get('amount');
  const paramTxn = searchParams.get('txn') || searchParams.get('transaction_id');
  const paramService = searchParams.get('service');

  const displayAmount = paramAmount
    ? Number(paramAmount)
    : payment?.amount ?? 85.0;

  const displayTxnId = paramTxn
    ? paramTxn
    : payment?.transactionId ?? 'TXN-984210-FXM';

  const displayService = paramService
    ? paramService
    : payment?.serviceTitle ?? 'iPhone 13 Pro Max OLED Screen & Battery Replacement';

  const displayTechName = payment?.technicianName ?? 'Tanvir Ahmed';

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(displayTxnId);
    setCopiedTxn(true);
    toast.success('Transaction ID copied to clipboard');
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handleDownloadInvoice = () => {
    toast.info('Generating official receipt PDF...');
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
          <p className="text-sm font-medium text-muted-foreground">
            Verifying escrow clearance...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-muted/20 min-h-[85vh] flex items-center">
      <Container className="max-w-2xl">
        <div className="space-y-6">
          {/* Top Escrow Status Pill */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              ESCROW CLEARANCE COMPLETE • 90-Day Warranty Active
            </span>
          </div>

          {/* Main Success Receipt Card */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-8">
            {/* Success Icon & Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
                <Check className="h-3.5 w-3.5 text-teal-700" />
                Payment Confirmed
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Payment Successful
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Funds safely released from FixMate Escrow to your technician upon hardware sign-off and verification.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="rounded-2xl border border-border bg-muted/20 p-5 sm:p-6 space-y-5">
              {/* Repaired Service & Amount */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-border">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Repaired Service
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    {displayService}
                  </h3>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Paid
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-teal-700">
                    ${displayAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Technician Verification Box */}
              <div className="flex items-center justify-between rounded-xl bg-card p-3 border border-border shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-200">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">
                        {displayTechName}
                      </p>
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Master Certified Technician • #FX-884
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md">
                    5.0 ★ (412 jobs)
                  </span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-2 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>Diagnostic & Labor Charge</span>
                  <span className="text-foreground font-medium">
                    ${(displayAmount * 0.55).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>OEM Spec Replacement Components</span>
                  <span className="text-foreground font-medium">
                    ${(displayAmount * 0.45).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-teal-700 font-medium">
                  <span className="flex items-center gap-1">
                    FixMate Platform & Escrow Guarantee
                    <span className="rounded-md bg-teal-100 text-teal-800 text-[9px] font-bold px-1 py-0.2">
                      PROMO
                    </span>
                  </span>
                  <span>$0.00</span>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
                <div>
                  <span className="text-muted-foreground">Transaction ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-foreground">
                      {displayTxnId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTxn}
                      className="text-muted-foreground hover:text-foreground transition p-0.5 rounded"
                      title="Copy transaction ID"
                    >
                      {copiedTxn ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-muted-foreground">Date & Settlement Time</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • Settled
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Billing Method</span>
                  <p className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="h-3.5 w-3.5 text-teal-700" />
                    Secured Card ending in •••• 4028
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-muted-foreground">Disbursement Status</span>
                  <p className="font-semibold text-emerald-700 mt-0.5">
                    Immediate Escrow Release
                  </p>
                </div>
              </div>
            </div>

            {/* 90-Day Warranty Callout */}
            <div className="flex items-start gap-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 p-4 text-xs text-teal-950">
              <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-teal-900">
                  90-Day FixMate Warranty Activated
                </p>
                <p className="text-teal-800/90 leading-relaxed">
                  If replaced components show irregularities or malfunction, request an instant zero-cost technician revisit through your customer portal.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/dashboard/customer/bookings" className="w-full sm:flex-1">
                <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 h-11">
                  <span>Go to My Bookings</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadInvoice}
                className="w-full sm:w-auto gap-2 h-11 border-border text-foreground hover:bg-muted"
              >
                <Download className="h-4 w-4 text-teal-700" />
                <span>Download Invoice PDF</span>
              </Button>
            </div>
          </div>

          {/* Help Support Footer */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Need immediate post-repair support? Contact Dispatch Support</p>
            <div className="flex items-center justify-center gap-3 font-medium text-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-teal-700" />
                +880 1700-FIXMATE
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-teal-700" />
                support@fixmate.com
              </span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  MapPin,
  Lock,
  X,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Service } from '@/lib/types';
import { Button } from '@/components/Button';
import { useMockSession } from '@/lib/mock-session';
import { createBooking } from '@/lib/data';
import { cn } from '@/lib/utils';

interface BookingSidebarProps {
  service: Service;
}

export function BookingSidebar({ service }: BookingSidebarProps) {
  const router = useRouter();
  const { user, role } = useMockSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal form states
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');
  const [todayMinDate, setTodayMinDate] = useState('');

  // Field validation error states
  const [errors, setErrors] = useState<{
    phone?: string;
    address?: string;
    preferredDate?: string;
    description?: string;
  }>({});

  // Ensure SSR safety for today date string
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setTodayMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Pre-fill phone and address if user has them saved
  useEffect(() => {
    if (user?.phone && !phone) setPhone(user.phone);
    if (user?.area && !address) setAddress(user.area);
  }, [user, phone, address]);

  const validateForm = () => {
    const errs: typeof errors = {};

    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (phone.trim().length < 7) {
      errs.phone = 'Please provide a valid phone number.';
    }

    if (!address.trim()) {
      errs.address = 'Service delivery address is required.';
    } else if (address.trim().length < 5) {
      errs.address = 'Address must be at least 5 characters.';
    }

    if (!preferredDate) {
      errs.preferredDate = 'Please select a preferred service date.';
    } else if (todayMinDate && preferredDate < todayMinDate) {
      errs.preferredDate = 'Preferred date must be today or a future date.';
    }

    if (!description.trim()) {
      errs.description = 'Problem description is required.';
    } else if (description.trim().length < 20) {
      errs.description = `Problem description must be at least 20 characters (current: ${description.trim().length}).`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) return;

    try {
      setIsSubmitting(true);

      await createBooking({
        serviceId: service._id,
        serviceTitle: service.title,
        serviceImage: service.image,
        category: service.category,
        basePrice: service.basePrice,
        technicianName: service.technicianName,
        technicianEmail: service.technicianEmail,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: phone.trim(),
        address: address.trim(),
        preferredDate: new Date(preferredDate).toISOString(),
        problemDescription: description.trim(),
      });

      setIsModalOpen(false);
      setDescription('');

      toast.success('Repair request submitted successfully!', {
        description: 'Assigned technician will review and confirm your schedule.',
        action: {
          label: 'View in My Bookings',
          onClick: () => router.push('/dashboard/customer/bookings'),
        },
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to submit repair request.';

      if (
        errorMsg.toLowerCase().includes('already have an active request') ||
        errorMsg.toLowerCase().includes('active request')
      ) {
        toast.error('You already have an active request for this service.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCustomer = role === 'customer';
  const isTechnicianOrAdmin = role === 'technician' || role === 'admin';
  const isGuest = role === 'guest' || !user;

  return (
    <>
      <div className="sticky top-24 space-y-4">
        {/* Main Price & Order Card */}
        <div className="rounded-3xl bg-white border border-border/80 shadow-md p-6 space-y-6">
          <div className="space-y-1 pb-4 border-b border-border/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              STANDARD REPAIR PACKAGE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">
                ${service.basePrice}
              </span>
              <span className="text-xs text-muted-foreground font-medium">USD base price</span>
            </div>
            <p className="text-xs text-teal-700 font-medium pt-1">
              ✓ Includes parts, baseline diagnostics, gasket & labor
            </p>
          </div>

          {/* Quick Specs */}
          <div className="space-y-3.5 text-xs text-foreground/80">
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Estimated Turnaround</p>
                <p className="text-muted-foreground">{service.estimatedDuration}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Wrench className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Service Mode</p>
                <p className="text-muted-foreground">{service.serviceMode}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Service Area</p>
                <p className="text-muted-foreground">{service.serviceArea}</p>
              </div>
            </div>
          </div>

          {/* Guarantee Bullets */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-teal-700 shrink-0" />
              <span>Free cancellation while status is &ldquo;requested&rdquo;</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-700 shrink-0" />
              <span>90-Day complete parts & labor guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-teal-700 shrink-0" />
              <span>Pay only after repair is completed and tested</span>
            </div>
          </div>

          {/* Action Button & Role Handling */}
          <div className="space-y-2.5 pt-2">
            {isGuest ? (
              <Button asChild size="lg" className="w-full text-sm font-bold shadow-md">
                <Link href={`/sign-in?callbackUrl=/services/${service._id}`}>
                  Sign in to Request Repair
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            ) : isTechnicianOrAdmin ? (
              <div className="space-y-2">
                <Button
                  disabled
                  size="lg"
                  className="w-full text-sm font-bold opacity-60 cursor-not-allowed bg-zinc-300 text-zinc-600"
                >
                  <Lock className="h-4 w-4 mr-1.5" />
                  Request Repair
                </Button>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-medium text-center justify-center">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Only customers can request a repair.</span>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="w-full text-sm font-bold shadow-md"
              >
                <Calendar className="h-4 w-4 mr-1.5" />
                Request Repair
              </Button>
            )}

            <p className="text-[11px] text-center text-muted-foreground leading-tight flex items-center justify-center gap-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span>Zero advance deposit required</span>
            </p>
          </div>
        </div>

        {/* Live Help Callout */}
        <div className="p-4 rounded-2xl bg-white border border-border/80 shadow-xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">Need quick assistance?</p>
              <p className="text-[11px] text-muted-foreground">+1 (800) FIX-MATE</p>
            </div>
          </div>
          <a
            href="tel:+18003496283"
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-semibold text-foreground text-xs transition-colors shrink-0"
          >
            Call Us
          </a>
        </div>
      </div>

      {/* =========================================================================
          REQUEST REPAIR MODAL (CUSTOMER ACCESS)
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-border shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  BOOKING REQUEST
                </span>
                <h3 className="text-xl font-extrabold text-foreground leading-tight">
                  Request Appliance Repair
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {service.title} (${service.basePrice})
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-5">
              {/* Customer Name & Email (Read-Only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border/70 text-xs text-foreground cursor-not-allowed font-medium select-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border/70 text-xs text-foreground cursor-not-allowed font-medium select-none truncate"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Phone Number *</span>
                  <span className="text-[10px] text-muted-foreground">For technician SMS/Call</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="+1 (555) 000-0000"
                  className={cn(
                    'w-full h-10 px-3 rounded-xl bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all',
                    errors.phone ? 'border-destructive ring-1 ring-destructive' : 'border-border'
                  )}
                />
                {errors.phone && (
                  <p className="text-[11px] text-destructive font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Service Address / Workshop Drop-off Location *</span>
                  <span className="text-[10px] text-muted-foreground">{service.serviceMode}</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  placeholder="Street address, apartment or suite number, borough, NY"
                  className={cn(
                    'w-full h-10 px-3 rounded-xl bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all',
                    errors.address ? 'border-destructive ring-1 ring-destructive' : 'border-border'
                  )}
                />
                {errors.address && (
                  <p className="text-[11px] text-destructive font-medium">{errors.address}</p>
                )}
              </div>

              {/* Preferred Service Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Preferred Service Date *</span>
                  <span className="text-[10px] text-muted-foreground">Today or later</span>
                </label>
                <input
                  type="date"
                  min={todayMinDate}
                  value={preferredDate}
                  onChange={(e) => {
                    setPreferredDate(e.target.value);
                    if (errors.preferredDate)
                      setErrors((prev) => ({ ...prev, preferredDate: undefined }));
                  }}
                  className={cn(
                    'w-full h-10 px-3 rounded-xl bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer',
                    errors.preferredDate
                      ? 'border-destructive ring-1 ring-destructive'
                      : 'border-border'
                  )}
                />
                {errors.preferredDate && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.preferredDate}
                  </p>
                )}
              </div>

              {/* Problem Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Problem Description *</span>
                  <span
                    className={cn(
                      'text-[10px] font-mono',
                      description.trim().length >= 20 ? 'text-teal-700' : 'text-muted-foreground'
                    )}
                  >
                    {description.trim().length}/20 min chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description)
                      setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  placeholder="Describe device symptoms, error codes, noise, power condition, or damage..."
                  className={cn(
                    'w-full p-3 rounded-xl bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none',
                    errors.description
                      ? 'border-destructive ring-1 ring-destructive'
                      : 'border-border'
                  )}
                />
                {errors.description && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Price Overview Banner */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-foreground block">Estimated Baseline Price</span>
                  <span className="text-[11px] text-muted-foreground">Pay upon job inspection</span>
                </div>
                <span className="text-lg font-black text-foreground">
                  ${service.basePrice}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 font-bold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Confirm Request'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default BookingSidebar;

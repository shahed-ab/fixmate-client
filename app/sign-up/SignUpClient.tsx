'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Wrench,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { authClient, useSession } from '@/lib/auth-client';
import { signUpSchema, SignUpFormValues } from '@/lib/validations/auth';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SignUpClientProps {
  callbackUrl?: string;
}

export function SignUpClient({ callbackUrl: initialCallbackUrl }: SignUpClientProps) {
  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <SignUpContent initialCallbackUrl={initialCallbackUrl} />
    </Suspense>
  );
}

function SignUpSkeleton() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 animate-pulse">
      <div className="w-full max-w-5xl h-[650px] bg-muted/40 rounded-3xl" />
    </div>
  );
}

function SignUpContent({ initialCallbackUrl }: { initialCallbackUrl?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = initialCallbackUrl || searchParams.get('callbackUrl') || undefined;

  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side fallback redirect if session becomes active
  useEffect(() => {
    if (!sessionLoading && user) {
      const destination =
        callbackUrl ||
        (role === 'admin'
          ? '/dashboard/admin'
          : role === 'technician'
          ? '/dashboard/technician'
          : '/dashboard/customer');
      router.replace(destination);
    }
  }, [user, role, sessionLoading, callbackUrl, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'customer',
    },
    mode: 'onChange',
  });

  const selectedRole = watch('role');
  const watchedPassword = watch('password') || '';

  // Live password validation hints
  const hasMinLen = watchedPassword.length >= 6;
  const hasUpper = /[A-Z]/.test(watchedPassword);
  const hasLower = /[a-z]/.test(watchedPassword);

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await authClient.signUp.email({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role as UserRole,
      });

      if (res.error) {
        toast.error(res.error.message || 'Could not complete registration.', {
          description: 'Please review your information and try again.',
        });
        return;
      }

      toast.success('Account created successfully!', {
        description: `Welcome to FixMate, ${data.name}!`,
      });

      const destination =
        callbackUrl ||
        (data.role === 'technician'
          ? '/dashboard/technician'
          : '/dashboard/customer');

      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not complete registration.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8 md:py-14 px-4 sm:px-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-border/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* =========================================================================
            LEFT HERO BRAND BANNER (DEEP TEAL)
            ========================================================================= */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#094B46] via-[#0F766E] to-[#0A3D39] text-white p-10 flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Logo asLink={true} className="[&_span]:text-white [&_.text-primary]:text-teal-300" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold tracking-wider uppercase text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              <span>Certified Repair Platform</span>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                Precision diagnostics. Expert hands.
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-sm">
                On-demand device and home appliance repair engineered for dependability,
                transparent pricing, and rapid turnaround.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/15 flex items-center justify-between text-[11px] text-teal-200/80 relative z-10">
            <span>Reliable Workshop Ergonomics</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Dispatch
            </span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT FORM CONTAINER
            ========================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Header */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Fast Account Setup</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Join thousands of satisfied device owners and certified repair masters.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Role Selection Cards (Customer vs Technician only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  I want to join as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Customer Role Card */}
                  <button
                    type="button"
                    onClick={() => setValue('role', 'customer', { shouldValidate: true })}
                    className={cn(
                      'relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer',
                      selectedRole === 'customer'
                        ? 'bg-teal-50/50 border-primary ring-1 ring-primary shadow-xs'
                        : 'bg-white border-border hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          'h-8 w-8 rounded-xl flex items-center justify-center',
                          selectedRole === 'customer'
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <User className="h-4 w-4" />
                      </div>
                      {selectedRole === 'customer' && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Customer</p>
                      <p className="text-[11px] text-muted-foreground">I need repairs</p>
                    </div>
                  </button>

                  {/* Technician Role Card */}
                  <button
                    type="button"
                    onClick={() => setValue('role', 'technician', { shouldValidate: true })}
                    className={cn(
                      'relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer',
                      selectedRole === 'technician'
                        ? 'bg-teal-50/50 border-primary ring-1 ring-primary shadow-xs'
                        : 'bg-white border-border hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          'h-8 w-8 rounded-xl flex items-center justify-center',
                          selectedRole === 'technician'
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Wrench className="h-4 w-4" />
                      </div>
                      {selectedRole === 'technician' && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Technician</p>
                      <p className="text-[11px] text-muted-foreground">I offer repair services</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    className={cn(
                      'w-full h-11 pl-10 pr-3 rounded-xl bg-background border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all',
                      errors.name ? 'border-destructive ring-1 ring-destructive' : 'border-border'
                    )}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="sarah.jenkins@example.com"
                    className={cn(
                      'w-full h-11 pl-10 pr-3 rounded-xl bg-background border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all',
                      errors.email ? 'border-destructive ring-1 ring-destructive' : 'border-border'
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className={cn(
                      'w-full h-11 pl-10 pr-10 rounded-xl bg-background border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all',
                      errors.password ? 'border-destructive ring-1 ring-destructive' : 'border-border'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>
                )}

                {/* Password Rule Validation Hints */}
                <div className="flex flex-wrap gap-3 pt-1 text-[11px]">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-medium transition-colors',
                      hasMinLen ? 'text-teal-700 font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {hasMinLen ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    6+ characters
                  </span>

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-medium transition-colors',
                      hasUpper ? 'text-teal-700 font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {hasUpper ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    1 Uppercase
                  </span>

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-medium transition-colors',
                      hasLower ? 'text-teal-700 font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {hasLower ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    1 Lowercase
                  </span>
                </div>
              </div>

              {/* Trust Box */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block">Workshop ESD Safe & Tested Parts</strong>
                  All repairs backed by 90-day comprehensive coverage and verified technicians.
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full font-bold shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                By signing up, you agree to FixMate&apos;s{' '}
                <Link href="/about" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/about" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Link to Sign In */}
              <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
                Already have an account?{' '}
                <Link
                  href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/sign-in'}
                  className="font-bold text-primary hover:text-primary-hover hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

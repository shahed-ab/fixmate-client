'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { authClient, useSession } from '@/lib/auth-client';
import { signInSchema, SignInFormValues } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

interface SignInClientProps {
  callbackUrl?: string;
}

export function SignInClient({ callbackUrl: initialCallbackUrl }: SignInClientProps) {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInContent initialCallbackUrl={initialCallbackUrl} />
    </Suspense>
  );
}

function SignInSkeleton() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 animate-pulse">
      <div className="w-full max-w-5xl h-[650px] bg-muted/40 rounded-3xl" />
    </div>
  );
}

function SignInContent({ initialCallbackUrl }: { initialCallbackUrl?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = initialCallbackUrl || searchParams.get('callbackUrl') || undefined;

  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      window.location.assign(destination);
    }
  }, [user, role, sessionLoading, callbackUrl]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await authClient.signIn.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (res.error) {
        toast.error(res.error.message || 'Invalid email or password.', {
          description: 'Please check your credentials or click a demo account below.',
        });
        return;
      }

      toast.success('Signed in successfully!', {
        description: 'Welcome back to your FixMate workbench.',
      });

      // Fetch fresh session to know user's role for routing
      const sessionRes = await authClient.getSession();
      const activeRole =
        (res.data?.user as { role?: string } | undefined)?.role ||
        (sessionRes.data?.user as { role?: string } | undefined)?.role ||
        'customer';

      const destination =
        callbackUrl ||
        (activeRole === 'admin'
          ? '/dashboard/admin'
          : activeRole === 'technician'
          ? '/dashboard/technician'
          : '/dashboard/customer');

      window.location.assign(destination);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const callback = callbackUrl || '/dashboard/customer';
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: callback,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Google sign in failed.';
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  const handleAutoFill = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
    toast.info('Demo credentials auto-filled. Click Sign In to continue.');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8 md:py-14 px-4 sm:px-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-border/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* =========================================================================
            LEFT HERO BRAND BANNER (DEEP TEAL GRADIENT)
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

            <div className="space-y-2 pt-2">
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                Sign In to Your Workbench.
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-sm">
                Track ongoing diagnostics, review upfront quotes, or manage your service
                requests with guaranteed peace of mind.
              </p>
            </div>

            {/* 3 Value Cards matching mockup */}
            <div className="space-y-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
                <Activity className="h-4 w-4 text-teal-300 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-white">Real-time Telemetry & Diagnostics</p>
                  <p className="text-[11px] text-teal-100/80 leading-relaxed">
                    Verify voltage tolerances, board-level photos, and diagnostic traces direct from certified technicians.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-teal-300 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-white">90-Day Comprehensive Warranty</p>
                  <p className="text-[11px] text-teal-100/80 leading-relaxed">
                    Genuine OEM-grade replacement modules protected with seamless dispatch guarantee.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-3">
                <Layers className="h-4 w-4 text-teal-300 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-white">Direct Escrow Protection</p>
                  <p className="text-[11px] text-teal-100/80 leading-relaxed">
                    Funds remain safely parked in escrow and release strictly upon your final hardware sign-off.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-teal-200/80 relative z-10">
            <span>Reliable Workshop Ergonomics</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Dispatch Engine
            </span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT FORM CONTAINER & DEMO ACCOUNTS
            ========================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center space-y-6">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Header */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Enter your FixMate credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="name@example.com"
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <span className="text-[11px] text-muted-foreground cursor-default">
                    Forgot password?
                  </span>
                </div>
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
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 rounded-md border-border text-primary focus:ring-primary cursor-pointer accent-teal-700"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs text-foreground/80 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
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
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground">
                  <span className="bg-white px-2">OR</span>
                </div>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-border hover:bg-muted/40 text-xs font-semibold text-foreground flex items-center justify-center gap-2.5 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-teal-600/60 border-t-teal-600 animate-spin" />
                    Connecting with Google...
                  </span>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
                New to FixMate?{' '}
                <Link
                  href={callbackUrl ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/sign-up'}
                  className="font-bold text-primary hover:text-primary-hover hover:underline"
                >
                  Sign Up
                </Link>
              </div>
            </form>

            {/* =========================================================================
                DEMO ACCOUNTS QUICK-FILL CARDS
                ========================================================================= */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <KeyRound className="h-3.5 w-3.5 text-teal-700" />
                  Demo Accounts
                </span>
                <span className="text-[10px] text-muted-foreground">Click to auto-fill</span>
              </div>

              <div className="space-y-1.5">
                {/* Admin Demo */}
                <button
                  type="button"
                  onClick={() => handleAutoFill('admin@fixmate.io')}
                  className="w-full p-2.5 rounded-xl bg-white border border-border/70 hover:border-purple-300 hover:bg-purple-50/40 text-left flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                      Admin
                    </span>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-purple-900 truncate">
                        admin@fixmate.io
                      </p>
                      <p className="text-[10px] text-muted-foreground">Platform dispatch & operations</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-700 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Technician Demo */}
                <button
                  type="button"
                  onClick={() => handleAutoFill('alex.technician@fixmate.io')}
                  className="w-full p-2.5 rounded-xl bg-white border border-border/70 hover:border-sky-300 hover:bg-sky-50/40 text-left flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800">
                      Technician
                    </span>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-sky-900 truncate">
                        alex.technician@fixmate.io
                      </p>
                      <p className="text-[10px] text-muted-foreground">Master HVAC & appliance specialist</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-700 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Customer Demo */}
                <button
                  type="button"
                  onClick={() => handleAutoFill('sarah.customer@fixmate.io')}
                  className="w-full p-2.5 rounded-xl bg-white border border-border/70 hover:border-teal-300 hover:bg-teal-50/40 text-left flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                      Customer
                    </span>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-teal-900 truncate">
                        sarah.customer@fixmate.io
                      </p>
                      <p className="text-[10px] text-muted-foreground">Downtown appliance & device owner</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-700 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

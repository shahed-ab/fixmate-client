'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Wrench,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  PieChart,
} from 'lucide-react';
import { getStats, getAdminServices, setApproval } from '@/lib/data';
import { AdminStats, Service } from '@/lib/types';
import { StatsCard } from '@/components/StatsCard';
import { AdminActivityChart } from '@/components/dashboard/AdminActivityChart';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reject confirmation state
  const [rejectingService, setRejectingService] = useState<Service | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, servicesData] = await Promise.all([
        getStats('admin'),
        getAdminServices('pending'),
      ]);

      setStats(statsData as AdminStats);
      setPendingServices(servicesData.slice(0, 4));
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      toast.error('Unable to load administrative metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = async (service: Service) => {
    try {
      setActionLoadingId(service._id);
      await setApproval(service._id, 'approved');
      toast.success(`"${service.title}" has been approved and published.`);
      await loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve service.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingService) return;
    try {
      setIsProcessingAction(true);
      await setApproval(rejectingService._id, 'rejected');
      toast.success(`"${rejectingService.title}" was rejected.`);
      setRejectingService(null);
      await loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject service.';
      toast.error(msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-teal-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-800/80 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-600/50">
              <ShieldCheck className="h-3 w-3" />
              Operational Registry
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              99.98% System Live
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Admin Executive Dashboard
          </h1>
          <p className="text-sm text-teal-100/90 max-w-2xl leading-relaxed">
            Monitor platform liquidity, review technician credentials, and clear service submissions across all regional repair hubs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/dashboard/admin/services">
            <Button
              variant="secondary"
              className="bg-white text-teal-950 hover:bg-teal-50 border-white shadow-sm font-semibold gap-2"
            >
              <Clock className="h-4 w-4" />
              Review Clearances
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button
              variant="outline"
              className="bg-teal-900/60 text-white border-teal-700/60 hover:bg-teal-900/90 hover:text-white font-semibold"
            >
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Platform Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={isLoading ? '—' : stats?.totalUsers ?? 0}
          icon={Users}
          description="Registered consumer & pro accounts"
        />
        <StatsCard
          title="Verified Technicians"
          value={isLoading ? '—' : stats?.totalTechnicians ?? 0}
          icon={Wrench}
          description="Active repair specialists"
        />
        <StatsCard
          title="Pending Clearances"
          value={isLoading ? '—' : stats?.pendingServices ?? 0}
          icon={Clock}
          description="Awaiting moderation review"
        />
        <StatsCard
          title="Gross Revenue"
          value={isLoading ? '—' : `$${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          description="Cumulative marketplace volume"
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Area Chart: 2 cols */}
        <div className="lg:col-span-2">
          <AdminActivityChart
            data={stats?.chartData || []}
            title="Revenue & Booking Velocity"
            subtitle="Monthly trajectory of gross platform revenue and repair volumes"
          />
        </div>

        {/* Status Breakdown Card: 1 col */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Bookings Distribution
              </h3>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-teal-700/20 bg-muted/20">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-foreground">
                    {stats?.totalBookings ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Bookings
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Completed Repairs
                </span>
                <span className="font-semibold text-foreground">62%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  In Progress & Dispatched
                </span>
                <span className="font-semibold text-foreground">18%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Accepted & Scheduled
                </span>
                <span className="font-semibold text-foreground">12%</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Pending Dispatch
                </span>
                <span className="font-semibold text-foreground">8%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link
              href="/dashboard/admin/bookings"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center justify-between group"
            >
              <span>Audit all platform bookings</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Service Approvals Quick Action Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  Pending Service Approvals
                </h3>
                {pendingServices.length > 0 && (
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5">
                    {pendingServices.length} Awaiting
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Technical audits required before listings become bookable by consumers.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/admin/services"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5"
          >
            <span>View Full Directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Services List / Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : pendingServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-sm font-semibold text-foreground">
              All Clear! No Pending Submissions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Every submitted service has been reviewed and cleared.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pendingServices.map((service) => (
              <div
                key={service._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200 font-bold text-sm">
                    {service.category.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        {service.category}
                      </span>
                      <StatusBadge status="pending" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(service.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="font-semibold text-foreground text-sm sm:text-base">
                      {service.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Tech: <strong className="text-foreground">{service.technicianName}</strong></span>
                      <span>Area: {service.serviceArea}</span>
                      <span>Base Rate: <strong className="text-teal-700">${service.basePrice.toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Approve / Reject buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(service)}
                    disabled={actionLoadingId === service._id}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-3.5 py-1.5 h-8 gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingService(service)}
                    disabled={actionLoadingId === service._id}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs px-3.5 py-1.5 h-8 gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!rejectingService}
        onClose={() => setRejectingService(null)}
        onConfirm={handleConfirmReject}
        title="Reject Service Offering?"
        description={
          rejectingService ? (
            <span>
              Are you sure you want to reject <strong>&ldquo;{rejectingService.title}&rdquo;</strong> submitted by {rejectingService.technicianName}? The technician will need to revise the submission.
            </span>
          ) : undefined
        }
        confirmText="Confirm Rejection"
        cancelText="Keep Pending"
        variant="danger"
        isLoading={isProcessingAction}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Wrench,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { getStats, getMyBookings } from '@/lib/data';
import { CustomerStats, Booking } from '@/lib/types';
import { StatsCard } from '@/components/StatsCard';
import { CustomerSpendingChart } from '@/components/dashboard/CustomerSpendingChart';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentBadge } from '@/components/PaymentBadge';
import { Button } from '@/components/Button';

export default function CustomerDashboardOverview() {
  const { user } = useMockSession();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [statsData, bookingsData] = await Promise.all([
          getStats('customer', user?.email),
          getMyBookings(user?.email),
        ]);

        if (isMounted) {
          setStats(statsData as CustomerStats);
          setRecentBookings(bookingsData.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-teal-900 to-teal-700 p-6 sm:p-8 text-white shadow-md">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-800/80 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-600/50">
            <Wrench className="h-3 w-3" />
            Customer Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Customer'}!
          </h2>
          <p className="text-sm text-teal-100/90 max-w-xl">
            Track your ongoing appliance repairs, inspect service updates, and manage your billing history in one place.
          </p>
        </div>

        <div className="shrink-0">
          <Link href="/services">
            <Button
              variant="secondary"
              className="bg-white text-teal-900 hover:bg-teal-50 border-white shadow-sm font-semibold gap-2"
            >
              <Plus className="h-4 w-4" />
              Book a Repair
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total Requests"
          value={isLoading ? '—' : stats?.totalRequests ?? 0}
          icon={ClipboardList}
          description="All time repair requests"
        />
        <StatsCard
          title="Active Repairs"
          value={isLoading ? '—' : stats?.activeJobs ?? 0}
          icon={Clock}
          description="In progress or accepted"
        />
        <StatsCard
          title="Completed Repairs"
          value={isLoading ? '—' : stats?.completedJobs ?? 0}
          icon={CheckCircle2}
          description="Finished & delivered"
        />
      </div>

      {/* Recharts Activity & Spending Chart */}
      <div>
        <CustomerSpendingChart
          data={stats?.chartData || []}
          title="Repair Activity & Spending"
          subtitle="Monthly breakdown of repair request volume and total expense"
        />
      </div>

      {/* Recent Bookings Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Recent Bookings
            </h3>
            <p className="text-xs text-muted-foreground">
              Your latest submitted repair requests
            </p>
          </div>
          <Link
            href="/dashboard/customer/bookings"
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition"
          >
            <span>View All Bookings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 && !isLoading ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              You haven't requested any repairs yet.
            </p>
            <div className="mt-4">
              <Link href="/services">
                <Button size="sm">Explore Services</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recentBookings.map((b) => (
              <div
                key={b._id}
                className="rounded-2xl border border-border bg-card p-4 shadow-2xs hover:shadow-md transition duration-150 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 truncate">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {b.serviceTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Tech: {b.technicianName}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                  <span className="font-bold text-foreground">
                    ${b.finalAmount || b.basePrice}
                  </span>
                  <PaymentBadge status={b.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

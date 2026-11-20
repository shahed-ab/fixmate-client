'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { getStats, getTechnicianServices } from '@/lib/data';
import { TechnicianStats, Service } from '@/lib/types';
import { StatsCard } from '@/components/StatsCard';
import { TechnicianActivityChart } from '@/components/dashboard/TechnicianActivityChart';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';

export default function TechnicianOverviewPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTechnicianData() {
      try {
        setIsLoading(true);
        const [statsData, servicesData] = await Promise.all([
          getStats('technician', user?.email),
          getTechnicianServices(user?.email),
        ]);

        if (isMounted) {
          setStats(statsData as TechnicianStats);
          setRecentServices(servicesData.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load technician dashboard data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTechnicianData();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-800/80 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-600/50">
            <Wrench className="h-3 w-3" />
            Technician Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Technician'}!
          </h2>
          <p className="text-sm text-teal-100/90 max-w-xl">
            Manage your repair offerings, review customer service requests, and track your revenue growth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/dashboard/technician/add-service">
            <Button
              variant="secondary"
              className="bg-white text-teal-900 hover:bg-teal-50 border-white shadow-sm font-semibold gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          </Link>
          <Link href="/dashboard/technician/requests">
            <Button
              variant="outline"
              className="bg-teal-800/60 text-white border-teal-600/60 hover:bg-teal-800/90 hover:text-white font-semibold"
            >
              View Requests
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Services"
          value={isLoading ? '—' : stats?.totalServices ?? 0}
          icon={Wrench}
          description="Services created"
        />
        <StatsCard
          title="Approved Services"
          value={isLoading ? '—' : stats?.approvedServices ?? 0}
          icon={ShieldCheck}
          description="Live on FixMate"
        />
        <StatsCard
          title="Pending Requests"
          value={isLoading ? '—' : stats?.pendingRequests ?? 0}
          icon={Clock}
          description="Awaiting response"
        />
        <StatsCard
          title="Total Earnings"
          value={isLoading ? '—' : `$${stats?.totalEarnings ?? 0}`}
          icon={DollarSign}
          description="Completed & paid jobs"
        />
      </div>

      {/* Activity & Earnings Chart */}
      <div>
        <TechnicianActivityChart
          data={stats?.chartData || []}
          title="Repair Activity & Earnings"
          subtitle="Monthly tracking of completed repair jobs and net revenue earned"
        />
      </div>

      {/* Recent Services Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              My Services
            </h3>
            <p className="text-xs text-muted-foreground">
              Quick view of your active service listings
            </p>
          </div>
          <Link
            href="/dashboard/technician/my-services"
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition"
          >
            <span>Manage All Services</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentServices.length === 0 && !isLoading ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              You haven't listed any repair services yet.
            </p>
            <div className="mt-4">
              <Link href="/dashboard/technician/add-service">
                <Button size="sm">Create First Service</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recentServices.map((service) => (
              <div
                key={service._id}
                className="rounded-2xl border border-border bg-card p-4 shadow-2xs hover:shadow-md transition duration-150 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-12 w-12 rounded-xl object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                      <Wrench className="h-6 w-6" />
                    </div>
                  )}
                  <div className="space-y-0.5 truncate">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {service.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {service.category} · {service.serviceMode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                  <span className="font-bold text-foreground">
                    From ${service.basePrice}
                  </span>
                  <StatusBadge status={service.approvalStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

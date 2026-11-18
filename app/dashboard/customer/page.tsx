'use client';

import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/StatsCard';
import { CalendarClock, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/Button';

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Customer Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your service requests, track active repairs, and review payments.
          </p>
        </div>
        <Link href="/services">
          <Button>Book a Repair</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total Requests"
          value="4"
          icon={CalendarClock}
          description="All time bookings"
        />
        <StatsCard
          title="Active Repairs"
          value="1"
          icon={Clock}
          description="In progress or accepted"
        />
        <StatsCard
          title="Completed"
          value="3"
          icon={CheckCircle}
          description="Successfully fixed"
        />
      </div>
    </div>
  );
}

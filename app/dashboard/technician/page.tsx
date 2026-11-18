'use client';

import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/StatsCard';
import { Wrench, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/Button';

export default function TechnicianDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Technician Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your service listings, active jobs, and customer repair requests.
          </p>
        </div>
        <Link href="/dashboard/technician/add-service">
          <Button>Add New Service</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total Services"
          value="5"
          icon={Wrench}
          description="Listed services"
        />
        <StatsCard
          title="Approved Services"
          value="4"
          icon={CheckCircle}
          description="Live on marketplace"
        />
        <StatsCard
          title="Pending Requests"
          value="2"
          icon={Clock}
          description="Awaiting your response"
        />
      </div>
    </div>
  );
}

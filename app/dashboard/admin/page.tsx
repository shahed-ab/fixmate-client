'use client';

import React from 'react';
import { StatsCard } from '@/components/StatsCard';
import { Users, Wrench, Clock, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Platform-wide metrics, user management, and service approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="7"
          icon={Users}
          description="Registered accounts"
        />
        <StatsCard
          title="Technicians"
          value="3"
          icon={Wrench}
          description="Verified providers"
        />
        <StatsCard
          title="Pending Approvals"
          value="2"
          icon={Clock}
          description="Services awaiting review"
        />
        <StatsCard
          title="Revenue"
          value="$1,420"
          icon={DollarSign}
          description="Platform volume"
        />
      </div>
    </div>
  );
}

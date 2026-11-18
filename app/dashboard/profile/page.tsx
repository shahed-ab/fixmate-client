'use client';

import React from 'react';
import { useMockSession } from '@/lib/mock-session';
import { UserCog } from 'lucide-react';

export default function ProfilePage() {
  const { user, role } = useMockSession();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Profile Settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your personal profile details and preferences.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Name</label>
            <p className="text-sm font-medium text-foreground">{user?.name || 'FixMate User'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Email</label>
            <p className="text-sm font-medium text-foreground">{user?.email || 'user@example.com'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Role</label>
            <p className="text-sm font-medium capitalize text-teal-700">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

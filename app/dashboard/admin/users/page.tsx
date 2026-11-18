'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  UserCheck,
  Shield,
  Wrench,
  Lock,
  Mail,
  Phone,
} from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { getAdminUsers, changeUserRole } from '@/lib/data';
import { User, UserRole } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { StatsCard } from '@/components/StatsCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';

type RoleFilter = 'all' | 'customer' | 'technician' | 'admin';

export default function AdminUsersPage() {
  const { user: currentUser } = useMockSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Role Change Confirmation Modal State
  const [pendingChange, setPendingChange] = useState<{
    user: User;
    newRole: UserRole;
  } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load platform users:', err);
      toast.error('Unable to fetch registered user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role match
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = u.name.toLowerCase().includes(query);
        const emailMatch = u.email.toLowerCase().includes(query);
        const phoneMatch = u.phone?.toLowerCase().includes(query) ?? false;
        return nameMatch || emailMatch || phoneMatch;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Role Counts for Stat Cards & Tabs
  const counts = useMemo(() => {
    return {
      all: users.length,
      customer: users.filter((u) => u.role === 'customer').length,
      technician: users.filter((u) => u.role === 'technician').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };
  }, [users]);

  // Request role change (opens confirmation modal)
  const handleRoleSelect = (targetUser: User, nextRole: UserRole) => {
    if (targetUser.role === nextRole) return;

    if (
      currentUser &&
      (targetUser.email.toLowerCase() === currentUser.email.toLowerCase() ||
        targetUser._id === currentUser._id)
    ) {
      toast.error('You cannot change your own administrative role.');
      return;
    }

    setPendingChange({
      user: targetUser,
      newRole: nextRole,
    });
  };

  // Confirm role change
  const handleConfirmRoleChange = async () => {
    if (!pendingChange) return;

    const { user: targetUser, newRole } = pendingChange;

    try {
      setIsUpdatingRole(true);
      await changeUserRole(targetUser._id, newRole, currentUser?._id);
      toast.success(
        `Updated role for ${targetUser.name} to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}.`
      );
      setPendingChange(null);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user role.';
      toast.error(msg);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Columns definition
  const columns: Column<User>[] = [
    {
      header: 'User Details',
      className: 'w-[280px]',
      cell: (u) => {
        const isSelf = Boolean(
          currentUser?.email &&
          u.email.toLowerCase() === currentUser.email.toLowerCase()
        );

        return (
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-200">
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">{u.name}</span>
                {isSelf && (
                  <span className="rounded-full bg-teal-700 text-white text-[10px] font-bold px-2 py-0.2 shadow-xs">
                    YOU
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{u.area || 'Regional User'}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact & Credentials',
      cell: (u) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{u.email}</span>
          </div>
          {u.phone && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{u.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      className: 'w-[180px]',
      cell: (u) => {
        const isSelf = Boolean(
          currentUser?.email &&
          u.email.toLowerCase() === currentUser.email.toLowerCase()
        );

        return (
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={u.role}
                disabled={isSelf}
                onChange={(e) => handleRoleSelect(u, e.target.value as UserRole)}
                aria-label={`Change role for ${u.name}`}
                className={`rounded-xl border text-xs font-semibold px-3 py-1.5 transition-all shadow-xs outline-hidden ${
                  isSelf
                    ? 'bg-muted/80 text-muted-foreground border-border cursor-not-allowed opacity-80'
                    : 'bg-card text-foreground border-border hover:border-teal-600 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 cursor-pointer'
                }`}
              >
                <option value="customer">Customer</option>
                <option value="technician">Technician</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            {isSelf && (
              <span
                className="text-muted-foreground"
                title="You cannot modify your own administrative role."
              >
                <Lock className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Joined Date',
      hideOnMobile: true,
      cell: (u) => (
        <span className="text-xs text-muted-foreground">
          {new Date(u.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: () => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <ShieldAlert className="h-3.5 w-3.5" />
            Access Control Node
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            User Management & Role Directory
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Audit user access levels, manage platform privileges, and monitor account activity across consumers, technicians, and administrators.
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Registered"
          value={isLoading ? '—' : counts.all}
          icon={Users}
          description="Across all platform tiers"
        />
        <StatsCard
          title="Consumers"
          value={isLoading ? '—' : counts.customer}
          icon={UserCheck}
          description="Active repair clients"
        />
        <StatsCard
          title="Technicians"
          value={isLoading ? '—' : counts.technician}
          icon={Wrench}
          description="Certified repair specialists"
        />
        <StatsCard
          title="Administrators"
          value={isLoading ? '—' : counts.admin}
          icon={Shield}
          description="Platform governance team"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-muted/60 p-1.5 border border-border">
          <button
            onClick={() => setRoleFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === 'all'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === 'customer'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Customers ({counts.customer})
          </button>
          <button
            onClick={() => setRoleFilter('technician')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === 'technician'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Technicians ({counts.technician})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === 'admin'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Admins ({counts.admin})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Users DataTable */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        skeletonRows={6}
        emptyMessage={
          searchQuery
            ? `No users found matching "${searchQuery}".`
            : 'No users found in this role category.'
        }
        emptyIcon={Users}
        mobileCardRender={(u) => {
          const isSelf = Boolean(
            currentUser?.email &&
            u.email.toLowerCase() === currentUser.email.toLowerCase()
          );

          return (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-200">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{u.name}</span>
                      {isSelf && (
                        <span className="rounded-full bg-teal-700 text-white text-[10px] font-bold px-1.5 py-0.2">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                </div>

                <StatusBadge status={u.role} />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Change Role:</span>
                <select
                  value={u.role}
                  disabled={isSelf}
                  onChange={(e) => handleRoleSelect(u, e.target.value as UserRole)}
                  className="rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground disabled:opacity-50"
                >
                  <option value="customer">Customer</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          );
        }}
      />

      {/* Role Change Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingChange}
        onClose={() => setPendingChange(null)}
        onConfirm={handleConfirmRoleChange}
        title={`Change Role to ${
          pendingChange
            ? pendingChange.newRole.charAt(0).toUpperCase() + pendingChange.newRole.slice(1)
            : ''
        }?`}
        description={
          pendingChange ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to change <strong>{pendingChange.user.name}</strong>&rsquo;s role from{' '}
                <strong className="capitalize">{pendingChange.user.role}</strong> to{' '}
                <strong className="capitalize text-teal-700">{pendingChange.newRole}</strong>?
              </p>
              <p className="text-xs text-muted-foreground">
                This will immediately modify account permissions, available dashboard features, and dispatch workflows.
              </p>
            </div>
          ) : undefined
        }
        confirmText="Confirm Role Change"
        cancelText="Cancel"
        variant="warning"
        isLoading={isUpdatingRole}
      />
    </div>
  );
}

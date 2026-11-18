'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { getAdminServices, setApproval } from '@/lib/data';
import { Service, SERVICE_CATEGORIES } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminServicesApprovalPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reject Confirmation State
  const [rejectingService, setRejectingService] = useState<Service | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Per-action loading spinner
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch using current status filter, which places pending first
      const data = await getAdminServices(statusFilter);
      setServices(data);
    } catch (err) {
      console.error('Failed to load services for moderation:', err);
      toast.error('Unable to fetch services for administrative approval.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Client-side filtering for category & search
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = s.title.toLowerCase().includes(query);
        const techMatch = s.technicianName.toLowerCase().includes(query);
        const areaMatch = s.serviceArea.toLowerCase().includes(query);
        return titleMatch || techMatch || areaMatch;
      }
      return true;
    });
  }, [services, categoryFilter, searchQuery]);

  // Overall counts for stats
  const counts = useMemo(() => {
    return {
      all: services.length,
      pending: services.filter((s) => s.approvalStatus === 'pending').length,
      approved: services.filter((s) => s.approvalStatus === 'approved').length,
      rejected: services.filter((s) => s.approvalStatus === 'rejected').length,
    };
  }, [services]);

  // Handle Approve Action
  const handleApprove = async (service: Service) => {
    try {
      setActionLoadingId(service._id);
      await setApproval(service._id, 'approved');
      toast.success(`"${service.title}" has been approved and published.`);
      await fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve service.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectingService) return;

    try {
      setIsRejecting(true);
      await setApproval(rejectingService._id, 'rejected');
      toast.success(`"${rejectingService.title}" was marked as rejected.`);
      setRejectingService(null);
      await fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject service.';
      toast.error(msg);
    } finally {
      setIsRejecting(false);
    }
  };

  // Table Columns
  const columns: Column<Service>[] = [
    {
      header: 'Service Offering & Scope',
      className: 'w-[360px]',
      cell: (s) => (
        <div className="flex items-start gap-3.5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40">
            {s.image ? (
              <img
                src={s.image}
                alt={s.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-xs text-muted-foreground">
                {s.category.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">
              {s.title}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                {s.serviceMode}
              </span>
              <span>•</span>
              <span className="truncate">{s.serviceArea}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (s) => (
        <span className="inline-flex rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
          {s.category}
        </span>
      ),
    },
    {
      header: 'Technician',
      cell: (s) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-foreground">{s.technicianName}</p>
          <p className="text-muted-foreground truncate">{s.technicianEmail}</p>
        </div>
      ),
    },
    {
      header: 'Base Rate',
      cell: (s) => (
        <span className="font-bold text-sm text-foreground">
          ${s.basePrice.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Approval Status',
      cell: (s) => <StatusBadge status={s.approvalStatus} />,
    },
    {
      header: 'Actions',
      isAction: true,
      className: 'text-right',
      cell: (s) => {
        const isBusy = actionLoadingId === s._id;

        return (
          <div className="flex items-center justify-end gap-2">
            {s.approvalStatus === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(s)}
                  disabled={isBusy}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-3 py-1.5 h-8 gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectingService(s)}
                  disabled={isBusy}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs px-3 py-1.5 h-8 gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}

            {s.approvalStatus === 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectingService(s)}
                disabled={isBusy}
                className="border-border text-muted-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs px-3 py-1.5 h-8 gap-1"
              >
                <XCircle className="h-3.5 w-3.5" />
                Revoke Approval
              </Button>
            )}

            {s.approvalStatus === 'rejected' && (
              <Button
                size="sm"
                onClick={() => handleApprove(s)}
                disabled={isBusy}
                className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-3 py-1.5 h-8 gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Reinstate
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Quality Clearance & Moderation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Service Approvals & Quality Queue
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Review technician submissions, verify pricing compliance, and approve certified repair offerings before publication on the FixMate marketplace.
          </p>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pending Review"
          value={isLoading ? '—' : counts.pending}
          icon={Clock}
          description="Awaiting moderation decision"
        />
        <StatsCard
          title="Approved Catalog"
          value={isLoading ? '—' : counts.approved}
          icon={CheckCircle2}
          description="Live on consumer marketplace"
        />
        <StatsCard
          title="Rework / Rejected"
          value={isLoading ? '—' : counts.rejected}
          icon={XCircle}
          description="Returned for corrections"
        />
        <StatsCard
          title="Total Submissions"
          value={isLoading ? '—' : counts.all}
          icon={Layers}
          description="All recorded listings"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-muted/60 p-1.5 border border-border">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Submissions ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'approved'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'rejected'
                ? 'bg-card text-teal-700 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Rejected ({counts.rejected})
          </button>
        </div>

        {/* Right Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-teal-700 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
            />
          </div>
        </div>
      </div>

      {/* Services DataTable */}
      <DataTable
        data={filteredServices}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        skeletonRows={5}
        emptyMessage={
          searchQuery || categoryFilter !== 'all'
            ? 'No service submissions match your search criteria.'
            : 'No services found in this moderation queue.'
        }
        emptyIcon={ShieldCheck}
        mobileCardRender={(s) => (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40">
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-xs text-muted-foreground">
                    {s.category.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-teal-700">
                    {s.category}
                  </span>
                  <StatusBadge status={s.approvalStatus} />
                </div>
                <h4 className="font-semibold text-foreground text-sm line-clamp-2">
                  {s.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  By {s.technicianName} • <strong className="text-foreground">${s.basePrice.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
              {s.approvalStatus === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(s)}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-3 py-1 h-7.5"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingService(s)}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs px-3 py-1 h-7.5"
                  >
                    Reject
                  </Button>
                </>
              )}
              {s.approvalStatus === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectingService(s)}
                  className="text-xs px-3 py-1 h-7.5 text-muted-foreground"
                >
                  Revoke
                </Button>
              )}
              {s.approvalStatus === 'rejected' && (
                <Button
                  size="sm"
                  onClick={() => handleApprove(s)}
                  className="bg-teal-700 text-white text-xs px-3 py-1 h-7.5"
                >
                  Reinstate
                </Button>
              )}
            </div>
          </div>
        )}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!rejectingService}
        onClose={() => setRejectingService(null)}
        onConfirm={handleConfirmReject}
        title="Reject Service Offering?"
        description={
          rejectingService ? (
            <span>
              Are you sure you want to reject <strong>&ldquo;{rejectingService.title}&rdquo;</strong> submitted by {rejectingService.technicianName}? It will not be visible on the public consumer marketplace.
            </span>
          ) : undefined
        }
        confirmText="Confirm Rejection"
        cancelText="Cancel"
        variant="danger"
        isLoading={isRejecting}
      />
    </div>
  );
}

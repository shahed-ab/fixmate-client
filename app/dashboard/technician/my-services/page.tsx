'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import {
  getTechnicianServices,
  updateService,
  deleteService,
  toggleAvailability,
} from '@/lib/data';
import { Service } from '@/lib/types';
import { DataTable, Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EditServiceModal } from '@/components/dashboard/EditServiceModal';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

export default function MyServicesPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Delete Modal State
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle Loading tracker
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await getTechnicianServices(user?.email);
      setServices(data);
    } catch (err) {
      console.error('Failed to load technician services:', err);
      toast.error('Unable to load services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user?.email]);

  // Handle Availability Toggle
  const handleToggleAvailability = async (service: Service) => {
    try {
      setTogglingId(service._id);
      const updated = await toggleAvailability(service._id);

      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? updated : s))
      );

      toast.success(
        `Service is now ${updated.isAvailable ? 'available' : 'unavailable'} for bookings.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update availability.';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    try {
      setIsDeleting(true);
      await deleteService(deletingService._id);
      toast.success('Service deleted successfully.');
      setDeletingService(null);
      await fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete service.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.serviceArea.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  // Columns definition
  const columns: Column<Service>[] = [
    {
      header: 'Service',
      mobileLabel: 'Service',
      cell: (s) => (
        <div className="flex items-center gap-3">
          {s.image ? (
            <img
              src={s.image}
              alt={s.title}
              className="h-10 w-10 shrink-0 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Wrench className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate max-w-[200px]">
              {s.title}
            </p>
            <p className="text-xs text-muted-foreground">{s.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Mode',
      mobileLabel: 'Mode',
      cell: (s) => (
        <span className="inline-flex items-center rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
          {s.serviceMode}
        </span>
      ),
    },
    {
      header: 'Base Price',
      mobileLabel: 'Base Price',
      cell: (s) => (
        <span className="font-bold text-foreground">${s.basePrice}</span>
      ),
    },
    {
      header: 'Duration',
      mobileLabel: 'Duration',
      cell: (s) => (
        <span className="text-xs text-muted-foreground font-medium">
          {s.estimatedDuration}
        </span>
      ),
    },
    {
      header: 'Availability',
      mobileLabel: 'Availability',
      cell: (s) => {
        const isToggling = togglingId === s._id;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={s.isAvailable}
              disabled={isToggling}
              onClick={() => handleToggleAvailability(s)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:opacity-50 ${
                s.isAvailable ? 'bg-teal-700' : 'bg-zinc-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  s.isAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-semibold ${
                s.isAvailable ? 'text-teal-700' : 'text-muted-foreground'
              }`}
            >
              {s.isAvailable ? 'Active' : 'Paused'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Approval',
      mobileLabel: 'Approval',
      cell: (s) => <StatusBadge status={s.approvalStatus} />,
    },
    {
      header: 'Actions',
      isAction: true,
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingService(s)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-teal-700"
            title="Edit Service"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeletingService(s)}
            className="h-8 w-8 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            title="Delete Service"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            My Services
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your service listings, pricing, and live marketplace availability.
          </p>
        </div>
        <Link href="/dashboard/technician/add-service">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Service
          </Button>
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, area..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>
      </div>

      {/* Services DataTable */}
      <DataTable
        data={filteredServices}
        columns={columns}
        keyExtractor={(s) => s._id}
        isLoading={isLoading}
        emptyMessage={
          searchQuery
            ? 'No services found matching your search query.'
            : 'You have not created any repair services yet.'
        }
      />

      {/* Edit Service Modal */}
      <EditServiceModal
        isOpen={Boolean(editingService)}
        service={editingService}
        onClose={() => setEditingService(null)}
        onSaved={fetchServices}
        onUpdate={updateService}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingService)}
        onClose={() => setDeletingService(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Repair Service"
        description={
          <span>
            Are you sure you want to permanently delete{' '}
            <strong className="text-foreground">
              {deletingService?.title}
            </strong>
            ? This action cannot be undone.
          </span>
        }
        confirmText="Yes, Delete Service"
        cancelText="Keep Service"
        variant="danger"
      />
    </div>
  );
}

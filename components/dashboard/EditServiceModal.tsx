'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Upload,
  AlertTriangle,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Service, SERVICE_CATEGORIES, ServiceCategory, ServiceMode } from '@/lib/types';
import { serviceSchema, ServiceFormValues } from '@/lib/validations/service';
import { uploadImage, validateImageFile } from '@/lib/uploadImage';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

interface EditServiceModalProps {
  isOpen: boolean;
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
  onUpdate: (id: string, updates: Partial<Service>) => Promise<Service>;
}

export function EditServiceModal({
  isOpen,
  service,
  onClose,
  onSaved,
  onUpdate,
}: EditServiceModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (service) {
      reset({
        title: service.title,
        category: service.category,
        serviceMode: service.serviceMode,
        basePrice: service.basePrice,
        estimatedDuration: service.estimatedDuration,
        serviceArea: service.serviceArea,
        description: service.description,
        image: service.image,
      });
      setImagePreview(service.image);
      setImageError('');
    }
  }, [service, reset]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !service) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image file.');
      toast.error(validation.error || 'Invalid image file.');
      return;
    }

    try {
      setIsUploadingImage(true);
      const url = await uploadImage(file);
      setImagePreview(url);
      setValue('image', url, { shouldValidate: true });
      toast.success('Image updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setImageError(msg);
      toast.error(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      setIsSubmitting(true);
      await onUpdate(service._id, {
        title: data.title,
        category: data.category as ServiceCategory,
        serviceMode: data.serviceMode as ServiceMode,
        basePrice: Number(data.basePrice),
        estimatedDuration: data.estimatedDuration,
        serviceArea: data.serviceArea,
        description: data.description,
        image: data.image,
      });

      toast.success(
        'Service updated! Status has been reset to pending for admin approval.'
      );
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update service.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-service-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h3
            id="edit-service-modal-title"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Edit Service Listing
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modify service details, pricing, and coverage area.
          </p>
        </div>

        {/* Warning Notice about Status Reset */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-800 text-xs leading-relaxed">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold">Important Notice:</span> Saving changes to
            this service will immediately return its approval status to{' '}
            <span className="font-semibold underline">Pending</span> until an
            administrator reviews and re-approves it.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground">
              Service Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>

          {/* Category & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Category
              </label>
              <select
                {...register('category')}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Service Delivery Mode
              </label>
              <select
                {...register('serviceMode')}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="Home Visit">Home Visit</option>
                <option value="Shop Drop-off">Shop Drop-off</option>
              </select>
              {errors.serviceMode && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.serviceMode.message}
                </p>
              )}
            </div>
          </div>

          {/* Base Price, Duration & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Base Price ($)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                {...register('basePrice', { valueAsNumber: true })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              {errors.basePrice && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Duration
              </label>
              <input
                type="text"
                {...register('estimatedDuration')}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              {errors.estimatedDuration && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.estimatedDuration.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Service Area
              </label>
              <input
                type="text"
                {...register('serviceArea')}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              {errors.serviceArea && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.serviceArea.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Service Cover Photo
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-24 rounded-xl object-cover border border-border"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="text-xs gap-1.5"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Change Image
                  </>
                )}
              </Button>
            </div>
            {imageError && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {imageError}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploadingImage}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditServiceModal;

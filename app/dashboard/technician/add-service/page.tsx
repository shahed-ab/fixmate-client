'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Wrench,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { createService } from '@/lib/data';
import { SERVICE_CATEGORIES, ServiceCategory, ServiceMode } from '@/lib/types';
import { serviceSchema, ServiceFormValues } from '@/lib/validations/service';
import { uploadImage, validateImageFile } from '@/lib/uploadImage';
import { Button } from '@/components/Button';
import { toast } from 'sonner';

export default function AddServicePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      category: 'Smartphone',
      serviceMode: 'Home Visit',
      basePrice: 50,
      estimatedDuration: '1-2 hours',
      serviceArea: user?.area || 'Metro Area',
      description: '',
      image: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedMode = watch('serviceMode');

  // Handle file selection and upload
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
      toast.success('Image uploaded successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed.';
      setImageError(msg);
      toast.error(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setValue('image', '', { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ServiceFormValues) => {
    if (!data.image) {
      setImageError('Service image is required. Please upload a photo.');
      return;
    }

    try {
      await createService({
        title: data.title,
        category: data.category as ServiceCategory,
        description: data.description,
        image: data.image,
        basePrice: Number(data.basePrice),
        estimatedDuration: data.estimatedDuration,
        serviceMode: data.serviceMode as ServiceMode,
        serviceArea: data.serviceArea,
        technicianName: user?.name || 'Verified Technician',
        technicianEmail: user?.email || 'tech@fixmate.com',
      });

      toast.success(
        'Service submitted! It is currently waiting for admin approval before going live.'
      );
      router.push('/dashboard/technician/my-services');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create service.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/technician/my-services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Services</span>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Add New Repair Service
        </h2>
        <p className="text-sm text-muted-foreground">
          Publish a new device repair or appliance maintenance listing on FixMate.
        </p>
      </div>

      {/* Main Service Creation Form */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Technician Read-Only Credentials Info */}
          <div className="rounded-2xl bg-muted/40 p-4 border border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Technician Credentials (Read-only)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Technician Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  readOnly
                  className="mt-1 w-full rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-xs font-medium text-foreground cursor-not-allowed opacity-90"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Technician Email
                </label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  className="mt-1 w-full rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-xs font-medium text-foreground cursor-not-allowed opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Service Title */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground">
              Service Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. iPhone Screen & Battery Replacement"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category Dropdown & Service Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('category')}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Service Delivery Mode <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('serviceMode')}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="Home Visit">Home Visit</option>
                <option value="Shop Drop-off">Shop Drop-off</option>
              </select>
              {errors.serviceMode && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.serviceMode.message}
                </p>
              )}
            </div>
          </div>

          {/* Pricing, Duration & Service Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Base Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                {...register('basePrice', { valueAsNumber: true })}
                placeholder="50"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              {errors.basePrice && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Est. Duration <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('estimatedDuration')}
                placeholder="e.g. 1-2 hours"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              {errors.estimatedDuration && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.estimatedDuration.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Service Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('serviceArea')}
                placeholder="e.g. Downtown & Metro"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              {errors.serviceArea && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.serviceArea.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Describe diagnostic process, included parts, warranties, and technician qualifications (min 20 characters)..."
              className="mt-1.5 w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Image Upload using ImgBB / lib/uploadImage.ts */}
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Service Cover Photo <span className="text-rose-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl border border-border overflow-hidden bg-muted/20 w-full sm:w-80 aspect-video flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Service preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 rounded-xl bg-black/70 p-1.5 text-white hover:bg-black transition shadow-sm"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                  isUploadingImage
                    ? 'border-teal-500 bg-teal-50/20'
                    : 'border-border hover:border-teal-600 hover:bg-muted/30'
                }`}
              >
                {isUploadingImage ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="h-8 w-8 text-teal-700 animate-spin" />
                    <p className="text-xs font-semibold text-teal-800">
                      Uploading image to ImgBB...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Click to upload service photo
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Supports JPEG, PNG, or WebP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {imageError && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {imageError}
              </p>
            )}
            {errors.image && !imageError && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.image.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Link href="/dashboard/technician/my-services">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="w-full sm:w-auto gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing Service...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Publish Service
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

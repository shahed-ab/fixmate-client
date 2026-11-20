'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Camera,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Lock,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, refreshAuthSession } from '@/lib/auth-client';
import { updateUserProfile } from '@/lib/data';
import { UserRole } from '@/lib/types';
import { uploadImage, validateImageFile } from '@/lib/uploadImage';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading, refetch } = useSession();
  const user = session?.user;
  const role = ((user as { role?: string } | undefined)?.role || 'customer') as UserRole;

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');

  // Image Uploading & Preview State
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone((user as { phone?: string }).phone || '');
      setArea((user as { area?: string }).area || '');
      setBio((user as { bio?: string }).bio || '');
      setImage(user.image || '');
      setImagePreview(user.image || '');
    }
  }, [user]);

  // Handle Photo Selection and Upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format and size
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file.');
      return;
    }

    try {
      setIsUploadingImage(true);

      // Instant local preview
      const localPreviewUrl = URL.createObjectURL(file);
      setImagePreview(localPreviewUrl);

      // Upload via uploadImage utility (ImgBB or data URL fallback)
      const uploadedUrl = await uploadImage(file);
      setImage(uploadedUrl);
      setImagePreview(uploadedUrl);
      toast.success('Profile photo uploaded. Remember to save changes.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload photo.';
      toast.error(msg);
      // Revert preview on failure
      setImagePreview(image);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setImage('');
    setImagePreview('');
    toast.info('Profile photo cleared. Click "Save Changes" to apply.');
  };

  const handleReset = () => {
    if (user) {
      setName(user.name || '');
      setPhone((user as { phone?: string }).phone || '');
      setArea((user as { area?: string }).area || '');
      setBio((user as { bio?: string }).bio || '');
      setImage(user.image || '');
      setImagePreview(user.image || '');
      toast.info('Changes discarded.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Full legal name is required.');
      return;
    }

    if (!user?.email) {
      toast.error('No authenticated user session found.');
      return;
    }

    try {
      setIsSaving(true);

      await updateUserProfile(user.email, {
        name: name.trim(),
        phone: phone.trim(),
        area: area.trim(),
        bio: bio.trim(),
        image: image.trim(),
      });

      // Refresh Better Auth session bypassing cookie cache so navbar and top bar update
      await refreshAuthSession();
      if (typeof refetch === 'function') {
        await refetch({ query: { disableCookieCache: true } });
      }
      router.refresh();

      toast.success('Profile updated successfully! Changes synced across platform.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-40 rounded-3xl bg-card border border-border animate-pulse" />
        <div className="h-96 rounded-3xl bg-card border border-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Profile Identity Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Upload Action Overlay */}
            <div className="relative group shrink-0">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-3xl border-2 border-teal-600/30 bg-muted shadow-md">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={name || user?.name || 'User'}
                    className="h-full w-full object-cover"
                    onError={() => setImagePreview('')}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-teal-50 text-teal-700 text-3xl font-black">
                    {(name || user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-2xs">
                    <Loader2 className="h-7 w-7 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Quick Camera Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md hover:bg-teal-800 transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Change Profile Photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {name || user?.name || 'FixMate Member'}
                </h1>
                <StatusBadge status={role} />
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {user?.email}
                </span>
                {area && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {area}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Verification Status Pill */}
          <div className="rounded-2xl border border-border bg-muted/30 p-3.5 sm:text-right shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account Security Status
            </span>
            <p className="text-sm font-bold text-foreground mt-0.5">
              Identity Verified
            </p>
            <p className="text-[11px] text-teal-700 font-medium">
              TLS-256 Encrypted Profile
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Personal Information & Regional Routing
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your public profile display data, contact routing number, and regional servicing territory.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Full Legal Name</span>
                <span className="text-[10px] font-normal text-teal-700">Public Identity</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700 transition"
                />
              </div>
            </div>

            {/* Primary Phone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Primary Contact Number</span>
                <span className="text-[10px] font-normal text-emerald-600">SMS Notifications</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700 transition"
                />
              </div>
            </div>

            {/* Operating Territory / Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Operating Territory / Metropolitan Area
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Brooklyn, NY or Gulshan, Dhaka"
                  className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700 transition"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Account Email</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Read-only
                </span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-2xl border border-border bg-muted/60 pl-10 pr-10 py-2.5 text-sm text-muted-foreground cursor-not-allowed select-none opacity-80"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Email cannot be modified directly. Contact governance support for address migration.
              </p>
            </div>
          </div>

          {/* Assigned Role (Read-only) */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                Institutional Permission Tier
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Assigned by Platform Governance
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold capitalize text-foreground">
                  {role === 'customer'
                    ? 'Verified Repair Client'
                    : role === 'technician'
                    ? 'Certified Field Technician Specialist'
                    : 'System Administrator (Full Clearance)'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Full clearance across assigned regional appliance diagnostics and service orders.
                </p>
              </div>
              <StatusBadge status={role} />
            </div>
          </div>

          {/* Professional Bio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Professional Bio & Operational Brief</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {bio.length} / 500 characters
              </span>
            </label>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your technical certifications, background, or service notes..."
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700 transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Official Badge Image Upload Section */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Official Badge Photo & Avatar Assets
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Preview & Controls */}
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/20 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-teal-50 text-teal-700 font-bold text-lg">
                      {(name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {imagePreview ? 'Custom Avatar Attached' : 'Default Monogram Avatar'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    JPEG, PNG, WebP • Max 5MB
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition"
                    >
                      {isUploadingImage ? 'Uploading...' : 'Upload New'}
                    </button>
                    {imagePreview && (
                      <>
                        <span className="text-muted-foreground text-xs">•</span>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isUploadingImage}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Drop Zone / Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-4 text-center cursor-pointer hover:border-teal-700/60 hover:bg-muted/30 transition duration-150"
              >
                <UploadCloud className="h-6 w-6 text-teal-700 mb-1" />
                <span className="text-xs font-semibold text-foreground">
                  Click to browse image
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  High-resolution photo for badges
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || isUploadingImage}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Discard Changes
          </Button>

          <Button
            type="submit"
            disabled={isSaving || isUploadingImage}
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

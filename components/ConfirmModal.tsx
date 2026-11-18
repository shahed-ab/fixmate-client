'use client';

import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    },
    [isLoading, onClose]
  );

  useEffect(() => {
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
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
      icon: AlertCircle,
      confirmButtonVariant: 'destructive' as const,
      confirmButtonClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      icon: AlertTriangle,
      confirmButtonVariant: 'default' as const,
      confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    primary: {
      iconBg: 'bg-teal-50 text-teal-700 border border-teal-200',
      icon: Info,
      confirmButtonVariant: 'default' as const,
      confirmButtonClass: 'bg-teal-700 hover:bg-teal-800 text-white',
    },
  }[variant];

  const IconComponent = variantStyles.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!isLoading) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border',
          'transition-all duration-200 animate-in fade-in zoom-in-95'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
              variantStyles.iconBg
            )}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="flex-1 pt-0.5">
            <h3
              id="confirm-modal-title"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {title}
            </h3>
            {description && (
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {description}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variantStyles.confirmButtonVariant}
            className={cn('w-full sm:w-auto', variantStyles.confirmButtonClass)}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

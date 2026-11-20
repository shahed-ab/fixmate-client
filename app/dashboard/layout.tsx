import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: reqHeaders,
    });
  } catch (error) {
    console.error('Error verifying session in DashboardLayout:', error);
  }

  const pathname = reqHeaders.get('x-pathname') || '';

  // 1. Logged out user redirect to /sign-in with callbackUrl
  if (!session || !session.user) {
    const callback = pathname ? `?callbackUrl=${encodeURIComponent(pathname)}` : '';
    redirect(`/sign-in${callback}`);
  }

  const role = ((session.user as { role?: string }).role || 'customer') as UserRole;

  // 2. Server-side role boundaries check: wrong role goes to own dashboard
  if (pathname) {
    if (pathname.startsWith('/dashboard/customer') && role !== 'customer') {
      redirect(`/dashboard/${role}`);
    }
    if (pathname.startsWith('/dashboard/technician') && role !== 'technician') {
      redirect(`/dashboard/${role}`);
    }
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      redirect(`/dashboard/${role}`);
    }
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      redirect(`/dashboard/${role}`);
    }
  }

  return (
    <DashboardShell initialRole={role}>
      {children}
    </DashboardShell>
  );
}

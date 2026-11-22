import React from 'react';
import { cookies, headers } from 'next/headers';
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
  const cookieStore = await cookies();
  const signupRoleCookie = cookieStore.get('fixmate_signup_role')?.value;

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

  let role = ((session.user as { role?: string }).role || 'customer') as UserRole;

  // If newly signed up with Google as technician, sync role into database if still customer
  let shouldRedirectToTech = false;
  if (signupRoleCookie === 'technician' && role === 'customer' && session.user.id) {
    try {
      const { db } = await import('@/lib/mongodb');
      const { ObjectId } = await import('mongodb');
      const userIdQuery = ObjectId.isValid(session.user.id)
        ? { _id: new ObjectId(session.user.id) }
        : { id: session.user.id };
      await db.collection('user').updateOne(
        { ...userIdQuery, role: 'customer' },
        { $set: { role: 'technician' } }
      );
      cookieStore.delete('fixmate_signup_role');
      role = 'technician';
      shouldRedirectToTech = true;
    } catch (error) {
      console.error('Error syncing technician role in DashboardLayout:', error);
    }
  }

  if (shouldRedirectToTech) {
    redirect('/dashboard/technician');
  }

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

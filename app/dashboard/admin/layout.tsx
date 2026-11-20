import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AdminDashboardLayout({
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
    console.error('Error in AdminDashboardLayout:', error);
  }

  if (!session || !session.user) {
    redirect('/sign-in?callbackUrl=%2Fdashboard%2Fadmin');
  }

  const role = (session.user as { role?: string }).role || 'customer';
  if (role !== 'admin') {
    redirect(`/dashboard/${role}`);
  }

  return <>{children}</>;
}

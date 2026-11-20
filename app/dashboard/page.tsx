import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardRootPage() {
  const reqHeaders = await headers();
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: reqHeaders,
    });
  } catch (error) {
    console.error('Error verifying session in DashboardRootPage:', error);
  }

  if (!session || !session.user) {
    redirect('/sign-in?callbackUrl=%2Fdashboard');
  }

  const role = (session.user as { role?: string }).role || 'customer';
  redirect(`/dashboard/${role}`);
}

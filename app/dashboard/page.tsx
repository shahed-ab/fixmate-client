'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMockSession } from '@/lib/mock-session';
import { Loader2 } from 'lucide-react';

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, role, isLoading } = useMockSession();

  useEffect(() => {
    if (isLoading) return;
    if (!user || role === 'guest') {
      router.replace('/sign-in?callbackUrl=%2Fdashboard');
      return;
    }
    router.replace(`/dashboard/${role}`);
  }, [user, role, isLoading, router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
    </div>
  );
}

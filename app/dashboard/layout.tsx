'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMockSession } from '@/lib/mock-session';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isLoading } = useMockSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // Restore desktop sidebar collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fixmate_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fixmate_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Client-side authentication and role guard
  useEffect(() => {
    if (isLoading) return;

    // 1. Logged out or guest -> redirect to /sign-in
    if (!user || role === 'guest') {
      setAuthorized(false);
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const currentRole = role as UserRole;

    // 2. Role boundary check: wrong role goes to own dashboard
    if (pathname.startsWith('/dashboard/customer') && currentRole !== 'customer') {
      setAuthorized(false);
      router.replace(`/dashboard/${currentRole}`);
      return;
    }

    if (pathname.startsWith('/dashboard/technician') && currentRole !== 'technician') {
      setAuthorized(false);
      router.replace(`/dashboard/${currentRole}`);
      return;
    }

    if (pathname.startsWith('/dashboard/admin') && currentRole !== 'admin') {
      setAuthorized(false);
      router.replace(`/dashboard/${currentRole}`);
      return;
    }

    // 3. /dashboard root redirects to user's role dashboard
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      setAuthorized(false);
      router.replace(`/dashboard/${currentRole}`);
      return;
    }

    // 4. Authorized for current path (e.g., matching role path or /dashboard/profile)
    setAuthorized(true);
  }, [user, role, isLoading, pathname, router]);

  // Loading skeleton / redirecting state
  if (isLoading || !authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 shadow-xs">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Verifying dashboard session...
          </p>
        </div>
      </div>
    );
  }

  const userRole = (role === 'guest' ? 'customer' : role) as UserRole;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar: collapsible on desktop, off-canvas drawer on mobile/tablet */}
      <Sidebar
        role={userRole}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar with avatar, name, role badge, page title, and home link */}
        <TopBar onToggleMobileSidebar={() => setMobileOpen((prev) => !prev)} />

        {/* Dashboard page view */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

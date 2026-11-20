'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { UserRole } from '@/lib/types';

interface DashboardShellProps {
  children: React.ReactNode;
  initialRole: UserRole;
}

export function DashboardShell({ children, initialRole }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentRole = (((session?.user as { role?: string })?.role || initialRole) as UserRole);

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

  // Client-side guard for SPA transitions
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith('/dashboard/customer') && currentRole !== 'customer') {
      router.replace(`/dashboard/${currentRole}`);
      return;
    }

    if (pathname.startsWith('/dashboard/technician') && currentRole !== 'technician') {
      router.replace(`/dashboard/${currentRole}`);
      return;
    }

    if (pathname.startsWith('/dashboard/admin') && currentRole !== 'admin') {
      router.replace(`/dashboard/${currentRole}`);
      return;
    }

    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      router.replace(`/dashboard/${currentRole}`);
      return;
    }
  }, [pathname, currentRole, router]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar: collapsible on desktop, off-canvas drawer on mobile/tablet */}
      <Sidebar
        role={currentRole}
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

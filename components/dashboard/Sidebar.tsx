'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarClock,
  CreditCard,
  UserCog,
  PlusCircle,
  Wrench,
  ClipboardList,
  Users,
  ShieldCheck,
  Receipt,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useMockSession } from '@/lib/mock-session';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export function getNavItemsForRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'customer':
      return [
        { label: 'Overview', href: '/dashboard/customer', icon: LayoutDashboard },
        { label: 'My Bookings', href: '/dashboard/customer/bookings', icon: CalendarClock },
        { label: 'Payment History', href: '/dashboard/customer/payments', icon: CreditCard },
        { label: 'Profile Settings', href: '/dashboard/profile', icon: UserCog },
      ];
    case 'technician':
      return [
        { label: 'Overview', href: '/dashboard/technician', icon: LayoutDashboard },
        { label: 'Add Service', href: '/dashboard/technician/add-service', icon: PlusCircle },
        { label: 'My Services', href: '/dashboard/technician/my-services', icon: Wrench },
        { label: 'Manage Requests', href: '/dashboard/technician/requests', icon: ClipboardList },
        { label: 'Profile Settings', href: '/dashboard/profile', icon: UserCog },
      ];
    case 'admin':
      return [
        { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
        { label: 'Service Approvals', href: '/dashboard/admin/services', icon: ShieldCheck },
        { label: 'All Bookings', href: '/dashboard/admin/bookings', icon: ClipboardList },
        { label: 'Transactions', href: '/dashboard/admin/transactions', icon: Receipt },
        { label: 'Profile Settings', href: '/dashboard/profile', icon: UserCog },
      ];
    default:
      return [];
  }
}

interface SidebarProps {
  role: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  role,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useMockSession();
  const navItems = getNavItemsForRole(role);

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out successfully');
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Top Header & Brand */}
      <div>
        <div
          className={cn(
            'flex h-16 items-center px-4 border-b border-border transition-all duration-200',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {isCollapsed ? (
            <Link
              href="/"
              className="flex items-center justify-center p-1.5 rounded-xl hover:bg-muted transition"
              title="FixMate Home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white font-bold shadow-xs">
                F
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Logo asLink={true} />
              {/* Mobile close button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Role identifier badge in expanded mode */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-xs">
              <span className="font-medium text-muted-foreground">Portal</span>
              <span className="font-semibold uppercase tracking-wider text-teal-700">
                {role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5 px-3 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== `/dashboard/${role}` &&
                item.href !== '/dashboard/profile' &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'group flex items-center rounded-xl font-medium text-sm transition-all duration-150',
                  isCollapsed ? 'h-11 w-11 justify-center mx-auto' : 'h-11 px-3.5 gap-3.5',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'shrink-0 transition-transform duration-150 group-hover:scale-105',
                    isCollapsed ? 'h-5 w-5' : 'h-5 w-5',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="border-t border-border p-3 space-y-1.5 bg-card/50">
        {/* Back to Home Link */}
        <Link
          href="/"
          title={isCollapsed ? 'Back to Home' : undefined}
          className={cn(
            'flex items-center rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150',
            isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-10 px-3 gap-3'
          )}
        >
          <Home className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Public Home</span>}
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          title={isCollapsed ? 'Sign Out' : undefined}
          className={cn(
            'flex w-full items-center rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-150',
            isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-10 px-3 gap-3'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Sign Out</span>}
        </button>

        {/* Desktop Collapse / Expand Button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'hidden lg:flex w-full items-center justify-center rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 mt-1',
            isCollapsed ? 'h-9 w-9 mx-auto' : 'h-9 px-3 gap-2'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 border-r border-border bg-card transition-all duration-200 z-30',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {navContent}
      </aside>
    </>
  );
}

export default Sidebar;

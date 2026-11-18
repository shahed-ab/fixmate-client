'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Home,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TopBarProps {
  onToggleMobileSidebar: () => void;
}

const ROLE_BADGE_CONFIG: Record<
  UserRole,
  { label: string; className: string }
> = {
  customer: {
    label: 'Customer',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  technician: {
    label: 'Technician',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  admin: {
    label: 'Admin',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

export function TopBar({ onToggleMobileSidebar }: TopBarProps) {
  const pathname = usePathname();
  const { user, role, signOut } = useMockSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title from path
  const getPageTitle = () => {
    if (pathname === '/dashboard/customer') return 'Customer Overview';
    if (pathname === '/dashboard/customer/bookings') return 'My Bookings';
    if (pathname === '/dashboard/customer/payments') return 'Payment History';
    if (pathname === '/dashboard/technician') return 'Technician Overview';
    if (pathname === '/dashboard/technician/add-service') return 'Add New Service';
    if (pathname === '/dashboard/technician/my-services') return 'My Services';
    if (pathname === '/dashboard/technician/requests') return 'Manage Requests';
    if (pathname === '/dashboard/admin') return 'Admin Overview';
    if (pathname === '/dashboard/admin/users') return 'Manage Users';
    if (pathname === '/dashboard/admin/services') return 'Service Approvals';
    if (pathname === '/dashboard/admin/bookings') return 'All Bookings Monitor';
    if (pathname === '/dashboard/admin/transactions') return 'Platform Transactions';
    if (pathname === '/dashboard/profile') return 'Profile Settings';
    return 'Dashboard';
  };

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
    toast.success('Signed out successfully');
  };

  const currentRole = (role === 'guest' ? 'customer' : role) as UserRole;
  const roleBadge = ROLE_BADGE_CONFIG[currentRole] || ROLE_BADGE_CONFIG.customer;

  // Initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left side: Hamburger button + Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            FixMate /
          </span>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: Home link + User Profile Badge & Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Link to Public Home */}
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2.5 hover:bg-muted transition duration-150 border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* User Avatar */}
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-9 w-9 rounded-xl object-cover border border-border shadow-2xs"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white text-xs font-bold shadow-2xs">
                {getInitials(user?.name)}
              </div>
            )}

            {/* Name + Role Badge */}
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-semibold text-foreground leading-tight max-w-[120px] truncate">
                {user?.name || 'FixMate User'}
              </span>
              <span
                className={cn(
                  'mt-0.5 inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-semibold border',
                  roleBadge.className
                )}
              >
                {roleBadge.label}
              </span>
            </div>

            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200 hidden md:block',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <div className="mt-1.5 md:hidden">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border',
                      roleBadge.className
                    )}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="sm:hidden flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>Public Home</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="h-4 w-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;

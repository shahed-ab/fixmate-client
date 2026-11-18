'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { useMockSession } from '@/lib/mock-session';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, signOut } = useMockSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Dashboard layout manages its own TopBar in C8
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
  ];

  const dashboardHref =
    role === 'admin'
      ? '/dashboard/admin'
      : role === 'technician'
      ? '/dashboard/technician'
      : '/dashboard/customer';

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
    toast.success('Signed out successfully.');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md transition-all">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Logo />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary relative py-1',
                  isActive
                    ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                    : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Auth Area */}
        <div className="hidden md:flex items-center gap-3">
          {user && role !== 'guest' ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full p-1 pl-2 text-sm font-medium hover:bg-muted/80 border border-border/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-expanded={dropdownOpen}
                aria-label="User navigation menu"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-primary/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[120px] truncate text-foreground font-medium text-xs">
                  {user.name}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200 mr-1',
                    dropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-2.5 border-b border-border/70 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>
                    <StatusBadge status={user.role} />
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href={dashboardHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
                    >
                      <UserCircle className="h-4 w-4 text-primary" />
                      Update Profile
                    </Link>

                    <div className="my-1 border-t border-border/60" />

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/80 hover:bg-muted hover:text-foreground focus:outline-none"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground/80 hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-border/80">
            {user && role !== 'guest' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/40 rounded-lg">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <div className="mt-0.5">
                      <StatusBadge status={user.role} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href={dashboardHref}>
                      <LayoutDashboard className="h-4 w-4 mr-1.5 text-primary" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/dashboard/profile">
                      <UserCircle className="h-4 w-4 mr-1.5 text-primary" />
                      Profile
                    </Link>
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Container } from '@/components/Container';
import { SERVICE_CATEGORIES } from '@/lib/types';

// Modern X (Twitter) icon component
function XLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Instagram SVG icon
function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// LinkedIn SVG icon
function LinkedInIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.84 6.2a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();

  // Hide public footer in dashboard routes
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#1E201E] text-zinc-300 border-t border-zinc-800 transition-colors">
      <Container className="pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <Logo asLink={true} className="[&_span]:text-white [&_.text-primary]:text-teal-400" />
            </div>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Trustworthy on-demand device and home appliance repair platform.
              Verified master technicians, upfront transparent pricing, and guaranteed satisfaction.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://fixmate.io"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 hover:bg-teal-600 hover:text-white transition-colors"
                aria-label="Website"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 hover:bg-teal-600 hover:text-white transition-colors"
                aria-label="X (formerly Twitter)"
              >
                <XLogo className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 hover:bg-teal-600 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 hover:bg-teal-600 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-teal-400 transition-colors text-zinc-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-teal-400 transition-colors text-zinc-400">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors text-zinc-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#how-it-works" className="hover:text-teal-400 transition-colors text-zinc-400">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-teal-400 transition-colors text-zinc-400">
                  Become a Technician
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Popular Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICE_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/services?category=${encodeURIComponent(category)}`}
                    className="hover:text-teal-400 transition-colors text-zinc-400"
                  >
                    {category} Repair
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact & Support
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <a href="mailto:support@fixmate.io" className="hover:text-teal-400 transition-colors">
                  support@fixmate.io
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <a href="tel:+18003496283" className="hover:text-teal-400 transition-colors">
                  +1 (800) FIX-MATE
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  New York Metropolitan Area, NY
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 FixMate Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/about" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/about" className="hover:text-zinc-300 transition-colors">
              Safety Guarantee
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;

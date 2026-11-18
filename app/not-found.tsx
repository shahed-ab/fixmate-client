import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  PhoneCall,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

export default function NotFound() {
  const quickCategories = [
    { label: 'Smartphone', href: '/services?category=Smartphone' },
    { label: 'AC Servicing', href: '/services?category=AC' },
    { label: 'Refrigerator', href: '/services?category=Refrigerator' },
    { label: 'Laptop & PC', href: '/services?category=Laptop%20%26%20PC' },
  ];

  return (
    <div className="flex-1 py-16 md:py-24 flex items-center justify-center">
      <Container className="max-w-4xl text-center">
        {/* Diagnostic Status Code Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-medium mb-8">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>DIAGNOSTIC CODE: ERR_404_PAGE_DISCONNECTED</span>
        </div>

        {/* 404 Visual Repair Graphic */}
        <div className="relative mx-auto my-4 flex items-center justify-center">
          <div className="text-8xl md:text-9xl font-black tracking-tight text-teal-900/15 select-none flex items-center justify-center">
            <span>4</span>
            <div className="relative mx-2 h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-teal-50 border-2 border-dashed border-teal-500/40 flex items-center justify-center shadow-inner">
              <div className="relative">
                <Wrench className="h-12 w-12 md:h-16 md:w-16 text-teal-700 animate-bounce duration-1000" />
                <Zap className="h-5 w-5 text-amber-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <span>4</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-4 mt-6">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Oops! This page needs repairing
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            The workbench or diagnostic page you are looking for seems to have a loose connection
            or has been relocated to another FixMate service center. Let&apos;s get your equipment back online.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/">
                Back to Home
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/services">
                <Wrench className="h-4 w-4 mr-1.5 text-primary" />
                Browse Services
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Category Dispatch Assistance Card */}
        <div className="mt-14 p-6 rounded-2xl bg-white border border-border shadow-sm text-left max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Search className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Looking for specific appliance repair?
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Jump right into our fast-track technician dispatch categories:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {quickCategories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-colors font-medium text-foreground/80"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="md:border-l md:border-border md:pl-6 shrink-0 flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Direct Workshop Support
              </span>
              <a
                href="tel:+18003496283"
                className="text-base font-bold text-teal-700 hover:underline flex items-center gap-1.5 mt-1"
              >
                <PhoneCall className="h-4 w-4" />
                +1 (800) FIX-MATE
              </a>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Average dispatch response: 15 mins
              </span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/70 text-left">
            <div className="h-9 w-9 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Verified Techs Only</p>
              <p className="text-[11px] text-muted-foreground">Background checked masters</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/70 text-left">
            <div className="h-9 w-9 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">30-Day Guarantee</p>
              <p className="text-[11px] text-muted-foreground">Parts & workmanship covered</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/70 text-left">
            <div className="h-9 w-9 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">On-Demand Booking</p>
              <p className="text-[11px] text-muted-foreground">Arrival within 90 minutes</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

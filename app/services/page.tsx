import React from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import {
  Wrench,
  SearchX,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Clock,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { ServiceCard } from '@/components/ServiceCard';
import { FilterBar } from './FilterBar';
import { Pagination } from './Pagination';
import { getServices } from '@/lib/data';

export const dynamic = 'force-dynamic';

interface ServicesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    mode?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'Browse Repair Services | FixMate',
  description:
    'Explore certified technicians and repair services for smartphones, laptops, AC, refrigeration, and home appliances.',
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  await connection();
  const resolvedParams = await searchParams;

  const q = resolvedParams.q || undefined;
  const category = resolvedParams.category || undefined;
  const mode = resolvedParams.mode || undefined;
  const sort = resolvedParams.sort || undefined;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const limit = 8;

  // Fetch paginated services filtered strictly inside getServices
  const { items, total, pages } = await getServices({
    q,
    category,
    mode,
    sort,
    page,
    limit,
  });

  return (
    <div className="flex-1 py-8 md:py-12 space-y-8 md:space-y-10">
      <Container className="space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">Services</span>
        </nav>

        {/* Page Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              <span>NEW YORK METROPOLITAN SERVICE NETWORK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Browse Repair Services
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Find certified, verified technicians for home appliances, phones, computers,
              and electronics across New York.
            </p>
          </div>

          {/* Active Workshops Badge */}
          <div className="shrink-0 inline-flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-border/80 shadow-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <p className="font-bold text-foreground">34 Active Workshops</p>
              <p className="text-[11px] text-muted-foreground">Instant dispatch within 45 mins</p>
            </div>
          </div>
        </div>

        {/* Client Interactive Filter & Search Bar */}
        <FilterBar total={total} />

        {/* Services Grid or Empty State */}
        {items.length === 0 ? (
          <div className="my-12 p-12 rounded-3xl bg-white border border-border/80 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="h-16 w-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
              <SearchX className="h-8 w-8 text-teal-700" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">
                No repair services found
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We couldn&apos;t find any services matching your current filters. Try adjusting
                your keywords, clearing selected categories, or resetting all filters.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/services">
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Reset All Filters
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1/2/3-4 Columns Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              page={page}
              pages={pages}
              total={total}
              limit={limit}
            />
          </div>
        )}

        {/* Bottom Trust Guarantee Strip */}
        <div className="pt-10 border-t border-border/80 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-border/70 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-foreground text-sm">FixMate 90-Day Guarantee</h3>
              <p className="text-muted-foreground leading-relaxed">
                All repair parts and workshop operations come with complete 90-day peace-of-mind coverage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-border/70 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-foreground text-sm">Upfront Transparent Pricing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Never encounter hidden extras. Final quotes confirmed before diagnostic disassembly begins.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-border/70 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-foreground text-sm">Fast 45-Min Home Arrival</h3>
              <p className="text-muted-foreground leading-relaxed">
                Live technician dispatch tracking across New York metropolitan area.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

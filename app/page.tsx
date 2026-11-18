'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Wallet,
  Smartphone,
  Laptop,
  Wind,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  CheckCircle2,
  Calendar,
  Wrench,
  FileText,
  Star,
  Users,
  Award,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { ServiceCard, ServiceCardSkeleton } from '@/components/ServiceCard';
import { getFeaturedServices } from '@/lib/data';
import { Service, ServiceCategory, SERVICE_CATEGORIES } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Search state
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadFeatured() {
      try {
        setIsLoading(true);
        const data = await getFeaturedServices();
        if (mounted) {
          setFeaturedServices(data);
          setHasError(false);
        }
      } catch (err) {
        console.error('Failed to load featured services:', err);
        if (mounted) {
          setHasError(true);
          toast.error('Could not load latest services. Please refresh.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeatured();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedCategory && selectedCategory !== 'All Categories') {
      params.set('category', selectedCategory);
    }
    const queryString = params.toString();
    router.push(queryString ? `/services?${queryString}` : '/services');
  };

  const categoryIcons: Record<ServiceCategory, React.ElementType> = {
    Smartphone: Smartphone,
    'Laptop & PC': Laptop,
    AC: Wind,
    Refrigerator: Refrigerator,
    TV: Tv,
    'Washing Machine': WashingMachine,
    Electrical: Zap,
  };

  return (
    <div className="flex-1 flex flex-col space-y-16 md:space-y-24 pb-16">
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section className="relative pt-8 md:pt-14 overflow-hidden">
        {/* Soft radial background glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"
          aria-hidden="true"
        />

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Copy & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Region & Verification Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-xs">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                <span>Verified technicians across New York</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Broken Device? Get It Fixed by{' '}
                <span className="text-primary underline decoration-primary/30 decoration-wavy decoration-2">
                  Verified Technicians
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Book repairs for phones, laptops, AC, and home appliances. Track every step in real-time
                and pay only after the job is completed to your satisfaction.
              </p>

              {/* Unified Search Form */}
              <form
                onSubmit={handleSearch}
                className="mt-6 p-2 rounded-2xl bg-white border border-border shadow-md flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto lg:mx-0"
              >
                {/* Category Dropdown */}
                <div className="w-full sm:w-auto relative border-b sm:border-b-0 sm:border-r border-border pb-2 sm:pb-0 sm:pr-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-foreground px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="All Categories">All Categories</option>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Text Search Input */}
                <div className="flex-1 flex items-center gap-2 px-2 w-full">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter device or issue (e.g. iPhone, AC, Refrigerator)"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5"
                  />
                </div>

                {/* Submit Action */}
                <Button type="submit" size="default" className="w-full sm:w-auto shrink-0 px-5">
                  <span>Find a Service</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </form>

              {/* Trust Sub-Bullets */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs font-medium text-foreground/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Verified technicians</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Live job tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span>Pay after service</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Banner */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-zinc-900 group">
                <img
                  src="/images/services/laptop.png"
                  alt="Certified technician inspecting electronics at diagnostic workbench"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Top Job Pill */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-border/80 flex items-center gap-2.5 text-xs animate-in fade-in duration-500">
                  <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900">JOB #1042</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        In Progress
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 block">Screen & Motherboard Fix</span>
                  </div>
                </div>

                {/* Floating Bottom Rating Pill */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-2">
                      <div className="h-7 w-7 rounded-full bg-teal-600 border-2 border-white text-white font-bold text-[10px] flex items-center justify-center">
                        AR
                      </div>
                      <div className="h-7 w-7 rounded-full bg-indigo-600 border-2 border-white text-white font-bold text-[10px] flex items-center justify-center">
                        MC
                      </div>
                      <div className="h-7 w-7 rounded-full bg-amber-600 border-2 border-white text-white font-bold text-[10px] flex items-center justify-center">
                        DM
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-zinc-900">4.9</span>
                        <span className="text-[11px] text-zinc-500">(2,400+ reviews)</span>
                      </div>
                      <span className="text-[10px] text-teal-700 font-semibold block">
                        Certified Techs On-demand
                      </span>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. POPULAR CATEGORIES SECTION
          ========================================================================= */}
      <section className="py-4">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                SPECIALIZED DISCIPLINES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Popular Categories
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Select your device category to see available repair specialists and estimated rates.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors shrink-0"
            >
              <span>Explore all hardware types</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Categories Grid (All 7 Categories) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {SERVICE_CATEGORIES.map((category) => {
              const IconComponent = categoryIcons[category] || Wrench;
              return (
                <Link
                  key={category}
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="group flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-border/80 hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl bg-teal-50 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-colors duration-300 mb-3 shadow-xs">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {category}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Available now
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. FEATURED LATEST SERVICES (6 SERVICES)
          ========================================================================= */}
      <section className="py-4">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                READY FOR DISPATCH
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Latest Services
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Skeletons while loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && hasError && (
            <div className="p-8 rounded-2xl bg-rose-50/50 border border-rose-200 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
              <p className="text-sm font-semibold text-rose-900">
                Unable to load featured repair services.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && featuredServices.length === 0 && (
            <div className="p-12 rounded-2xl bg-white border border-border text-center space-y-3">
              <Wrench className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">No approved services yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Our technicians are currently updating listings. Check back soon or browse categories.
              </p>
            </div>
          )}

          {/* Grid of 6 Featured Services */}
          {!isLoading && !hasError && featuredServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* =========================================================================
          4. HOW FIXMATE WORKS (4 STEPS)
          ========================================================================= */}
      <section className="py-6">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
              STRESS-FREE FLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              How FixMate Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Transparent, safe, and reliable appliance repair in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white font-extrabold text-sm shadow-xs">
                  1
                </span>
                <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Find a Service</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Search your device and select the issue from certified repair catalogs with clear baseline pricing.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white font-extrabold text-sm shadow-xs">
                  2
                </span>
                <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Send a Request</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pick a convenient time slot and choose either technician doorstep dispatch or shop drop-off.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white font-extrabold text-sm shadow-xs">
                  3
                </span>
                <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Wrench className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Technician Fixes It</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verified technician diagnoses issues on-site and performs repairs with live status milestones.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-2xl bg-white border border-border/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-800 text-white font-extrabold text-sm shadow-xs">
                  4
                </span>
                <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">Pay After Completion</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Inspect and test the repaired equipment thoroughly before releasing the payment securely.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          5. WHY CHOOSE US & TRUST STATS
          ========================================================================= */}
      <section className="py-6">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 4 Feature Cards */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                  RELIABILITY BY DESIGN
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Why Customers Trust FixMate
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Every booking is guarded by platform warranty, verified credentials, and strict escrow safety.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-xs space-y-2">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Verified Technicians</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Rigorous identity checks, practical hardware skill exams, and background profiling.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-xs space-y-2">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Pay Only When Done</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Zero upfront risk. Funds are released only after you test the machine in front of the tech.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-xs space-y-2">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Real-time Tracking</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Milestone timeline from departure to diagnostic report, spare changes, and warranty start.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-xs space-y-2">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-1">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Transparent Pricing</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Fixed diagnostics and itemized part replacement bills with zero unexpected surprises.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Dark Operational Numbers Card */}
            <div className="lg:col-span-5 rounded-3xl bg-[#1E201E] text-white p-8 flex flex-col justify-between shadow-xl border border-zinc-800">
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                    SERVICE IMPACT
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Our platform in operational numbers
                  </h3>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-white block">500+</span>
                      <span className="text-xs text-zinc-400">Verified Technicians</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-zinc-800/80 text-teal-400 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-white block">12,000+</span>
                      <span className="text-xs text-zinc-400">Successful Repairs Completed</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-zinc-800/80 text-teal-400 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-white">4.8</span>
                        <div className="flex items-center text-amber-400">
                          <Star className="h-4 w-4 fill-amber-400" />
                          <Star className="h-4 w-4 fill-amber-400" />
                          <Star className="h-4 w-4 fill-amber-400" />
                          <Star className="h-4 w-4 fill-amber-400" />
                          <Star className="h-4 w-4 fill-amber-400" />
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400">Average Customer Rating</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-zinc-800/80 text-teal-400 flex items-center justify-center">
                      <Award className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 90-Day Warranty Callout */}
              <div className="mt-8 p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">90-Day Repair Warranty</p>
                  <p className="text-zinc-400 text-[11px]">Free re-visit if the same issue reoccurs.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          6. TECHNICIAN RECRUITMENT CTA BANNER
          ========================================================================= */}
      <section className="py-4">
        <Container>
          <div className="rounded-3xl bg-gradient-to-r from-[#1E201E] via-[#242824] to-[#1E201E] text-white p-8 md:p-12 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center justify-center md:justify-start gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                JOIN FIXMATE GUILD
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Are you a skilled technician? Join FixMate and get jobs near you.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Grow your repair business with reliable daily bookings, guaranteed timely payouts,
                dedicated tool discounts, and verified customer requests.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto bg-amber-400 text-zinc-900 hover:bg-amber-300 font-bold border-none">
                <Link href="/sign-up">Become a Technician</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white">
                <Link href="/about#how-it-works">How Payouts Work</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

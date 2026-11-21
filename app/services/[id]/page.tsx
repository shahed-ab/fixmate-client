import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

export const dynamic = 'force-dynamic';
import {
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  Home,
  CheckCircle,
  Award,
  Zap,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Container } from '@/components/Container';
import { getServiceById } from '@/lib/data';
import { BookingSidebar } from './BookingSidebar';

interface ServiceDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ServiceDetailsPageProps) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service || service.approvalStatus !== 'approved' || !service.isAvailable) {
    return { title: 'Service Not Found | FixMate' };
  }
  return {
    title: `${service.title} | FixMate`,
    description: service.description,
  };
}

export default async function ServiceDetailsPage({
  params,
}: ServiceDetailsPageProps) {
  await connection();
  const { id } = await params;
  const service = await getServiceById(id);

  // Return notFound() if service does not exist or is not approved/available
  if (!service || service.approvalStatus !== 'approved' || !service.isAvailable) {
    notFound();
  }

  // Lookup assigned technician summary from service response or service fields
  const technician = (service as unknown as { technician?: { name?: string; email?: string; image?: string; phone?: string; area?: string; bio?: string } }).technician || {
    name: service.technicianName,
    email: service.technicianEmail,
    area: service.serviceArea,
    image: undefined,
    bio: undefined,
  };

  return (
    <div className="flex-1 py-8 md:py-12 space-y-10">
      <Container className="space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Link href="/services" className="hover:text-primary transition-colors">
            Services
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Link
            href={`/services?category=${encodeURIComponent(service.category)}`}
            className="hover:text-primary transition-colors"
          >
            {service.category}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate max-w-xs">
            {service.title}
          </span>
        </nav>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Left Content Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Hero Image Box with Badges */}
            <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-muted/40 border border-border/80 shadow-md">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Certified Clean-Room ESD Bay</span>
              </div>

              {/* Bottom Floating Tagline */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                  <span>ISO 9001:2015 Diagnostic Standards</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs font-semibold text-[11px]">
                  Verified Dispatch
                </span>
              </div>
            </div>

            {/* Service Header Info */}
            <div className="space-y-4">
              {/* Category & Mode Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {service.category} Repair
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground/80 border border-border">
                  {service.serviceMode}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-600" />
                  Express Turnaround
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {service.title}
              </h1>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              {/* Specs Cards Row (Star rating hidden per rules) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-border/80 text-left">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Duration</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {service.estimatedDuration}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border/80 text-left">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <span>Parts Standard</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    100% Genuine OEM
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border/80 text-left col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Coverage</span>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">
                    {service.serviceArea}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Protocols & What's Included */}
            <div className="space-y-4 pt-4 border-t border-border/70">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                    TECHNICAL PROTOCOLS
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    What&apos;s Included & Process
                  </h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-semibold">
                  6-Stage Standard
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border/70">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      Diagnostic Disassembly & Baseline Hardware Verification
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Technician connects diagnostic isolation tools, monitors voltage drop, and isolates fault points prior to component separation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border/70">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      Original-Spec Component Assembly & Micro-Fitment
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Zero tolerance fitment using factory calibrated jigs, torque screwdrivers, and temperature controlled soldering stations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border/70">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      Functional Multi-Point Sensor & Capacitive Calibration
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Firmware serialisation check, touch sampling rate confirmation, and thermal impedance testing under full system load.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border/70">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      Chassis Frame Re-Sealing with Water-Resistant Gasket Tape
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Thorough alcohol cleaning of the inner unibody ledge followed by OEM-grade pre-cut perimeter adhesive pressure application.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border/70">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      Post-Install Benchmarks & Safety Assurance Check
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Structured 14-point test sequence covering power continuity, thermal dissipation, audio/video output, and electrical grounding.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 90-Day Warranty Highlight */}
            <div className="p-6 rounded-2xl bg-teal-50/80 border border-teal-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-teal-950">
                    90-Day FixMate Comprehensive Warranty
                  </h3>
                  <p className="text-xs text-teal-800 leading-relaxed">
                    Guaranteed coverage for touch responsiveness, cooling pressure, and assembly bonding. Zero hassle replacement.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-teal-900 border border-teal-200 shadow-xs shrink-0 self-start sm:self-center">
                Warranty Terms
              </span>
            </div>

            {/* Meet Your Certified Technician Section */}
            <div className="space-y-4 pt-4 border-t border-border/70">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block mb-0.5">
                    VERIFIED DISPATCH
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    Meet Your Certified Technician
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  On Duty Today
                </span>
              </div>

              {/* Technician Profile Card */}
              <div className="p-6 rounded-3xl bg-white border border-border/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Technician Photo / Avatar */}
                  {technician?.image ? (
                    <img
                      src={technician.image}
                      alt={service.technicianName}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-teal-500/30"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-bold">
                      {service.technicianName.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {service.technicianName}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        Verified Tech
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Master Hardware Specialist • {service.serviceArea} Dispatch Hub
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed pt-2 border-t border-border/60">
                  {technician?.bio ||
                    'Certified multi-disciplinary repair technician with extensive training in clean-room ESD-safe operations, genuine OEM replacement standards, and precision diagnostics.'}
                </p>

                {/* Certification Pills */}
                <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-muted-foreground font-medium">
                  <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/70 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                    Background Checked
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/70 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-teal-700" />
                    ESD Certified
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/70 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-teal-700" />
                    Calibrated Workshop Tools
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/70 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-teal-700" />
                    99.4% On-Time Dispatch
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Booking Sidebar */}
          <div className="lg:col-span-4 w-full">
            <BookingSidebar service={service} />
          </div>
        </div>
      </Container>
    </div>
  );
}

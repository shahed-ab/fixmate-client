'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  ChevronDown,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck,
  Building2,
  Zap,
} from 'lucide-react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

// 6 Detailed Process Steps
const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Register & Verify Profile',
    description:
      'Customers sign up in seconds. Technicians submit trade certifications, national ID verification, and workshop credentials for thorough screening.',
    tags: ['Biometric ID Check', 'Trade License'],
    badge: 'Step 01',
    calloutTitle: 'Screening Protocols',
    calloutText: '9-point verification check for every workshop partner.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: 'Technician Lists a Service',
    description:
      'Verified technicians publish diagnostic pricing, turnaround estimates, and service modes (Home Visit or Shop Drop-off) across metropolitan zones.',
    tags: ['Doorstep Visit', 'Lab Drop-off'],
    badge: 'Step 02',
    calloutTitle: 'Zone Coverage',
    calloutText: 'Gulshan, Banani, Dhanmondi, Uttara & Mirpur hubs.',
    icon: Building2,
  },
  {
    step: '03',
    title: 'Admin Review & Quality Approval',
    description:
      'FixMate technical dispatch team benchmarks tooling calibration, ESD safety protocol, and validates parts supply chains before greenlighting.',
    tags: ['ESD Protocols', 'Tool Calibration'],
    badge: 'Step 03',
    calloutTitle: 'Rigorous Vetting',
    calloutText: 'Only top 15% of applicant technicians receive badge clearance.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Customer Requests a Repair',
    description:
      'Customer chooses issue type, uploads device symptoms, selects convenient time window with upfront transparent price estimation.',
    tags: ['Custom 2-Hr Windows', 'Photo Diagnostics'],
    badge: 'Step 04',
    calloutTitle: 'Upfront Quotation',
    calloutText: 'Standardized rate card protects you from unexpected charges.',
    icon: Wrench,
  },
  {
    step: '05',
    title: 'Live Dispatch & Step-by-Step Updates',
    description:
      'Track progress in real time through platform status stages, with verified live tracking badges and technician direct communication.',
    tags: ['Requested', 'Accepted', 'In Progress', 'Completed'],
    badge: 'Step 05',
    calloutTitle: 'Active Dispatch',
    calloutText: 'Real-time ETA and status synchronization.',
    icon: Clock,
  },
  {
    step: '06',
    title: 'Customer Pays After Completion',
    description:
      'No advance payment required. Test device diagnostics, cooling pressure, or motor load in front of the technician. Pay securely via card, backed by our 90-day warranty.',
    tags: ['Card / Digital Wallet', 'Digital Receipt'],
    badge: 'Step 06',
    calloutTitle: 'Invoice Verification',
    calloutText: 'Payment unlocked only after you sign off on final checks.',
    icon: CreditCard,
  },
];

// FAQ Items
const FAQ_ITEMS = [
  {
    question: 'When do I pay for my repair?',
    answer:
      'You only pay after the job is completely finished, assembled, and verified by you. Our technician conducts a full post-repair diagnostic test right in front of you. Once you are 100% satisfied, you can pay safely through credit card, debit card, or digital wallet.',
  },
  {
    question: 'Can I cancel a repair request if my plans change?',
    answer:
      'Yes! You can cancel your request directly from your Customer Dashboard at zero cost anytime before the assigned technician accepts and initiates field travel.',
  },
  {
    question: 'What does the 90-Day FixMate Comprehensive Warranty cover?',
    answer:
      'Our warranty covers both the replaced component parts and the craftsmanship labor. If the repaired hardware exhibits defects, sensor failure, or functional degradation within 90 days, we dispatch a certified specialist for a zero-cost resolution.',
  },
  {
    question: 'How does FixMate vet and certify repair technicians?',
    answer:
      'Every technician undergoes a rigorous 9-point audit: national biometric identity verification, trade license validation, workshop ESD safety compliance, tooling accuracy inspection, and practical diagnostic evaluations. Only the top 15% pass certification.',
  },
  {
    question: 'Do technicians bring original OEM parts to home visits?',
    answer:
      'Yes. Our certified specialists travel equipped with factory-grade OEM replacement screens, batteries, compressors, and motor capacitors matching exact device specifications.',
  },
];

export default function HowItWorksPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* ============================================================== */}
      {/* 1. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="relative pt-12 sm:pt-20 pb-8 bg-gradient-to-b from-teal-50/40 via-background to-background border-b border-border/50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
                <Sparkles className="h-3.5 w-3.5 text-teal-700" />
                Transparent Repair Ecosystem
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Repairs Made Simple and{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600">
                  Transparent
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                From booking to doorstep inspection and post-repair warranty, discover how FixMate connects trusted certified technicians with device and appliance owners.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/services">
                  <Button className="bg-teal-700 hover:bg-teal-800 text-white font-semibold h-12 px-6 gap-2 shadow-md">
                    <Wrench className="h-4 w-4" />
                    <span>Book a Diagnostics Test</span>
                  </Button>
                </Link>

                <a href="#process">
                  <Button
                    variant="outline"
                    className="h-12 px-5 gap-2 border-border text-foreground hover:bg-muted"
                  >
                    <span>Explore Process</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                  100% NID Verified
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-teal-700" />
                  90-Day Warranty
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <CreditCard className="h-4 w-4 text-teal-700" />
                  Post-Service Pay
                </span>
              </div>
            </div>

            {/* Right Visual Graphic Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-2xl space-y-4">
                {/* Visual Header Image */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden rounded-2xl border border-border bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
                    alt="Technician inspecting logic board"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/20 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    ISO-Grade Bench Testing
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-full bg-teal-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-teal-200 border border-teal-600/40">
                    Central Repair Hub
                  </div>
                </div>

                {/* Sub Features */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      ESD Calibrated
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Zero static damage risk on delicate logic boards.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                      Escrow Safety
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Zero advance fee; pay solely after testing.
                    </p>
                  </div>
                </div>

                {/* Resolution Rate Bar */}
                <div className="rounded-xl bg-slate-950 p-3.5 text-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      First-Pass Resolution
                    </span>
                    <p className="text-xs font-semibold text-slate-200">
                      Across 12,000+ repaired devices
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400">98.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 2. STEP-BY-STEP PROCESS TIMELINE                               */}
      {/* ============================================================== */}
      <section id="process" className="scroll-mt-20">
        <Container>
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
              The FixMate Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              How It Works: From Setup to Handover
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A step-by-step transparent lifecycle designed to eliminate shady pricing, counterfeit parts, and recurring device failures.
            </p>
          </div>

          {/* Timeline Steps Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Center Line for Desktop */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-border border-dashed border-l" />

            <div className="space-y-12">
              {PROCESS_STEPS.map((item, idx) => {
                const isEven = idx % 2 === 0;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.step}
                    className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12"
                  >
                    {/* Left or Right Card based on Alternating Index */}
                    <div
                      className={`w-full md:w-1/2 ${
                        isEven ? 'md:text-right md:order-1' : 'md:text-left md:order-3'
                      }`}
                    >
                      <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs hover:shadow-md transition space-y-3">
                        <div
                          className={`flex items-center gap-2 ${
                            isEven ? 'md:justify-end' : 'justify-start'
                          }`}
                        >
                          <span className="rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold px-2 py-0.5 border border-teal-200">
                            {item.badge}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>

                        <div
                          className={`flex flex-wrap items-center gap-2 pt-2 ${
                            isEven ? 'md:justify-end' : 'justify-start'
                          }`}
                        >
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-lg bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step Number Badge in Center */}
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white font-black text-sm shadow-md ring-4 ring-background md:order-2">
                      {item.step}
                    </div>

                    {/* Accompanying Highlight Box */}
                    <div
                      className={`w-full md:w-1/2 ${
                        isEven ? 'md:order-3' : 'md:order-1'
                      }`}
                    >
                      <div className="rounded-2xl border border-teal-200/60 bg-teal-50/40 p-4 space-y-1.5 text-left">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-teal-700" />
                          <h4 className="text-xs font-bold text-teal-900">
                            {item.calloutTitle}
                          </h4>
                        </div>
                        <p className="text-xs text-teal-800/90 leading-relaxed">
                          {item.calloutText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 3. DESIGNED FOR BOTH SIDES (CONSUMERS & PROS)                 */}
      {/* ============================================================== */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <Container>
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
              Mutual Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Designed for Both Sides of the Workbench
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We ensure device owners receive honest, dependable service while skilled repair specialists earn predictable, honorable livelihoods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: For Device & Appliance Owners */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-lg transition">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      For Device & Appliance Owners
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      End-to-end consumer peace of mind
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground divide-y divide-border/60">
                  <div className="pt-2">
                    <strong className="text-foreground block text-sm mb-0.5">
                      Zero Advance Risk
                    </strong>
                    Pay only after rigorous on-site inspection and testing. No upfront deposits or surprise exploratory charges.
                  </div>
                  <div className="pt-3">
                    <strong className="text-foreground block text-sm mb-0.5">
                      90-Day FixMate Warranty
                    </strong>
                    Guaranteed free re-visit and complete parts replacement if the repaired component displays any fault within 3 months.
                  </div>
                  <div className="pt-3">
                    <strong className="text-foreground block text-sm mb-0.5">
                      Verified Master Techs
                    </strong>
                    Background checked, NID verified, and ESD certified specialists with established physical workshops.
                  </div>
                  <div className="pt-3">
                    <strong className="text-foreground block text-sm mb-0.5">
                      Standardized Upfront Pricing
                    </strong>
                    Standardized diagnostic fees with zero hidden markups. Receive an itemized digital receipt directly on your phone.
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/services">
                  <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold h-11 gap-2">
                    <span>Book a Device Repair</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: For Skilled Technicians & Workshops */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-lg transition">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      For Skilled Technicians & Workshops
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Elevate your craft into a thriving business
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground divide-y divide-border/60">
                  <div className="pt-2">
                    <strong className="text-foreground block text-sm mb-0.5">
                      Consistent High-Value Jobs
                    </strong>
                    Access verified customer requests right in your metropolitan neighborhood without wasting marketing budget.
                  </div>
                  <div className="pt-3">
                    <strong className="text-foreground block text-sm mb-0.5">
                      Zero Bidding Hassles
                    </strong>
                    Fair dispatch algorithm based on distance and quality ratings without cutthroat price undercutting races.
                  </div>
                  <div className="pt-3">
                    <strong className="text-foreground block text-sm mb-0.5">
                      Instant Payout Cycles
                    </strong>
                    Direct bank deposits every week with a transparent, industry-low 12% platform fee.
                  </div>
                  <div className="pt-3">
                    <strong className="text-foreground block text-sm mb-0.5">
                      Genuine OEM Parts Network
                    </strong>
                    Direct wholesale pricing for original screens, IC chips, capacitors, and certified compressors.
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/sign-up?role=technician">
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted font-semibold h-11 gap-2"
                  >
                    <span>Apply as a Certified Partner</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 4. FOUNDATIONAL MISSION & IMPACT STATS                         */}
      {/* ============================================================== */}
      <section>
        <Container>
          <div className="rounded-3xl bg-slate-950 p-8 sm:p-12 text-white shadow-xl space-y-10">
            <div className="space-y-3 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Our Foundational Mission
              </span>
              <blockquote className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 leading-snug">
                &ldquo;Transforming the repair economy through radical transparency, verified craftsmanship, and consumer trust.&rdquo;
              </blockquote>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 border-t border-slate-800">
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                  99.4%
                </span>
                <p className="text-sm font-bold text-slate-200">On-Time Arrival</p>
                <p className="text-xs text-slate-400">
                  Precision dispatch window management across metro traffic corridors.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-teal-400">
                  12,000+
                </span>
                <p className="text-sm font-bold text-slate-200">Repairs Completed</p>
                <p className="text-xs text-slate-400">
                  Covered under full 90-day parts and craftsmanship guarantee with zero hassle.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-sky-400">
                  $45M+
                </span>
                <p className="text-sm font-bold text-slate-200">Fair Earnings Paid</p>
                <p className="text-xs text-slate-400">
                  Directly supporting local hardware technicians, mechanics, and workshop apprentices.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 5. FAQ ACCORDION                                               */}
      {/* ============================================================== */}
      <section>
        <Container className="max-w-3xl">
          <div className="text-center space-y-3 mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-200">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to know about our repair procedures, warranties, and consumer safeguards.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-foreground hover:bg-muted/40 transition"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-700' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 animate-in fade-in duration-150">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================================================== */}
      {/* 6. CALL TO ACTION BANNER                                       */}
      {/* ============================================================== */}
      <section>
        <Container>
          <div className="rounded-3xl bg-linear-to-r from-teal-950 via-teal-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                Immediate Dispatch Available
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to get your device fixed?
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                Find certified technicians in your area for smartphones, laptops, ACs, and home appliances today. Backed by our 90-day warranty.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/services">
                <Button className="bg-white text-teal-950 hover:bg-teal-50 border-white font-semibold h-11 px-6 shadow-sm">
                  Browse Services
                </Button>
              </Link>

              <a href="tel:+8801700349628">
                <Button
                  variant="outline"
                  className="border-teal-600/60 text-white bg-teal-900/60 hover:bg-teal-900/90 font-semibold h-11 px-5 gap-2"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Talk to Support</span>
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

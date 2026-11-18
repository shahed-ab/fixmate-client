import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import { Service } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col h-full rounded-2xl bg-white border border-border/80 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 overflow-hidden',
        className
      )}
    >
      {/* Service Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category & Service Mode Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/95 text-zinc-800 shadow-xs backdrop-blur-xs">
            {service.category}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[11px] font-medium shadow-xs backdrop-blur-xs',
              service.serviceMode === 'Home Visit'
                ? 'bg-teal-500/95 text-white'
                : 'bg-zinc-800/90 text-zinc-100'
            )}
          >
            {service.serviceMode}
          </span>
        </div>
      </div>

      {/* Card Content Area (flex-1 for equal card heights) */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2.75rem]">
          <Link href={`/services/${service._id}`} className="focus:outline-none">
            {service.title}
          </Link>
        </h3>

        {/* Technician info */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
          <div className="h-6 w-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[11px] font-bold shrink-0">
            {service.technicianName.charAt(0)}
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate">
            {service.technicianName}
          </span>
        </div>

        {/* Location & Duration Hints */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/80">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{service.serviceArea}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{service.estimatedDuration}</span>
          </span>
        </div>

        {/* Spacer to push pricing & CTA to bottom */}
        <div className="flex-1 min-h-3" />

        {/* Bottom Price & View Details Action */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-2">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Starting from
            </span>
            <span className="text-lg font-black text-foreground">
              ${service.basePrice}
            </span>
          </div>

          <Link
            href={`/services/${service._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors group/btn py-1 px-2.5 rounded-lg hover:bg-primary-muted"
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-border/80 shadow-xs overflow-hidden animate-pulse">
      <div className="aspect-[16/10] w-full bg-muted/60" />
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="h-4 bg-muted/80 rounded-md w-3/4" />
        <div className="h-4 bg-muted/60 rounded-md w-1/2" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 w-6 rounded-full bg-muted/70" />
          <div className="h-3 bg-muted/60 rounded-md w-24" />
        </div>
        <div className="flex-1 min-h-3" />
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="h-6 bg-muted/70 rounded-md w-14" />
          <div className="h-6 bg-muted/50 rounded-md w-20" />
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;

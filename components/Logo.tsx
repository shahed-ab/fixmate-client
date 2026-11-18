import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  asLink?: boolean;
}

export function Logo({ className, href = "/", asLink = true }: LogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-2 select-none group", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Wrench className="h-5 w-5" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Fix<span className="text-primary">Mate</span>
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;

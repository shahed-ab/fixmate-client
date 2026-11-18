import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentBadge } from "@/components/PaymentBadge";

export default function Home() {
  return (
    <div className="flex-1 py-16">
      <Container className="space-y-8 text-center sm:text-left">
        <Logo />
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            On-Demand Repair & Maintenance Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            FixMate connects you with verified local technicians for smartphone, laptop, home appliance, and electrical repairs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Explore Services</Button>
          <Button variant="outline" size="lg">How It Works</Button>
        </div>
        <div className="pt-6 border-t border-border flex flex-wrap items-center gap-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statuses:</span>
          <StatusBadge status="requested" />
          <StatusBadge status="accepted" />
          <StatusBadge status="in-progress" />
          <StatusBadge status="completed" />
          <StatusBadge status="rejected" />
          <StatusBadge status="cancelled" />
          <PaymentBadge status="paid" />
          <PaymentBadge status="unpaid" />
        </div>
      </Container>
    </div>
  );
}

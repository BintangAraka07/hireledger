import { ArrowUpRight, Users, FileCheck, FileX, ShieldCheck, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { StatCardSkeleton } from "@/components/PageSkeleton";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  variant?: "primary" | "secondary" | "accent" | "success";
}

const variantStyles = {
  primary: "from-primary/20 to-primary/0 text-primary",
  secondary: "from-secondary/25 to-secondary/0 text-secondary",
  accent: "from-accent/20 to-accent/0 text-accent",
  success: "from-success/20 to-success/0 text-success",
};

export function StatCard({ label, value, delta, trend = "neutral", icon: Icon, variant = "primary" }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
      <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl", variantStyles[variant])} />
      <div className="relative flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-gradient-to-br", variantStyles[variant])}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        {delta && (
          <div className={cn(
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            trend === "up" && "bg-success/15 text-success",
            trend === "down" && "bg-destructive/15 text-destructive",
            trend === "neutral" && "bg-muted text-muted-foreground",
          )}>
            <ArrowUpRight className={cn("h-3 w-3", trend === "down" && "rotate-90")} />
            {delta}
          </div>
        )}
      </div>
      <div className="relative mt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats?: DashboardStats;
  loading?: boolean;
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const formatPayroll = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n.toLocaleString("id-ID");

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Karyawan" value={String(stats?.totalEmployees ?? 0)} icon={Users} variant="primary" />
      <StatCard label="Kontrak Aktif" value={String(stats?.activeContracts ?? 0)} icon={FileCheck} variant="success" />
      <StatCard label="Kontrak Selesai" value={String(stats?.completedContracts ?? 0)} icon={FileX} variant="secondary" />
      <StatCard label="Payroll (Rp)" value={formatPayroll(stats?.totalPayroll ?? 0)} icon={ShieldCheck} variant="accent" />
    </div>
  );
}

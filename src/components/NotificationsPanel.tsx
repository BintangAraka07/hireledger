import { Bell, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const notifications = [
  {
    icon: AlertTriangle,
    title: "Contract ending in 7 days",
    detail: "PKWT-0218 · Anisa Larasati · Designer",
    time: "2h ago",
    tone: "warning" as const,
  },
  {
    icon: Clock,
    title: "Renewal pending signature",
    detail: "PKWT-0233 · Rizki Maulana · Engineer",
    time: "5h ago",
    tone: "primary" as const,
  },
  {
    icon: CheckCircle2,
    title: "On-chain verification complete",
    detail: "PKWT-0241 · Block 62,481,209",
    time: "12s ago",
    tone: "success" as const,
  },
  {
    icon: AlertTriangle,
    title: "Contract ending in 14 days",
    detail: "PKWT-0224 · Galih Saputra · Analyst",
    time: "1d ago",
    tone: "warning" as const,
  },
];

const tones = {
  warning: "bg-warning/15 text-warning border-warning/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  success: "bg-success/15 text-success border-success/30",
};

export function NotificationsPanel() {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/60 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-warning/30 bg-warning/15">
            <Bell className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">4 require attention</p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">live</span>
      </div>

      <ul className="divide-y divide-border/40">
        {notifications.map((n, i) => (
          <li
            key={i}
            className="group flex items-start gap-3 p-4 transition-colors hover:bg-muted/30"
          >
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", tones[n.tone])}>
              <n.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{n.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.detail}</p>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

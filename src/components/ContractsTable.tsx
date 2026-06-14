import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "Active" | "Completed" | "Expired" | "Pending";

interface Contract {
  id: string;
  employee: string;
  position: string;
  hash: string;
  duration: string;
  status: Status;
  initials: string;
  color: string;
}

const contracts: Contract[] = [
  { id: "PKWT-0241", employee: "Rina Hartono", position: "Senior Frontend Engineer", hash: "0x4a8f...2c91", duration: "12 mo", status: "Active", initials: "RH", color: "from-primary to-secondary" },
  { id: "PKWT-0240", employee: "Bayu Pratama", position: "DevOps Specialist", hash: "0x7b21...9d44", duration: "24 mo", status: "Active", initials: "BP", color: "from-accent to-primary" },
  { id: "PKWT-0239", employee: "Sari Wijaya", position: "Product Designer", hash: "0xc3e9...1f08", duration: "6 mo", status: "Pending", initials: "SW", color: "from-secondary to-accent" },
  { id: "PKWT-0238", employee: "Daffa Nugroho", position: "Backend Engineer", hash: "0x91a2...6e72", duration: "12 mo", status: "Completed", initials: "DN", color: "from-success to-accent" },
  { id: "PKWT-0237", employee: "Indah Permata", position: "Data Analyst", hash: "0x5d6c...b3a0", duration: "9 mo", status: "Expired", initials: "IP", color: "from-destructive to-secondary" },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Completed: "bg-primary/15 text-primary border-primary/30",
  Expired: "bg-destructive/15 text-destructive border-destructive/30",
};

export function ContractsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/60 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold">Recent Contracts</h3>
          <p className="text-xs text-muted-foreground">Latest PKWT smart contracts deployed on-chain</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:bg-primary/10 hover:text-primary">
          View all <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60 text-left">
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Contract</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Employee</th>
              <th className="hidden px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground lg:table-cell">Hash</th>
              <th className="hidden px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:table-cell">Duration</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr
                key={c.id}
                className="group border-b border-border/40 transition-colors last:border-0 hover:bg-muted/30"
              >
                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-semibold text-foreground">{c.id}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-primary-foreground", c.color)}>
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.employee}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{c.position}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-5 py-4 lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-muted-foreground">{c.hash}</span>
                    <Copy className="h-3 w-3 cursor-pointer text-muted-foreground/60 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100" />
                  </div>
                </td>
                <td className="hidden px-5 py-4 md:table-cell">
                  <span className="text-sm text-muted-foreground">{c.duration}</span>
                </td>
                <td className="px-5 py-4">
                  <Badge variant="outline" className={cn("rounded-full border font-medium", statusStyles[c.status])}>
                    <span className={cn(
                      "mr-1.5 h-1.5 w-1.5 rounded-full",
                      c.status === "Active" && "bg-success animate-pulse-glow",
                      c.status === "Pending" && "bg-warning",
                      c.status === "Completed" && "bg-primary",
                      c.status === "Expired" && "bg-destructive",
                    )} />
                    {c.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

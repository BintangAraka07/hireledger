import { Button } from "@/components/ui/button";
import { FileText, Rocket, ShieldCheck } from "lucide-react";

export function ContractPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card backdrop-blur-xl">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative border-b border-border/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary/40 bg-secondary/15">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">PKWT Smart Contract</h3>
              <p className="font-mono text-[11px] text-muted-foreground">Template · v2.4 · auto-generated</p>
            </div>
          </div>
          <span className="rounded-full border border-warning/30 bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning">
            Draft
          </span>
        </div>
      </div>

      <div className="relative space-y-3 p-5 font-mono text-[12px] leading-relaxed">
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">01</span>
          <span><span className="text-secondary">contract</span> <span className="text-accent">PKWT_0241</span> {"{"}</span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">02</span>
          <span className="pl-4">employee: <span className="text-primary">"Rina Hartono"</span>,</span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">03</span>
          <span className="pl-4">nik: <span className="text-primary">"3201XXXXXXXXXXX"</span>,</span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">04</span>
          <span className="pl-4">position: <span className="text-primary">"Senior Frontend Engineer"</span>,</span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">05</span>
          <span className="pl-4">salary: <span className="text-accent">18_000_000</span> IDR,</span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">06</span>
          <span className="pl-4">duration: <span className="text-accent">12</span> months,</span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">07</span>
          <span className="pl-4">startDate: <span className="text-primary">"2026-05-15"</span>,</span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">08</span>
          <span className="pl-4">jurisdiction: <span className="text-primary">"ID-PKWT-2003"</span></span>
        </div>
        <div className="flex">
          <span className="w-8 select-none text-muted-foreground/50">09</span>
          <span>{"}"}</span>
        </div>
        <div className="absolute inset-x-0 bottom-20 h-px animate-shimmer" />
      </div>

      <div className="relative flex flex-col gap-2 border-t border-border/60 p-5 sm:flex-row">
        <Button className="h-11 flex-1 gap-2 rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)] hover:shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.9)]">
          <Rocket className="h-4 w-4" />
          Deploy to Blockchain
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-xl border-border/60 bg-muted/30 font-semibold hover:bg-muted/60"
        >
          <ShieldCheck className="h-4 w-4" />
          Audit
        </Button>
      </div>
    </div>
  );
}

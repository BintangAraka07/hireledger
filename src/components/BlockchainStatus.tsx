import { Boxes, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlockchainStatus() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 backdrop-blur-xl">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-glow rounded-xl bg-gradient-primary blur-md opacity-70" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <Boxes className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">Blockchain Status</h3>
              <p className="text-xs text-muted-foreground">Latest deployment</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
            Verified
          </span>
        </div>

        <div className="space-y-3">
          <Row label="Network" value="Solana Devnet" />
          <Row label="Slot #" value="348,521,209" mono />
          <Row label="Signature" value="4a8f3c2b7e1d9f0a...2c91" mono copy />
          <Row label="Program ID" value="HireLedger...Program" mono copy />
          <Row label="Confirmations" value="32 / 32" success />
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-success/30 bg-success/10 p-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-semibold text-success">Contract deployed successfully</p>
              <p className="text-[11px] text-muted-foreground">Immutable · 12 sec ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 rounded-lg text-xs hover:bg-success/15 hover:text-success">
            View <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, copy, success }: { label: string; value: string; mono?: boolean; copy?: boolean; success?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${mono ? "font-mono" : ""} ${success ? "text-success" : "text-foreground"}`}>
          {value}
        </span>
        {copy && <Copy className="h-3.5 w-3.5 cursor-pointer text-muted-foreground/60 hover:text-primary" />}
      </div>
    </div>
  );
}

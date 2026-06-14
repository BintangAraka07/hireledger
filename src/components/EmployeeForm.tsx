import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Sparkles } from "lucide-react";

export function EmployeeForm() {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <UserPlus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">New Employee</h3>
            <p className="text-xs text-muted-foreground">Auto-fills the PKWT contract template</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 rounded-lg text-xs text-accent hover:bg-accent/10 hover:text-accent">
          <Sparkles className="h-3.5 w-3.5" /> AI assist
        </Button>
      </div>

      <form className="grid gap-4 md:grid-cols-2">
        <Field label="Full Name" placeholder="e.g. Rina Hartono" />
        <Field label="ID / NIK" placeholder="3201xxxxxxxxxxxx" mono />
        <Field label="Position" placeholder="Senior Frontend Engineer" />
        <Field label="Division" placeholder="Engineering" />
        <Field label="Work Location" placeholder="Jakarta — Remote" />
        <Field label="Salary (IDR)" placeholder="Rp 18.000.000" mono />

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Contract Duration</Label>
          <Select defaultValue="12">
            <SelectTrigger className="h-11 rounded-xl border-border/60 bg-muted/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
              <SelectItem value="24">24 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Field label="Start Date" type="date" />

        <div className="flex flex-col gap-2 pt-2 sm:flex-row md:col-span-2">
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)] transition-all hover:shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.8)]"
          >
            Create Contract
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border/60 bg-muted/30 font-semibold hover:bg-muted/60"
          >
            Save Draft
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, placeholder, type = "text", mono = false }: { label: string; placeholder?: string; type?: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        className={`h-11 rounded-xl border-border/60 bg-muted/40 placeholder:text-muted-foreground/60 ${mono ? "font-mono text-sm" : ""}`}
      />
    </div>
  );
}

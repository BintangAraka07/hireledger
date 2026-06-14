import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.08),transparent_45%),radial-gradient(circle_at_80%_85%,hsl(var(--secondary)/0.08),transparent_45%)]" />
        <AppSidebar />
        <div className="relative flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 scroll-smooth animate-fade-in">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-6 backdrop-blur-xl md:p-8">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-secondary/25 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-col gap-2 sm:flex-row">{actions}</div>}
      </div>
    </section>
  );
}

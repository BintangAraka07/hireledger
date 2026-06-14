import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Subscription() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader eyebrow="Billing" title={<>Subscription <span className="gradient-text">Tenant</span></>} description="Kelola paket langganan SaaS, kuota tenant, dan billing cycle." />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { nama: "Starter", harga: "Rp 1.500.000/bulan", active: false },
            { nama: "Growth", harga: "Rp 3.500.000/bulan", active: true },
            { nama: "Enterprise", harga: "Custom", active: false },
          ].map((plan) => (
            <Card key={plan.nama} className="border-border/60 bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {plan.nama} {plan.active && <Badge className="bg-primary">Aktif</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{plan.harga}</p>
                <Button variant={plan.active ? "outline" : "default"} className="w-full rounded-xl">
                  {plan.active ? "Paket Saat Ini" : "Pilih Paket"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

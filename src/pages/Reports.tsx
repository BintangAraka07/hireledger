import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { payrollSummary } from "@/lib/mock-data";

export default function Reports() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader eyebrow="Analytics" title={<>Laporan <span className="gradient-text">Operasional</span></>} description="Analitik outsourcing, payroll, dan performa kontrak secara real-time." />
        <div className="grid gap-4 md:grid-cols-3">
          {["SLA Vendor 98.7%", "Retensi Karyawan 93%", "Kontrak Tepat Waktu 96%"].map((x) => (
            <Card key={x} className="border-border/60 bg-gradient-card"><CardContent className="pt-6 text-sm">{x}</CardContent></Card>
          ))}
        </div>
        <Card className="border-border/60 bg-gradient-card">
          <CardHeader><CardTitle className="text-base">Tren Payroll per Bulan</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ total: { label: "Payroll", color: "hsl(var(--secondary))" } }} className="h-[300px] w-full">
              <BarChart data={payrollSummary}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Plus, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePayrollRecords, useCreatePayroll, useUpdatePayrollStatus } from "@/hooks/use-payroll";
import { useEmployees } from "@/hooks/use-employees";
import { toast } from "@/hooks/use-toast";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/PageSkeleton";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatMonth(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function escapeCsv(value: string | number | null | undefined) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function buildPdfDocument(lines: string[]) {
  const escapePdf = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const content = lines.map((line) => `(${escapePdf(line)}) Tj T*`).join("\n");
  const body = `BT /F1 12 Tf 50 780 Td ${content} ET`;
  const encoder = new TextEncoder();
  const header = "%PDF-1.3\n";
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n";
  const bodyBytes = encoder.encode(body);
  const obj4 = `4 0 obj\n<< /Length ${bodyBytes.length} >>\nstream\n${body}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const objects = [header, obj1, obj2, obj3, obj4, obj5];

  const offsets: number[] = [];
  let position = 0;
  for (const obj of objects) {
    offsets.push(position);
    position += encoder.encode(obj).length;
  }

  const xref = [
    "xref\n0 6\n",
    "0000000000 65535 f \n",
    ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`),
  ].join("");

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${position}\n%%EOF`;
  const pdfBytes = encoder.encode(objects.join("") + xref + trailer);
  return new Blob([pdfBytes], { type: "application/pdf" });
}

export default function Payroll() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const payrollQuery = usePayrollRecords(companyId);
  const employeesQuery = useEmployees(companyId);
  const createPayrollMutation = useCreatePayroll();
  const updateStatusMutation = useUpdatePayrollStatus();
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [form, setForm] = useState({ employeeId: "", period: format(new Date(), "yyyy-MM"), baseSalary: "0", allowances: "0", deductions: "0" });

  const payrollRecords = payrollQuery.data ?? [];
  const selectedRecords = useMemo(
    () => payrollRecords.filter((record) => formatMonth(record.period_month, record.period_year) === selectedPeriod),
    [payrollRecords, selectedPeriod],
  );

  const statistics = useMemo(() => {
    const totalPayroll = selectedRecords.reduce((sum, record) => sum + Number(record.net_salary), 0);
    const paidCount = selectedRecords.filter((record) => record.status === "paid").length;
    const pendingCount = selectedRecords.filter((record) => record.status !== "paid").length;
    return { totalPayroll, paidCount, pendingCount, totalRecords: selectedRecords.length };
  }, [selectedRecords]);

  const chartData = useMemo(() => {
    const summary = new Map<string, { period: string; total: number }>();
    payrollRecords.forEach((record) => {
      const periodKey = formatMonth(record.period_month, record.period_year);
      const data = summary.get(periodKey) ?? { period: periodKey, total: 0 };
      data.total += Number(record.net_salary);
      summary.set(periodKey, data);
    });
    return Array.from(summary.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [payrollRecords]);

  const currentNetTotal = Number(form.baseSalary || 0) + Number(form.allowances || 0) - Number(form.deductions || 0);

  const handleCreatePayroll = async () => {
    if (!companyId || !form.employeeId) {
      toast({ title: "Isi data payroll", description: "Pilih karyawan dan periode terlebih dahulu." });
      return;
    }

    const [year, month] = form.period.split("-").map(Number);
    try {
      await createPayrollMutation.mutateAsync({
        companyId,
        employeeId: form.employeeId,
        periodMonth: month,
        periodYear: year,
        baseSalary: Number(form.baseSalary),
        allowances: Number(form.allowances),
        deductions: Number(form.deductions),
        status: "draft",
      });
      toast({ title: "Payroll dibuat", description: "Data payroll berhasil disimpan." });
      setForm({ employeeId: "", period: selectedPeriod, baseSalary: "0", allowances: "0", deductions: "0" });
    } catch (error) {
      toast({ title: "Gagal membuat payroll", description: "Silakan coba lagi." });
    }
  };

  const handleMarkPaid = async (payrollId: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: payrollId, status: "paid" });
      toast({ title: "Status diperbarui", description: "Payroll telah ditandai sebagai dibayar." });
    } catch (error) {
      toast({ title: "Gagal memperbarui status", description: "Silakan coba lagi." });
    }
  };

  const downloadCsv = () => {
    const rows = selectedRecords.map((record) => [
      `${record.period_year}-${String(record.period_month).padStart(2, "0")}`,
      record.employee?.full_name ?? "-",
      record.employee?.position ?? "-",
      record.base_salary,
      record.allowances,
      record.deductions,
      record.net_salary,
      record.status,
    ]);
    const csv = [
      ["Periode", "Karyawan", "Jabatan", "Gaji Pokok", "Tunjangan", "Potongan", "Total", "Status"],
      ...rows,
    ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payroll-${selectedPeriod}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const lines = [
      `Payroll - ${selectedPeriod}`,
      "",
      "Periode | Karyawan | Jabatan | Gaji Pokok | Tunjangan | Potongan | Total | Status",
      ...selectedRecords.map((record) =>
        `${record.period_year}-${String(record.period_month).padStart(2, "0")} | ${record.employee?.full_name ?? "-"} | ${record.employee?.position ?? "-"} | ${currencyFormatter.format(record.base_salary)} | ${currencyFormatter.format(record.allowances)} | ${currencyFormatter.format(record.deductions)} | ${currencyFormatter.format(record.net_salary)} | ${record.status}`,
      ),
      "",
      `Total Payroll: ${currencyFormatter.format(statistics.totalPayroll)}`,
    ];
    const blob = buildPdfDocument(lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payroll-${selectedPeriod}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader eyebrow="Finance" title={<>Payroll <span className="gradient-text">Summary</span></>} description="Ringkasan penggajian karyawan outsourcing berdasarkan kontrak aktif." />

        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="border-border/60 bg-gradient-card"><CardContent className="pt-6 text-sm">Total Data Payroll<div className="mt-2 text-3xl font-bold">{statistics.totalRecords}</div></CardContent></Card>
          <Card className="border-border/60 bg-gradient-card"><CardContent className="pt-6 text-sm">Total Pengeluaran<div className="mt-2 text-3xl font-bold">{currencyFormatter.format(statistics.totalPayroll)}</div></CardContent></Card>
          <Card className="border-border/60 bg-gradient-card"><CardContent className="pt-6 text-sm">Status Dibayar<div className="mt-2 text-3xl font-bold">{statistics.paidCount}</div></CardContent></Card>
          <Card className="border-border/60 bg-gradient-card"><CardContent className="pt-6 text-sm">Menunggu Pembayaran<div className="mt-2 text-3xl font-bold">{statistics.pendingCount}</div></CardContent></Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="border-border/60 bg-gradient-card">
            <CardHeader><CardTitle className="text-base">Buat Payroll Baru</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Karyawan</Label><Select value={form.employeeId} onValueChange={(value) => setForm((current) => ({ ...current, employeeId: value }))}><SelectTrigger><SelectValue placeholder="Pilih karyawan" /></SelectTrigger><SelectContent>{employeesQuery.data?.map((employee) => (<SelectItem key={employee.id} value={employee.id}>{employee.full_name}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Periode</Label><Input type="month" value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Gaji Pokok</Label><Input type="number" value={form.baseSalary} onChange={(event) => setForm((current) => ({ ...current, baseSalary: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Tunjangan</Label><Input type="number" value={form.allowances} onChange={(event) => setForm((current) => ({ ...current, allowances: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Potongan</Label><Input type="number" value={form.deductions} onChange={(event) => setForm((current) => ({ ...current, deductions: event.target.value }))} /></div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Total Otomatis</p>
                <p className="mt-2 text-2xl font-semibold">{currencyFormatter.format(currentNetTotal)}</p>
              </div>
              <Button onClick={handleCreatePayroll} className="w-full" disabled={createPayrollMutation.isLoading}>
                {createPayrollMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Payroll"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-card xl:col-span-2">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="text-base">Statistik Payroll</CardTitle><div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" className="gap-2" onClick={downloadCsv}><Download className="h-4 w-4" /> CSV</Button><Button variant="outline" size="sm" className="gap-2" onClick={downloadPdf}><Download className="h-4 w-4" /> PDF</Button></div></CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="min-h-[220px] flex items-center justify-center text-sm text-muted-foreground">Tidak ada data payroll untuk ditampilkan.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" tick={{ fill: "var(--muted-foreground)" }} />
                    <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fill: "var(--muted-foreground)" }} />
                    <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
                    <Bar dataKey="total" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {payrollQuery.isError && <ErrorState title="Gagal memuat payroll" onRetry={() => payrollQuery.refetch()} />}
        {payrollQuery.isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <Card className="border-border/60 bg-gradient-card overflow-hidden">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div><CardTitle className="text-base">Payroll {selectedPeriod}</CardTitle><p className="text-sm text-muted-foreground">{selectedRecords.length} catatan ditemukan</p></div>
              <div className="flex flex-wrap items-center gap-3"><Input type="month" value={selectedPeriod} onChange={(event) => setSelectedPeriod(event.target.value)} className="h-10 rounded-xl border-border/60 bg-muted/30" /></div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3">Karyawan</th>
                    <th className="px-5 py-3">Periode</th>
                    <th className="px-5 py-3">Gaji Pokok</th>
                    <th className="px-5 py-3">Tunjangan</th>
                    <th className="px-5 py-3">Potongan</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {selectedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada data payroll untuk periode ini.</td>
                    </tr>
                  ) : (
                    selectedRecords.map((record) => (
                      <tr key={record.id} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="px-5 py-4 font-medium">{record.employee?.full_name ?? "-"}</td>
                        <td className="px-5 py-4">{record.period_year}-{String(record.period_month).padStart(2, "0")}</td>
                        <td className="px-5 py-4">{currencyFormatter.format(record.base_salary)}</td>
                        <td className="px-5 py-4">{currencyFormatter.format(record.allowances)}</td>
                        <td className="px-5 py-4">{currencyFormatter.format(record.deductions)}</td>
                        <td className="px-5 py-4">{currencyFormatter.format(record.net_salary)}</td>
                        <td className="px-5 py-4"><Badge variant="outline">{record.status}</Badge></td>
                        <td className="px-5 py-4 text-right">
                          {record.status !== "paid" ? (
                            <Button size="sm" variant="ghost" onClick={() => handleMarkPaid(record.id)} disabled={updateStatusMutation.isLoading}>
                              Tandai Dibayar
                            </Button>
                          ) : (
                            <span className="text-sm text-success">Dibayar</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

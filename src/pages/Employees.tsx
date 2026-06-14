import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees, useCreateEmployee } from "@/hooks/use-employees";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/PageSkeleton";

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/15 text-warning border-warning/30",
};

const Employees = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ fullName: "", position: "", department: "", email: "", phone: "", salary: "" });
  const employeesQuery = useEmployees(companyId);
  const createMutation = useCreateEmployee();

  const employees = employeesQuery.data ?? [];
  const filteredEmployees = useMemo(
    () => employees.filter((employee) =>
      employee.full_name.toLowerCase().includes(search.toLowerCase()) ||
      employee.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      employee.position.toLowerCase().includes(search.toLowerCase()),
    ),
    [employees, search],
  );

  const handleCreate = async () => {
    if (!companyId) return;

    await createMutation.mutateAsync({
      company_id: companyId,
      user_id: null,
      employee_code: `EMP-${Date.now().toString().slice(-6)}`,
      full_name: form.fullName,
      email: form.email || null,
      phone: form.phone || null,
      position: form.position,
      department: form.department || null,
      hire_date: new Date().toISOString().split("T")[0],
      salary: form.salary ? Number(form.salary) : null,
      status: "active",
      avatar_url: null,
    });
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader
          eyebrow="Workforce"
          title={<>Employees <span className="gradient-text">Directory</span></>}
          description="Kelola tenaga outsourcing, status kerja, dan dokumentasi karyawan dengan data Supabase real-time."
          actions={
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-11 gap-2 rounded-xl bg-gradient-primary"><Plus className="h-4 w-4" /> Tambah Karyawan</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Karyawan Baru</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Nama Lengkap</Label><Input value={form.fullName} onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))} required /></div>
                    <div className="space-y-2"><Label>Posisi</Label><Input value={form.position} onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))} required /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm((current) => ({ ...current, department: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Gaji (Rp)</Label><Input type="number" value={form.salary} onChange={(e) => setForm((current) => ({ ...current, salary: e.target.value }))} /></div>
                  </div>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Karyawan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {employeesQuery.isError && <ErrorState title="Gagal memuat karyawan" onRetry={() => employeesQuery.refetch()} />}
        {employeesQuery.isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
            <div className="flex flex-col gap-3 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Semua Karyawan</h3>
                <p className="text-xs text-muted-foreground">{filteredEmployees.length} hasil dari {employees.length} karyawan</p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari nama, kode, atau posisi…" className="h-10 rounded-xl border-border/60 bg-muted/30 pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3">Nama</th>
                    <th className="hidden px-5 py-3 md:table-cell">Kode</th>
                    <th className="px-5 py-3">Posisi</th>
                    <th className="hidden px-5 py-3 lg:table-cell">Departemen</th>
                    <th className="px-5 py-3">Gaji</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary", employee.employee_code ? "" : "bg-muted")}>{employee.full_name.slice(0, 2).toUpperCase()}</div>
                          <div>
                            <p className="font-medium">{employee.full_name}</p>
                            <p className="text-xs text-muted-foreground">{employee.email ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell font-mono text-xs text-muted-foreground">{employee.employee_code}</td>
                      <td className="px-5 py-4">{employee.position}</td>
                      <td className="hidden px-5 py-4 lg:table-cell">{employee.department ?? "-"}</td>
                      <td className="px-5 py-4 font-mono text-sm">{employee.salary != null ? `Rp ${employee.salary.toLocaleString("id-ID")}` : "-"}</td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusStyles[employee.status] ?? "bg-muted text-muted-foreground border-border")}>{employee.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Employees;

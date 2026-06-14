import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruitments, useCreateRecruitment, useHireCandidate } from "@/hooks/use-recruitments";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/PageSkeleton";

const statusMap: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/30",
  screening: "bg-warning/10 text-warning border-warning/30",
  interview: "bg-secondary/10 text-secondary border-secondary/30",
  offer: "bg-accent/10 text-accent border-accent/30",
  hired: "bg-success/10 text-success border-success/30",
  closed: "bg-muted/10 text-muted-foreground border-border",
};

export default function Recruitment() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ candidateName: "", position: "", department: "", salaryMin: "", salaryMax: "", openings: "1" });
  const recruitmentsQuery = useRecruitments(companyId);
  const createRecruitmentMutation = useCreateRecruitment();
  const hireCandidateMutation = useHireCandidate();

  const recruitments = recruitmentsQuery.data ?? [];
  const filteredRecruitments = useMemo(
    () => recruitments.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.department?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()),
    ),
    [recruitments, search],
  );

  const handleCreateOpening = async () => {
    if (!companyId) return;
    await createRecruitmentMutation.mutateAsync({
      companyId,
      title: form.candidateName,
      department: form.department || null,
      description: form.position,
      requirements: "CV dan portofolio relevan",
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      openings: Number(form.openings),
      createdBy: user?.id ?? null,
    });
  };

  const handleHire = async (itemId: string, candidateName: string, position: string, department?: string | null, salary?: number | null) => {
    if (!companyId) return;
    await hireCandidateMutation.mutateAsync({
      recruitmentId: itemId,
      companyId,
      fullName: candidateName,
      email: null,
      phone: null,
      position: position || "Staff",
      department: department ?? null,
      salary: salary ?? null,
      createdBy: user?.id ?? null,
    });
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader
          eyebrow="Talent"
          title={<>Recruitment <span className="gradient-text">Pipeline</span></>}
          description="Pantau kandidat, status aplikasi, dan hire ke dalam karyawan outsourcing."
          actions={
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-11 gap-2 rounded-xl bg-gradient-primary"><Plus className="h-4 w-4" /> Buka Posisi</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Buat Rekrutmen Baru</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Nama Kandidat</Label><Input value={form.candidateName} onChange={(e) => setForm((current) => ({ ...current, candidateName: e.target.value }))} required /></div>
                  <div className="space-y-2"><Label>Posisi</Label><Input value={form.position} onChange={(e) => setForm((current) => ({ ...current, position: e.target.value }))} required /></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Departemen</Label><Input value={form.department} onChange={(e) => setForm((current) => ({ ...current, department: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Openings</Label><Input type="number" min={1} value={form.openings} onChange={(e) => setForm((current) => ({ ...current, openings: e.target.value }))} /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Gaji Minimum</Label><Input type="number" value={form.salaryMin} onChange={(e) => setForm((current) => ({ ...current, salaryMin: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Gaji Maksimum</Label><Input type="number" value={form.salaryMax} onChange={(e) => setForm((current) => ({ ...current, salaryMax: e.target.value }))} /></div>
                  </div>
                  <Button onClick={handleCreateOpening} disabled={createRecruitmentMutation.isLoading} className="w-full">
                    {createRecruitmentMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Rekrutmen"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Open", value: recruitments.filter((item) => item.status === "open").length },
            { label: "Interview", value: recruitments.filter((item) => item.status === "interview").length },
            { label: "Offering", value: recruitments.filter((item) => item.status === "offer").length },
            { label: "Hired", value: recruitments.filter((item) => item.status === "hired").length },
          ].map((card) => (
            <Card key={card.label} className="border-border/60 bg-gradient-card"><CardContent className="pt-6 text-sm"><div className="font-semibold">{card.label}</div><div className="mt-2 text-3xl font-bold">{card.value}</div></CardContent></Card>
          ))}
        </div>

        {recruitmentsQuery.isError && <ErrorState title="Gagal memuat rekrutmen" onRetry={() => recruitmentsQuery.refetch()} />}
        {recruitmentsQuery.isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
            <div className="flex flex-col gap-3 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Pipeline Kandidat</h3>
                <p className="text-xs text-muted-foreground">{filteredRecruitments.length} kandidat ditemukan</p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari nama atau posisi…" className="h-10 rounded-xl border-border/60 bg-muted/30 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3">Kandidat</th>
                    <th className="px-5 py-3">Posisi</th>
                    <th className="hidden px-5 py-3 lg:table-cell">Departemen</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Openings</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRecruitments.map((item) => (
                    <tr key={item.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-5 py-4 font-medium">{item.title}</td>
                      <td className="px-5 py-4">{item.description ?? "-"}</td>
                      <td className="hidden px-5 py-4 lg:table-cell">{item.department ?? "-"}</td>
                      <td className="px-5 py-4"><Badge variant="outline" className={statusMap[item.status] ?? "bg-muted text-muted-foreground border-border"}>{item.status}</Badge></td>
                      <td className="px-5 py-4">{item.openings}</td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" variant="ghost" disabled={item.status === "hired" || hireCandidateMutation.isLoading} onClick={() => handleHire(item.id, item.title, item.description ?? "Staff", item.department, item.salary_max ?? item.salary_min ?? null)}>
                          {item.status === "hired" ? "Hired" : "Hire"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecruitments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada kandidat. Buat rekrutmen baru untuk mengisi pipeline.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

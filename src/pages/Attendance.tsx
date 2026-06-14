import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parse, differenceInMinutes } from "date-fns";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarDays, Loader2, Clock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance, useCheckIn, useCheckOut } from "@/hooks/use-attendance";
import { useEmployees } from "@/hooks/use-employees";
import { toast } from "@/hooks/use-toast";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/PageSkeleton";

const statusStyles: Record<string, string> = {
  present: "bg-success/10 text-success border-success/30",
  absent: "bg-destructive/10 text-destructive border-destructive/30",
  late: "bg-warning/10 text-warning border-warning/30",
  leave: "bg-secondary/10 text-secondary border-secondary/30",
  remote: "bg-primary/10 text-primary border-primary/30",
};

function parseTimeValue(value?: string | null) {
  if (!value) return null;
  return parse(value, "HH:mm", new Date());
}

function getWorkedMinutes(record: { check_in: string | null; check_out: string | null }) {
  const start = parseTimeValue(record.check_in);
  const end = parseTimeValue(record.check_out);
  if (!start || !end) return 0;
  return Math.max(0, differenceInMinutes(end, start));
}

export default function Attendance() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const queryClient = useQueryClient();
  const attendanceQuery = useAttendance(companyId);
  const employeesQuery = useEmployees(companyId);
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`attendance-${companyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance", filter: `company_id=eq.${companyId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.attendance(companyId) });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);

  const attendance = attendanceQuery.data ?? [];
  const dailyRecords = useMemo(
    () => attendance.filter((record) => record.date === selectedDate),
    [attendance, selectedDate],
  );

  const summary = useMemo(() => {
    const totals = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      remote: 0,
      minutes: 0,
    };

    dailyRecords.forEach((record) => {
      totals[record.status] = (totals[record.status] ?? 0) + 1;
      totals.minutes += getWorkedMinutes(record);
    });

    return totals;
  }, [dailyRecords]);

  const handleCheckIn = async () => {
    if (!companyId || !selectedEmployeeId) {
      toast({ title: "Pilih karyawan terlebih dahulu", description: "Silakan pilih karyawan untuk check-in." });
      return;
    }

    try {
      await checkInMutation.mutateAsync({
        companyId,
        employeeId: selectedEmployeeId,
        date: selectedDate,
        checkIn: format(new Date(), "HH:mm"),
        status: "present",
      });
      toast({ title: "Check-in berhasil", description: "Absensi berhasil dicatat." });
      setSelectedEmployeeId("");
    } catch (error) {
      toast({ title: "Gagal check-in", description: "Silakan coba lagi." });
    }
  };

  const handleCheckOut = async (attendanceId: string) => {
    try {
      await checkOutMutation.mutateAsync({ id: attendanceId, checkOut: format(new Date(), "HH:mm"), companyId: companyId! });
      toast({ title: "Check-out berhasil", description: "Jam pulang telah tersimpan." });
    } catch (error) {
      toast({ title: "Gagal check-out", description: "Silakan coba lagi." });
    }
  };

  const dateLabel = format(new Date(selectedDate), "dd MMMM yyyy");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader eyebrow="Operations" title={<>Attendance <span className="gradient-text">Monitoring</span></>} description="Pantau kehadiran, keterlambatan, dan lembur tenaga outsourcing." />

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="border-border/60 bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Filter Tanggal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>{dateLabel}</span>
              </div>
              <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="max-w-[220px]" />
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full rounded-xl bg-gradient-primary gap-2"><Plus className="h-4 w-4" /> Tambah Check-in</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Check-in Karyawan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Pilih Karyawan</Label>
                      <Select value={selectedEmployeeId} onValueChange={(value) => setSelectedEmployeeId(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih karyawan..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employeesQuery.data?.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>{employee.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCheckIn} className="w-full" disabled={checkInMutation.isLoading || !selectedEmployeeId}>
                      {checkInMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Check-in"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Rekap Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Total Absensi</p>
                  <p className="mt-2 text-3xl font-semibold">{dailyRecords.length}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs uppercase text-muted-foreground">Total Jam Kerja</p>
                  <p className="mt-2 text-3xl font-semibold">{(summary.minutes / 60).toFixed(1)}h</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["present", "late", "absent", "leave", "remote"] as const).map((status) => (
                  <div key={status} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2 text-xs uppercase text-muted-foreground">
                      <span>{status}</span>
                      <Badge className={statusStyles[status]}>{summary[status]}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Riwayat Absensi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Menampilkan riwayat absensi pada tanggal yang dipilih serta update realtime.</p>
              <p>Gunakan check-out untuk menutup jam kerja dan hitung total otomatis.</p>
            </CardContent>
          </Card>
        </div>

        {attendanceQuery.isError && <ErrorState title="Gagal memuat absensi" onRetry={() => attendanceQuery.refetch()} />}
        {attendanceQuery.isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <Card className="border-border/60 bg-gradient-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Daftar Absensi</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {dailyRecords.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/60 bg-muted/50 p-8 text-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Belum ada absensi pada tanggal ini.</p>
                  <p className="max-w-sm text-xs text-muted-foreground">Silakan tambahkan check-in karyawan atau pilih tanggal lain untuk melihat riwayat.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="px-5 py-3">Karyawan</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Check-in</th>
                      <th className="px-5 py-3">Check-out</th>
                      <th className="px-5 py-3">Jam Kerja</th>
                      <th className="px-5 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRecords.map((record) => (
                      <tr key={record.id} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="px-5 py-4 font-medium">{record.employee?.full_name ?? "-"}</td>
                        <td className="px-5 py-4"><Badge variant="outline" className={statusStyles[record.status] ?? "bg-muted text-muted-foreground border-border"}>{record.status}</Badge></td>
                        <td className="px-5 py-4">{record.check_in ?? "-"}</td>
                        <td className="px-5 py-4">{record.check_out ?? "-"}</td>
                        <td className="px-5 py-4">{(getWorkedMinutes(record) / 60).toFixed(1)}h</td>
                        <td className="px-5 py-4 text-right">
                          <Button size="sm" variant="ghost" disabled={Boolean(record.check_out)} onClick={() => handleCheckOut(record.id)}>
                            {record.check_out ? "Selesai" : "Check Out"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

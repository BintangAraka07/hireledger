import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { StatsGrid } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Boxes, Plus, Sparkles } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAuth } from "@/contexts/AuthContext";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ErrorState } from "@/components/ErrorState";
import { DashboardSkeleton } from "@/components/PageSkeleton";
import { truncateHash } from "@/lib/hash";
import { SOLANA_NETWORK } from "@/lib/constants";
import {
  useDashboardStats,
  usePayrollChart,
  useEmployeeGrowth,
  useRecentActivity,
  useExpiringContracts,
} from "@/hooks/use-dashboard";
import { payrollSummary, employeeGrowth, recentActivities, expiryContracts } from "@/lib/mock-data";

export function DashboardView() {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const companyId = user?.companyId;

  const statsQuery = useDashboardStats(companyId);
  const payrollQuery = usePayrollChart(companyId);
  const growthQuery = useEmployeeGrowth(companyId);
  const activityQuery = useRecentActivity(companyId);
  const expiringQuery = useExpiringContracts(companyId);

  const isLoading = statsQuery.isLoading;
  const hasError = statsQuery.isError;

  const payrollData = payrollQuery.data?.some((d) => d.total > 0) ? payrollQuery.data : payrollSummary;
  const growthData = growthQuery.data?.some((d) => d.aktif > 0) ? growthQuery.data : employeeGrowth;
  const activities = activityQuery.data?.length
    ? activityQuery.data.map((a) => ({
        aksi: a.action,
        user: (a.user as { full_name?: string } | undefined)?.full_name ?? "System",
        waktu: new Date(a.created_at).toLocaleString("id-ID"),
        status: a.entity_type,
      }))
    : recentActivities;
  const expiring = expiringQuery.data?.length ? expiringQuery.data : expiryContracts;

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } finally {
        setBalanceLoading(false);
      }
    };

    void fetchBalance();
  }, [publicKey, connection]);

  if (isLoading) return <DashboardSkeleton />;

  if (hasError) {
    return (
      <ErrorState
        title="Gagal Memuat Dashboard"
        message="Periksa koneksi Supabase dan pastikan migrasi database sudah dijalankan."
        onRetry={() => statsQuery.refetch()}
      />
    );
  }

  const firstName = user?.fullName?.split(" ")[0] ?? "User";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 pb-10 md:p-6 lg:space-y-10 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-6 md:p-8">
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                {user?.companyName ?? "Tenant"} · Solana Devnet
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back, <span className="gradient-text">{firstName}</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              SaaS multi-tenant: recruitment, kontrak PKWT, payroll, attendance, dan verifikasi blockchain.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <WalletConnectButton />
            <Button asChild className="h-11 gap-2 rounded-xl bg-gradient-primary">
              <Link to="/contracts"><Plus className="h-4 w-4" /> Buat Kontrak PKWT</Link>
            </Button>
          </div>
        </div>
      </section>

      <StatsGrid stats={statsQuery.data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-gradient-card">
          <CardHeader><CardTitle className="text-base">Ringkasan Payroll (Juta Rupiah)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ total: { label: "Payroll", color: "hsl(var(--primary))" } }} className="h-[220px] w-full">
              <AreaChart data={payrollData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="total" stroke="var(--color-total)" fill="var(--color-total)" fillOpacity={0.25} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-gradient-card">
          <CardHeader><CardTitle className="text-base">Pertumbuhan Karyawan</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ aktif: { label: "Aktif", color: "hsl(var(--accent))" } }} className="h-[220px] w-full">
              <LineChart data={growthData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="aktif" stroke="var(--color-aktif)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/60 bg-gradient-card xl:col-span-2">
          <CardHeader><CardTitle className="text-base">Aktivitas Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activities.map((act, i) => (
              <div key={`${act.waktu}-${i}`} className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{act.aksi}</p>
                  <p className="text-xs text-muted-foreground">{act.user} · {act.waktu}</p>
                </div>
                <span className="text-xs text-primary">{act.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="border-border/60 bg-gradient-card">
            <CardHeader><CardTitle className="text-base">Solana Wallet</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <WalletConnectButton className="w-full" showBalance />
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">Network: {SOLANA_NETWORK}</div>
              {publicKey && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs font-mono">
                  {truncateHash(publicKey.toBase58(), 8, 8)} · {balanceLoading ? "..." : `${(balance ?? 0).toFixed(4)} SOL`}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-gradient-card">
            <CardHeader><CardTitle className="text-base">Kontrak Jatuh Tempo</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {expiring.map((row) => (
                <div key={row.kontrak} className="rounded-lg border border-border/60 bg-muted/20 p-2 text-xs">
                  <p className="font-medium">{row.kontrak} · {row.karyawan}</p>
                  <p className="text-muted-foreground">Sisa {row.sisaHari} hari</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-gradient-card">
            <CardHeader><CardTitle className="text-base">Notifikasi</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-warning" /> {statsQuery.data?.pendingApprovals ?? 0} kontrak butuh persetujuan</p>
              <p className="flex items-center gap-2"><Boxes className="h-3.5 w-3.5 text-primary" /> {statsQuery.data?.pendingBlockchain ?? 0} transaksi blockchain menunggu</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

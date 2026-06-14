import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileCheck, FileX, FileClock, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useContracts, useContractStats, useCreateContract, useApproveContract } from "@/hooks/use-contracts";
import { useEmployees } from "@/hooks/use-employees";
import { queryKeys } from "@/lib/api-client";
import { useWallet } from "@solana/wallet-adapter-react";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/PageSkeleton";
import { CONTRACT_STATUS_LABELS } from "@/lib/constants";
import { truncateHash } from "@/lib/hash";
import { anchorDocumentHash, getExplorerUrl } from "@/integrations/solana/client";
import { saveSolanaTransaction } from "@/services/solana.service";
import { updateContractBlockchain } from "@/services/contracts.service";
import { toast } from "@/components/ui/sonner";
import { PublicKey } from "@solana/web3.js";
import type { ContractStatus } from "@/types";
import { WalletConnectButton } from "@/components/WalletConnectButton";

const statusStyles: Partial<Record<ContractStatus, string>> = {
  active: "bg-success/15 text-success border-success/30",
  pending_legal: "bg-warning/15 text-warning border-warning/30",
  pending_hr: "bg-warning/15 text-warning border-warning/30",
  completed: "bg-primary/15 text-primary border-primary/30",
  expired: "bg-destructive/15 text-destructive border-destructive/30",
  draft: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

function MiniStat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof FileCheck; tone: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

const Contracts = () => {
  const { user, hasRole } = useAuth();
  const { publicKey, signTransaction, connected } = useWallet();
  const queryClient = useQueryClient(); // ✅ For optimistic updates
  const companyId = user?.companyId;
  const { data: contracts, isLoading, isError, refetch } = useContracts(companyId);
  const { data: stats } = useContractStats(companyId);
  const { data: employees } = useEmployees(companyId);
  const createMutation = useCreateContract();
  const approveMutation = useApproveContract();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ employeeId: "", position: "", startDate: "", endDate: "", salary: "" });
  const [anchoring, setAnchoring] = useState<string | null>(null);

  // ✅ Memoize filtered results so it only recalculates when contracts or search changes
  const filtered = useMemo(
    () => (contracts ?? []).filter(
      (c) =>
        c.contract_number.toLowerCase().includes(search.toLowerCase()) ||
        c.employee?.full_name?.toLowerCase().includes(search.toLowerCase()),
    ),
    [contracts, search]
  );

  const handleCreate = async () => {
    if (!companyId || !user?.id || !form.employeeId) return;
    const contractNumber = `PKWT-${Date.now().toString().slice(-6)}`;
    const content = `${contractNumber}-${form.employeeId}-${form.startDate}-${form.endDate}`;
    try {
      await createMutation.mutateAsync({
        companyId,
        employeeId: form.employeeId,
        contractNumber,
        position: form.position,
        startDate: form.startDate,
        endDate: form.endDate,
        salary: form.salary ? Number(form.salary) : undefined,
        createdBy: user.id,
        documentContent: content,
      });
      toast.success("Kontrak PKWT dibuat", { description: "Menunggu approval Legal & HR." });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat kontrak");
    }
  };

  const handleApprove = async (contractId: string, role: "legal" | "hr", approved: boolean) => {
    if (!user?.id) return;
    try {
      await approveMutation.mutateAsync({ contractId, approverId: user.id, approverRole: role, approved });
      toast.success(approved ? "Kontrak disetujui" : "Kontrak ditolak");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal approval");
    }
  };

  const handleAnchor = async (contractId: string, documentHash: string) => {
    // Cek wallet terconnect dengan reliable
    if (!publicKey || !connected) {
      toast.error("❌ Hubungkan Phantom Wallet terlebih dahulu");
      console.warn("Wallet not connected:", { publicKey, connected });
      return;
    }

    // Cek signTransaction tersedia
    if (!signTransaction) {
      toast.error("⚠️ Wallet belum siap. Silakan refresh halaman dan reconnect Phantom");
      console.warn("signTransaction not available");
      return;
    }

    setAnchoring(contractId);

    try {
      console.log("🔐 [handleAnchor] Signing transaction untuk contract:", contractId);
      const { signature, slot } = await anchorDocumentHash(
        publicKey,
        signTransaction,
        documentHash,
        contractId,
      );

      console.log("✅ [handleAnchor] Transaction signed:", { signature, slot });

      // Update contract blockchain status - CRITICAL: Check return value
      const updateResult = await updateContractBlockchain(contractId, {
        documentHash,
        solanaSignature: signature,
        solanaSlot: slot,
      });
      
      if (!updateResult) {
        console.error("❌ [handleAnchor] updateContractBlockchain returned null - database update failed");
        toast.error("❌ Gagal update blockchain status di database. Silakan coba lagi.");
        setAnchoring(null);
        return;
      }
      
      console.log("✅ [handleAnchor] Contract blockchain status updated:", {
        contractId,
        blockchain_status: updateResult.blockchain_status,
        solana_signature: updateResult.solana_signature,
      });

      // Save Solana transaction record
      const txRecord = await saveSolanaTransaction({
        companyId,
        contractId,
        signature,
        walletAddress: publicKey.toBase58(),
        documentHash,
        slot,
        explorerUrl: getExplorerUrl(signature),
      });
      
      console.log("✅ [handleAnchor] Solana transaction saved:", {
        id: txRecord?.id,
        signature: txRecord?.signature,
      });

      toast.success("Hash tersimpan di Solana Devnet", {
        description: truncateHash(signature),
      });

      // ✅ OPTIMISTIC UPDATE: Update cache immediately instead of refetch
      queryClient.setQueryData(
        queryKeys.contracts(companyId),
        (oldData: typeof contracts | undefined) =>
          oldData?.map(c => 
            c.id === contractId 
              ? { ...c, ...updateResult, solana_signature: signature }
              : c
          ) ?? []
      );
      console.log("✅ [handleAnchor] Cache updated optimistically");
      
    } catch (err) {
      console.error("❌ [handleAnchor] Anchor failed:", {
        contractId,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      toast.error(err instanceof Error ? err.message : "Gagal anchor ke blockchain");
    } finally {
      setAnchoring(null);
    }
  };


  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader
          eyebrow="Smart Contracts"
          title={
            <>
              Kontrak <span className="gradient-text">PKWT</span>
            </>
          }
          description="Generate kontrak, approval Legal/HR, hash dokumen, dan verifikasi Solana Devnet."
          actions={
            <div className="flex items-center gap-3">
              <WalletConnectButton size="sm" />

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-11 gap-2 rounded-xl bg-gradient-primary">
                    <Plus className="h-4 w-4" />
                    Buat Kontrak
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Buat Kontrak PKWT</DialogTitle>
                  </DialogHeader>

          <div className="space-y-4">

            <div className="space-y-2">
              <Label>Karyawan</Label>

              <Select
                value={form.employeeId}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    employeeId: v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih karyawan" />
                </SelectTrigger>

                <SelectContent>
                  {(employees ?? []).map((e) => (
                    <SelectItem
                      key={e.id}
                      value={e.id}
                    >
                      {e.full_name} — {e.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Posisi</Label>

              <Input
                value={form.position}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    position: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="space-y-2">
                <Label>Mulai</Label>

                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Selesai</Label>

                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>

            </div>

            <div className="space-y-2">
              <Label>Gaji (Rp)</Label>

              <Input
                type="number"
                value={form.salary}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    salary: e.target.value,
                  }))
                }
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Generate Kontrak"
              )}
            </Button>

          </div>
        </DialogContent>
      </Dialog>

    </div>
  }
/>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Aktif" value={String(stats?.active ?? 0)} icon={FileCheck} tone="text-success" />
          <MiniStat label="Pending" value={String(stats?.pending ?? 0)} icon={FileClock} tone="text-warning" />
          <MiniStat label="Selesai" value={String(stats?.completed ?? 0)} icon={FileCheck} tone="text-primary" />
          <MiniStat label="Expired" value={String(stats?.expired ?? 0)} icon={FileX} tone="text-destructive" />
        </div>

        {isError && <ErrorState onRetry={() => refetch()} />}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
            <div className="flex flex-col gap-3 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">
              <h3 className="font-display text-lg font-semibold">Semua Kontrak</h3>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari PKWT..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3">Kontrak</th>
                    <th className="px-5 py-3">Karyawan</th>
                    <th className="hidden px-5 py-3 md:table-cell">Periode</th>
                    <th className="hidden px-5 py-3 lg:table-cell">Hash</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Blockchain</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="px-5 py-4 font-mono text-xs">{c.contract_number}</td>
                      <td className="px-5 py-4 text-sm">{c.employee?.full_name ?? "-"}</td>
                      <td className="hidden px-5 py-4 font-mono text-xs md:table-cell">{c.start_date} → {c.end_date}</td>
                      <td className="hidden px-5 py-4 font-mono text-xs lg:table-cell">{c.document_hash ? truncateHash(c.document_hash) : "—"}</td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={cn("rounded-full", statusStyles[c.status])}>
                          {CONTRACT_STATUS_LABELS[c.status] ?? c.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={cn(c.blockchain_status === "confirmed" ? "text-success" : "text-warning")}>
                          {c.blockchain_status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1">
                        {hasRole("legal") && c.status === "pending_legal" && (
                          <Button size="sm" variant="ghost" onClick={() => handleApprove(c.id, "legal", true)}>Legal ✓</Button>
                        )}
                        {hasRole("hr", "company_admin") && c.status === "pending_hr" && (
                          <Button size="sm" variant="ghost" onClick={() => handleApprove(c.id, "hr", true)}>HR ✓</Button>
                        )}
                        {c.document_hash && c.blockchain_status !== "confirmed" && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            disabled={anchoring === c.id || !publicKey}
                            title={!publicKey ? "❌ Hubungkan Phantom Wallet terlebih dahulu" : "Anchor ke blockchain"}
                            onClick={() => {
                              if (!publicKey || !connected) {
                                toast.error("❌ Phantom Wallet belum terconnect. Klik tombol 'Connect Phantom' di atas!");
                                return;
                              }
                               
                              if (!c.id || !c.document_hash) {
                                toast.error("Data kontrak belum lengkap");
                                return;
                              }

                              handleAnchor(String(c.id), c.document_hash);
                            }}
                          >
                            {anchoring === c.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : !publicKey ? (
                              <span className="text-destructive">⚠️</span>
                            ) : (
                              <ShieldCheck className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        {c.solana_signature && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={getExplorerUrl(c.solana_signature)} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
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

export default Contracts;

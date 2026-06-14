import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Boxes, ShieldCheck, Copy, ExternalLink, Activity, Cpu, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAuth } from "@/contexts/AuthContext";
import { useSolanaTransactions, useSolanaStats } from "@/hooks/use-solana";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ErrorState } from "@/components/ErrorState";
import { TableSkeleton } from "@/components/PageSkeleton";
import { SOLANA_NETWORK } from "@/lib/constants";
import { truncateHash } from "@/lib/hash";
import { verifyHashOnChain } from "@/integrations/solana/client";
import { toast } from "@/components/ui/sonner";

function NetCard({ icon: Icon, label, value, mono }: { icon: typeof Activity; label: string; value: string; mono?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={cn("font-display text-xl font-bold", mono && "font-mono")}>{value}</p>
        </div>
      </div>
    </div>
  );
}

const Blockchain = () => {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [walletTxs, setWalletTxs] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const companyId = user?.companyId;
  const { data: txs, isLoading, isError, refetch } = useSolanaTransactions(companyId);
  const { data: stats } = useSolanaStats(companyId);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      setWalletTxs([]);
      return;
    }

    const fetchWalletData = async () => {
      try {
        setTxLoading(true);
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
        
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
        const txsData = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });
            return {
              signature: sig.signature,
              slot: sig.slot,
              blockTime: sig.blockTime,
              err: sig.err,
              fee: tx?.meta?.fee ?? 0,
            };
          }),
        );
        setWalletTxs(txsData);
      } finally {
        setTxLoading(false);
      }
    };

    void fetchWalletData();
  }, [publicKey, connection]);

  const handleVerify = async (signature: string, hash: string) => {
    try {
      const ok = await verifyHashOnChain(signature, hash);
      toast[ok ? "success" : "error"](ok ? "Hash terverifikasi on-chain" : "Hash tidak ditemukan on-chain");
    } catch {
      toast.error("Verifikasi gagal");
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash disalin");
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <PageHeader
          eyebrow="On-Chain"
          title={<>Blockchain <span className="gradient-text">Registry</span></>}
          description="Kontrak PKWT di-anchor ke Solana Devnet dengan hash dokumen yang dapat diverifikasi."
          actions={
            <>
              <WalletConnectButton />
              <Button variant="outline" className="gap-2" asChild>
                <a href={`https://explorer.solana.com/?cluster=${SOLANA_NETWORK}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> Solana Explorer
                </a>
              </Button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NetCard icon={Network} label="Network" value={`Solana ${SOLANA_NETWORK}`} />
          <NetCard icon={Cpu} label="Wallet Balance" value={balance != null ? `${balance.toFixed(4)} SOL` : "—"} mono />
          <NetCard icon={Activity} label="Wallet Tx" value={String(walletTxs.length)} mono />
          <NetCard icon={Boxes} label="Anchored Contracts" value={String(stats?.confirmedTransactions ?? 0)} />
        </div>

        {isError && <ErrorState onRetry={() => refetch()} />}
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
            <div className="flex items-center justify-between border-b border-border/60 p-5">
              <div>
                <h3 className="font-display text-lg font-semibold">Riwayat Transaksi Solana</h3>
                <p className="text-xs text-muted-foreground">Signature, hash dokumen, dan status verifikasi</p>
              </div>
              {publicKey && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=${SOLANA_NETWORK}`} target="_blank" rel="noreferrer">
                    Lihat Wallet <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3">Kontrak</th>
                    <th className="px-5 py-3">Signature</th>
                    <th className="px-5 py-3">Hash</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(txs ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Belum ada transaksi. Anchor kontrak PKWT dari halaman Contracts.
                      </td>
                    </tr>
                  ) : (
                    (txs ?? []).map((tx) => {
                      const contract = tx.contract as { contract_number?: string; document_hash?: string } | undefined;
                      return (
                        <tr key={tx.id} className="border-b border-border/40 hover:bg-muted/30">
                          <td className="px-5 py-4 font-mono text-xs">{contract?.contract_number ?? "—"}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 font-mono text-xs">
                              {truncateHash(tx.signature)}
                              <Copy className="h-3 w-3 cursor-pointer" onClick={() => copyHash(tx.signature)} />
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs">{tx.document_hash ? truncateHash(tx.document_hash) : "—"}</td>
                          <td className="px-5 py-4">
                            <Badge variant="outline" className={tx.status === "confirmed" ? "text-success" : "text-warning"}>
                              <ShieldCheck className="mr-1 h-3 w-3" /> {tx.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-right space-x-1">
                            {tx.document_hash && (
                              <Button size="sm" variant="ghost" onClick={() => handleVerify(tx.signature, tx.document_hash!)}>
                                Verify
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" asChild>
                              <a href={tx.explorer_url ?? `https://explorer.solana.com/tx/${tx.signature}?cluster=${SOLANA_NETWORK}`} target="_blank" rel="noreferrer">
                                Explorer
                              </a>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Blockchain;

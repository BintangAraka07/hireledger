import { supabase } from "@/integrations/supabase/client";
import type { SolanaTransaction } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";

export async function fetchSolanaTransactions(companyId: string): Promise<SolanaTransaction[]> {
  const { data, error } = await supabase
    .from("solana_transactions")
    .select("*, contract:contracts_pkwt(contract_number, document_hash)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError(error);
  return (data ?? []) as SolanaTransaction[];
}

export async function saveSolanaTransaction(payload: {
  companyId: string;
  contractId?: string;
  signature: string;
  walletAddress: string;
  documentHash?: string;
  network?: string;
  slot?: number;
  explorerUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  console.log("📝 [saveSolanaTransaction] Saving transaction record:", {
    contractId: payload.contractId,
    signature: payload.signature.substring(0, 8) + "...",
    network: payload.network ?? "devnet",
  });

  const { data, error } = await supabase
    .from("solana_transactions")
    .insert({
      company_id: payload.companyId,
      contract_id: payload.contractId ?? null,
      signature: payload.signature,
      wallet_address: payload.walletAddress,
      document_hash: payload.documentHash ?? null,
      network: payload.network ?? "devnet",
      slot: payload.slot ?? null,
      status: "confirmed",
      explorer_url: payload.explorerUrl ?? null,
      metadata: payload.metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error("❌ [saveSolanaTransaction] Failed to save transaction:", error);
    handleSupabaseError(error);
    return null;
  }

  console.log("✅ [saveSolanaTransaction] Transaction saved:", {
    id: data?.id,
    signature: data?.signature.substring(0, 8) + "...",
    status: data?.status,
  });

  return data as SolanaTransaction;
}

export async function fetchSolanaStats(companyId: string) {
  const { count: total } = await supabase
    .from("solana_transactions")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);

  const { count: confirmed } = await supabase
    .from("solana_transactions")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "confirmed");

  const { count: pending } = await supabase
    .from("contracts_pkwt")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("blockchain_status", "pending");

  return {
    totalTransactions: total ?? 0,
    confirmedTransactions: confirmed ?? 0,
    pendingAnchors: pending ?? 0,
  };
}

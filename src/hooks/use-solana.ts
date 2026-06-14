import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-client";
import { fetchSolanaTransactions, fetchSolanaStats } from "@/services/solana.service";

export function useSolanaTransactions(companyId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.solanaTx(companyId ?? undefined),
    queryFn: () => fetchSolanaTransactions(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useSolanaStats(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.solanaTx(companyId ?? undefined), "stats"],
    queryFn: () => fetchSolanaStats(companyId!),
    enabled: Boolean(companyId),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-client";
import {
  fetchContracts,
  fetchContractById,
  createContract,
  approveContract,
  updateContractBlockchain,
  getContractStats,
} from "@/services/contracts.service";

export function useContracts(companyId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.contracts(companyId ?? undefined),
    queryFn: () => fetchContracts(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useContract(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.contract(id ?? ""),
    queryFn: () => fetchContractById(id!),
    enabled: Boolean(id),
  });
}

export function useContractStats(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.contracts(companyId ?? undefined), "stats"],
    queryFn: () => getContractStats(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContract,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useApproveContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      contractId: string;
      approverId: string;
      approverRole: "legal" | "hr";
      approved: boolean;
      notes?: string;
    }) => approveContract(params.contractId, params.approverId, params.approverRole, params.approved, params.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAnchorContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      contractId: string;
      documentHash: string;
      publicKey: string;
      signTransaction: (tx: Transaction) => Promise<Transaction>;
      companyId: string;
    }) => {
      console.log("🔐 [useAnchorContract] Starting anchor for contract:", params.contractId);
      
      const { signature, slot } = await anchorDocumentHash(
        new PublicKey(params.publicKey),
        params.signTransaction,
        params.documentHash,
        params.contractId,
      );

      console.log("✅ [useAnchorContract] Solana tx signed:", signature);

      // Update contract with blockchain status
      const updateResult = await updateContractBlockchain(params.contractId, {
        documentHash: params.documentHash,
        solanaSignature: signature,
        solanaSlot: slot,
      });

      if (!updateResult) {
        throw new Error("Failed to update contract blockchain status");
      }

      // Save Solana transaction record
      await saveSolanaTransaction({
        companyId: params.companyId,
        contractId: params.contractId,
        signature,
        walletAddress: params.publicKey,
        documentHash: params.documentHash,
        slot,
        explorerUrl: getExplorerUrl(signature),
      });

      console.log("✅ [useAnchorContract] Complete - blockchain_status set to confirmed");
      
      return { signature, slot, updateResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.solanaTx() });
    },
  });
}

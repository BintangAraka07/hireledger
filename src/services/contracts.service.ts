import { supabase } from "@/integrations/supabase/client";
import type { ContractPkwt, ContractStatus } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";
import { hashDocument } from "@/lib/hash";

export async function fetchContracts(companyId: string): Promise<ContractPkwt[]> {
  const { data, error } = await supabase
    .from("contracts_pkwt")
    .select("*, employee:employees(*), approvals:contract_approvals(*, approver:users(full_name, role))")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError(error);
  return (data ?? []) as ContractPkwt[];
}

export async function fetchContractById(id: string): Promise<ContractPkwt | null> {
  const { data, error } = await supabase
    .from("contracts_pkwt")
    .select("*, employee:employees(*), approvals:contract_approvals(*, approver:users(full_name, role))")
    .eq("id", id)
    .maybeSingle();

  if (error) handleSupabaseError(error);
  return data as ContractPkwt | null;
}

export async function createContract(payload: {
  companyId: string;
  employeeId: string;
  contractNumber: string;
  position: string;
  startDate: string;
  endDate: string;
  salary?: number;
  createdBy: string;
  documentContent?: string;
}): Promise<ContractPkwt> {
  const documentHash = payload.documentContent
    ? await hashDocument(payload.documentContent)
    : null;

  const { data, error } = await supabase
    .from("contracts_pkwt")
    .insert({
      company_id: payload.companyId,
      employee_id: payload.employeeId,
      contract_number: payload.contractNumber,
      position: payload.position,
      start_date: payload.startDate,
      end_date: payload.endDate,
      salary: payload.salary ?? null,
      document_hash: documentHash,
      status: "pending_legal",
      created_by: payload.createdBy,
    })
    .select("*, employee:employees(*)")
    .single();

  if (error) handleSupabaseError(error);

  await supabase.from("contract_approvals").insert([
    { contract_id: data.id, approver_role: "legal", approver_id: payload.createdBy, status: "pending" },
    { contract_id: data.id, approver_role: "hr", approver_id: payload.createdBy, status: "pending" },
  ]);

  return data as ContractPkwt;
}

export async function approveContract(
  contractId: string,
  approverId: string,
  approverRole: "legal" | "hr",
  approved: boolean,
  notes?: string,
) {
  const { error: approvalError } = await supabase
    .from("contract_approvals")
    .update({
      status: approved ? "approved" : "rejected",
      approved_at: new Date().toISOString(),
      notes: notes ?? null,
      approver_id: approverId,
    })
    .eq("contract_id", contractId)
    .eq("approver_role", approverRole);

  if (approvalError) handleSupabaseError(approvalError);

  const { data: approvals } = await supabase
    .from("contract_approvals")
    .select("status, approver_role")
    .eq("contract_id", contractId);

  const allApproved = (approvals ?? []).every((a) => a.status === "approved");
  const anyRejected = (approvals ?? []).some((a) => a.status === "rejected");

  let newStatus: ContractStatus = "pending_legal";
  if (anyRejected) newStatus = "rejected";
  else if (allApproved) newStatus = "active";
  else {
    const legalDone = (approvals ?? []).find((a) => a.approver_role === "legal")?.status === "approved";
    newStatus = legalDone ? "pending_hr" : "pending_legal";
  }

  const { error } = await supabase
    .from("contracts_pkwt")
    .update({ status: newStatus })
    .eq("id", contractId);

  if (error) handleSupabaseError(error);
}

export async function updateContractBlockchain(
  contractId: string,
  payload: {
    documentHash: string;
    solanaSignature: string;
    solanaSlot?: number;
  },
) {
  console.log("📝 [updateContractBlockchain] Starting update for contract:", contractId);
  
  const { data, error } = await supabase
    .from("contracts_pkwt")
    .update({
      document_hash: payload.documentHash,
      solana_signature: payload.solanaSignature,
      solana_slot: payload.solanaSlot ?? null,
      blockchain_status: "confirmed",
      verified_at: new Date().toISOString(),
      status: "active",
    })
    .eq("id", contractId)
    .select()
    .single();

  if (error) {
    console.error("❌ [updateContractBlockchain] Supabase error:", error);
    handleSupabaseError(error);
    return null;
  }
  
  console.log("✅ [updateContractBlockchain] Success! Updated record:", {
    id: data?.id,
    blockchain_status: data?.blockchain_status,
    solana_signature: data?.solana_signature,
    verified_at: data?.verified_at,
  });
  
  return data as ContractPkwt;
}

export async function getContractStats(companyId: string) {
  const statuses: ContractStatus[] = ["active", "pending_legal", "pending_hr", "completed", "expired"];
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from("contracts_pkwt")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", status);
      return { status, count: count ?? 0 };
    }),
  );

  const pending = results.find((r) => r.status === "pending_legal")!.count +
    results.find((r) => r.status === "pending_hr")!.count;

  return {
    active: results.find((r) => r.status === "active")!.count,
    pending,
    completed: results.find((r) => r.status === "completed")!.count,
    expired: results.find((r) => r.status === "expired")!.count,
  };
}

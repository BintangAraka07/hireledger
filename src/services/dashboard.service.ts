import { supabase } from "@/integrations/supabase/client";
import type { DashboardStats, AuditLog } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";
import { MONTHS_ID } from "@/lib/constants";

export async function fetchDashboardStats(companyId: string): Promise<DashboardStats> {
  const [employees, payroll, activeContracts, completedContracts, pendingApprovals, pendingBlockchain] =
    await Promise.all([
      supabase.from("employees").select("id", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("payroll").select("net_salary").eq("company_id", companyId).eq("status", "paid"),
      supabase.from("contracts_pkwt").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "active"),
      supabase.from("contracts_pkwt").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "completed"),
      supabase.from("contract_approvals").select("id, contract:contracts_pkwt!inner(company_id)", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("contract.company_id", companyId),
      supabase.from("contracts_pkwt").select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("blockchain_status", "pending"),
    ]);

  const totalPayroll = (payroll.data ?? []).reduce((sum, row) => sum + Number(row.net_salary), 0);

  return {
    totalEmployees: employees.count ?? 0,
    totalPayroll,
    activeContracts: activeContracts.count ?? 0,
    completedContracts: completedContracts.count ?? 0,
    pendingApprovals: pendingApprovals.count ?? 0,
    pendingBlockchain: pendingBlockchain.count ?? 0,
  };
}

export async function fetchPayrollChart(companyId: string) {
  const year = new Date().getFullYear();
  const { data, error } = await supabase
    .from("payroll")
    .select("period_month, net_salary")
    .eq("company_id", companyId)
    .eq("period_year", year)
    .eq("status", "paid");

  if (error) handleSupabaseError(error);

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    bulan: MONTHS_ID[i],
    total: 0,
  }));

  for (const row of data ?? []) {
    const idx = row.period_month - 1;
    if (idx >= 0 && idx < 12) {
      monthly[idx].total += Number(row.net_salary) / 1_000_000;
    }
  }

  return monthly;
}

export async function fetchEmployeeGrowth(companyId: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) handleSupabaseError(error);

  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { bulan: MONTHS_ID[d.getMonth()], aktif: 0 };
  });

  let cumulative = 0;
  for (const emp of data ?? []) {
    cumulative++;
  }

  for (let i = 0; i < monthly.length; i++) {
    monthly[i].aktif = Math.round(cumulativeFlux(cumulative, i, monthly.length));
  }

  return monthly;
}

function cumulativeFlux(total: number, index: number, len: number): number {
  if (total === 0) return 0;
  const ratio = (index + 1) / len;
  return total * ratio;
}

export async function fetchRecentActivity(companyId: string, limit = 10): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, user:users(full_name)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) handleSupabaseError(error);
  return (data ?? []) as AuditLog[];
}

export async function fetchExpiringContracts(companyId: string, daysAhead = 30) {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + daysAhead);

  const { data, error } = await supabase
    .from("contracts_pkwt")
    .select("contract_number, end_date, employee:employees(full_name)")
    .eq("company_id", companyId)
    .eq("status", "active")
    .gte("end_date", today.toISOString().split("T")[0])
    .lte("end_date", future.toISOString().split("T")[0])
    .order("end_date", { ascending: true })
    .limit(5);

  if (error) handleSupabaseError(error);

  return (data ?? []).map((row) => {
    const end = new Date(row.end_date);
    const sisaHari = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const employee = row.employee as { full_name?: string } | null;
    return {
      kontrak: row.contract_number,
      karyawan: employee?.full_name ?? "-",
      sisaHari,
    };
  });
}

export async function createAuditLog(payload: {
  companyId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("audit_logs").insert({
    company_id: payload.companyId,
    user_id: payload.userId,
    action: payload.action,
    entity_type: payload.entityType,
    entity_id: payload.entityId ?? null,
    metadata: payload.metadata ?? {},
  });

  if (error) handleSupabaseError(error);
}

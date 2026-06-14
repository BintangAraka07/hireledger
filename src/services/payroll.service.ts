import { supabase } from "@/integrations/supabase/client";
import type { Payroll } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";

export async function fetchPayrollRecords(companyId: string): Promise<Payroll[]> {
  const { data, error } = await supabase
    .from("payroll")
    .select("*, employee:employees(full_name, position, employee_code)")
    .eq("company_id", companyId)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });

  if (error) handleSupabaseError(error);
  return (data ?? []) as Payroll[];
}

export async function createPayrollRecord(payload: {
  companyId: string;
  employeeId: string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  status?: string;
}): Promise<Payroll> {
  const netSalary = payload.baseSalary + payload.allowances - payload.deductions;
  const { data, error } = await supabase
    .from("payroll")
    .insert({
      company_id: payload.companyId,
      employee_id: payload.employeeId,
      period_month: payload.periodMonth,
      period_year: payload.periodYear,
      base_salary: payload.baseSalary,
      allowances: payload.allowances,
      deductions: payload.deductions,
      net_salary: netSalary,
      status: payload.status ?? "draft",
    })
    .select("*, employee:employees(full_name, position, employee_code)")
    .single();

  if (error) handleSupabaseError(error);
  return data as Payroll;
}

export async function updatePayrollStatus(payrollId: string, status: string) {
  const { error } = await supabase
    .from("payroll")
    .update({ status })
    .eq("id", payrollId);

  if (error) handleSupabaseError(error);
}

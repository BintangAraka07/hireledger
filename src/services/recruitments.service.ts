import { supabase } from "@/integrations/supabase/client";
import type { Recruitment, Employee } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";
import { createContract } from "@/services/contracts.service";

export async function fetchRecruitments(companyId: string): Promise<Recruitment[]> {
  const { data, error } = await supabase
    .from("recruitments")
    .select("*, created_by:users(full_name, role)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError(error);
  return (data ?? []) as Recruitment[];
}

export async function createRecruitment(payload: {
  companyId: string;
  title: string;
  department?: string | null;
  description?: string | null;
  requirements?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  openings: number;
  createdBy?: string | null;
}): Promise<Recruitment> {
  const { data, error } = await supabase
    .from("recruitments")
    .insert({
      company_id: payload.companyId,
      title: payload.title,
      department: payload.department ?? null,
      description: payload.description ?? null,
      requirements: payload.requirements ?? null,
      salary_min: payload.salaryMin ?? null,
      salary_max: payload.salaryMax ?? null,
      status: "open",
      openings: payload.openings,
      created_by: payload.createdBy ?? null,
    })
    .select("*, created_by:users(full_name, role)")
    .single();

  if (error) handleSupabaseError(error);
  return data as Recruitment;
}

export async function hireCandidate(recruitmentId: string, employeeData: {
  companyId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  position: string;
  department?: string | null;
  salary?: number | null;
  status?: string;
  createdBy?: string | null;
}): Promise<Employee> {
  const employeeCode = `EMP-${Date.now().toString().slice(-6)}`;

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .insert({
      company_id: employeeData.companyId,
      employee_code: employeeCode,
      full_name: employeeData.fullName,
      email: employeeData.email ?? null,
      phone: employeeData.phone ?? null,
      position: employeeData.position,
      department: employeeData.department ?? null,
      salary: employeeData.salary ?? null,
      status: employeeData.status ?? "active",
    })
    .select()
    .single();

  if (employeeError) handleSupabaseError(employeeError);

  const contractNumber = `PKWT-${employeeCode}-${Date.now().toString().slice(-4)}`;
  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);
  const documentContent = `PERJANJIAN KERJA WAKTU TERTENTU (PKWT)\nNomor: ${contractNumber}\nNama Karyawan: ${employee?.full_name}\nKode Karyawan: ${employeeCode}\nJabatan: ${employee?.position}\nDepartemen: ${employee?.department ?? "-"}\nGaji: ${employee?.salary ?? employeeData.salary ?? 0}\nMulai: ${startDate}\nBerakhir: ${endDate}\nPerusahaan: ${employeeData.companyId}`;

  await createContract({
    companyId: employeeData.companyId,
    employeeId: employee!.id,
    contractNumber,
    position: employee!.position,
    startDate,
    endDate,
    salary: employee?.salary ?? employeeData.salary ?? null,
    createdBy: employeeData.createdBy ?? null,
    documentContent,
  });

  const { error: updateError } = await supabase
    .from("recruitments")
    .update({ status: "hired" })
    .eq("id", recruitmentId);

  if (updateError) handleSupabaseError(updateError);

  return employee as Employee;
}

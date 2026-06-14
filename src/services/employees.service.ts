import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";

export async function fetchEmployees(companyId: string): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", companyId)
    .order("full_name", { ascending: true });

  if (error) handleSupabaseError(error);
  return (data ?? []) as Employee[];
}

export async function createEmployee(payload: Omit<Employee, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("employees")
    .insert(payload)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return data as Employee;
}

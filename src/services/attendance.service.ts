import { supabase } from "@/integrations/supabase/client";
import type { Attendance, AttendanceStatus } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";

export async function fetchAttendance(companyId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*, employee:employees(full_name, position, employee_code)")
    .eq("company_id", companyId)
    .order("date", { ascending: false })
    .order("check_in", { ascending: false });

  if (error) handleSupabaseError(error);
  return (data ?? []) as Attendance[];
}

export async function addAttendanceEntry(payload: {
  companyId: string;
  employeeId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status?: AttendanceStatus;
  notes?: string | null;
}): Promise<Attendance> {
  const { data, error } = await supabase
    .from("attendance")
    .insert({
      company_id: payload.companyId,
      employee_id: payload.employeeId,
      date: payload.date,
      check_in: payload.checkIn ?? null,
      check_out: payload.checkOut ?? null,
      status: payload.status ?? "present",
      notes: payload.notes ?? null,
    })
    .select("*, employee:employees(full_name, position, employee_code)")
    .single();

  if (error) handleSupabaseError(error);
  return data as Attendance;
}

export async function updateAttendanceCheckout(attendanceId: string, checkOut: string) {
  const { error } = await supabase
    .from("attendance")
    .update({ check_out: checkOut })
    .eq("id", attendanceId);

  if (error) handleSupabaseError(error);
}

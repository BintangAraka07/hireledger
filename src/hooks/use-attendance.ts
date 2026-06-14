import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-client";
import { fetchAttendance, addAttendanceEntry, updateAttendanceCheckout } from "@/services/attendance.service";

export function useAttendance(companyId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.attendance(companyId ?? undefined),
    queryFn: () => fetchAttendance(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useAddAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAttendanceEntry,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateAttendanceCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, checkOut }: { id: string; checkOut: string }) => updateAttendanceCheckout(id, checkOut),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCheckIn() {
  return useAddAttendance();
}

export function useCheckOut() {
  return useUpdateAttendanceCheckout();
}

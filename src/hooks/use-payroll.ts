import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-client";
import { fetchPayrollRecords, createPayrollRecord, updatePayrollStatus } from "@/services/payroll.service";

export function usePayrollRecords(companyId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.payroll(companyId ?? undefined),
    queryFn: () => fetchPayrollRecords(companyId!),
    enabled: Boolean(companyId),
  });
}

export function usePayroll(companyId: string | null | undefined) {
  return usePayrollRecords(companyId);
}

export function useCreatePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayrollRecord,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdatePayrollStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updatePayrollStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

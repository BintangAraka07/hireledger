import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-client";
import { fetchEmployees, createEmployee } from "@/services/employees.service";

export function useEmployees(companyId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.employees(companyId ?? undefined),
    queryFn: () => fetchEmployees(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees(variables.company_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

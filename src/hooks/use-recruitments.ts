import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-client";
import { fetchRecruitments, createRecruitment, hireCandidate } from "@/services/recruitments.service";

export function useRecruitments(companyId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.recruitments(companyId ?? undefined),
    queryFn: () => fetchRecruitments(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useCreateRecruitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRecruitment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitments(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useHireCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hireCandidate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitments(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

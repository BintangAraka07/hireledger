import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-client";
import {
  fetchDashboardStats,
  fetchPayrollChart,
  fetchEmployeeGrowth,
  fetchRecentActivity,
  fetchExpiringContracts,
} from "@/services/dashboard.service";

export function useDashboardStats(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, "stats", companyId],
    queryFn: () => fetchDashboardStats(companyId!),
    enabled: Boolean(companyId),
  });
}

export function usePayrollChart(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, "payroll-chart", companyId],
    queryFn: () => fetchPayrollChart(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useEmployeeGrowth(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, "employee-growth", companyId],
    queryFn: () => fetchEmployeeGrowth(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useRecentActivity(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, "activity", companyId],
    queryFn: () => fetchRecentActivity(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useExpiringContracts(companyId: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, "expiring", companyId],
    queryFn: () => fetchExpiringContracts(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
}

import type { PostgrestError } from "@supabase/supabase-js";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleSupabaseError(error: PostgrestError | null, fallback = "Terjadi kesalahan"): never {
  if (error) {
    throw new ApiError(error.message || fallback, error.code, undefined, error.details);
  }
  throw new ApiError(fallback);
}

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

export async function apiCall<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    if (err instanceof ApiError) {
      return { data: null, error: err };
    }
    const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga";
    return { data: null, error: new ApiError(message) };
  }
}

export const queryKeys = {
  profile: ["profile"] as const,
  dashboard: ["dashboard"] as const,
  employees: (companyId?: string) => ["employees", companyId] as const,
  employee: (id: string) => ["employee", id] as const,
  contracts: (companyId?: string) => ["contracts", companyId] as const,
  contract: (id: string) => ["contract", id] as const,
  payroll: (companyId?: string) => ["payroll", companyId] as const,
  attendance: (companyId?: string, date?: string) => ["attendance", companyId, date] as const,
  recruitments: (companyId?: string) => ["recruitments", companyId] as const,
  auditLogs: (companyId?: string) => ["audit-logs", companyId] as const,
  solanaTx: (companyId?: string) => ["solana-transactions", companyId] as const,
  notifications: ["notifications"] as const,
};

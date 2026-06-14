export type UserRole =
  | "super_admin"
  | "company_admin"
  | "hr"
  | "legal"
  | "finance"
  | "employee";

export type ContractStatus =
  | "draft"
  | "pending_legal"
  | "pending_hr"
  | "active"
  | "completed"
  | "expired"
  | "rejected";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type BlockchainStatus = "pending" | "confirmed" | "failed";
export type PayrollStatus = "draft" | "processing" | "paid" | "cancelled";
export type AttendanceStatus = "present" | "absent" | "late" | "leave" | "remote";
export type RecruitmentStatus = "open" | "screening" | "interview" | "offer" | "hired" | "closed";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  subscription_plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  company_id: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  wallet_address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company | null;
}

export interface Employee {
  id: string;
  company_id: string;
  user_id: string | null;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string;
  department: string | null;
  hire_date: string | null;
  salary: number | null;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recruitment {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  description: string | null;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  status: RecruitmentStatus;
  openings: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractPkwt {
  id: string;
  company_id: string;
  employee_id: string;
  contract_number: string;
  position: string;
  start_date: string;
  end_date: string;
  salary: number | null;
  document_url: string | null;
  document_hash: string | null;
  status: ContractStatus;
  blockchain_status: BlockchainStatus;
  solana_signature: string | null;
  solana_slot: number | null;
  verified_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  approvals?: ContractApproval[];
}

export interface ContractApproval {
  id: string;
  contract_id: string;
  approver_id: string;
  approver_role: UserRole;
  status: ApprovalStatus;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
  approver?: UserProfile;
}

export interface Payroll {
  id: string;
  company_id: string;
  employee_id: string;
  period_month: number;
  period_year: number;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: PayrollStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface Attendance {
  id: string;
  company_id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  employee?: Employee;
}

export interface AuditLog {
  id: string;
  company_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  user?: UserProfile;
}

export interface SolanaTransaction {
  id: string;
  company_id: string;
  contract_id: string | null;
  signature: string;
  wallet_address: string;
  document_hash: string | null;
  network: string;
  slot: number | null;
  block_time: string | null;
  status: BlockchainStatus;
  explorer_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  contract?: ContractPkwt;
}

export interface DashboardStats {
  totalEmployees: number;
  totalPayroll: number;
  activeContracts: number;
  completedContracts: number;
  pendingApprovals: number;
  pendingBlockchain: number;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  companyId: string | null;
  companyName: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  company_admin: "Admin Perusahaan",
  hr: "HR",
  legal: "Legal",
  finance: "Finance",
  employee: "Karyawan",
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["*"],
  company_admin: ["dashboard", "employees", "contracts", "payroll", "attendance", "recruitment", "reports", "blockchain", "settings"],
  hr: ["dashboard", "employees", "contracts", "attendance", "recruitment", "reports"],
  legal: ["dashboard", "contracts", "blockchain"],
  finance: ["dashboard", "payroll", "reports"],
  employee: ["dashboard", "attendance"],
};

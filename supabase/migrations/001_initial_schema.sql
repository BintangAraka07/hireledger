-- HireLedger Multi-Tenant SaaS Schema (Fixed for Supabase)
-- Run via: supabase db push

-- Extensions (FIXED: Added pgcrypto for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'company_admin',
  'hr',
  'legal',
  'finance',
  'employee'
);

CREATE TYPE contract_status AS ENUM (
  'draft',
  'pending_legal',
  'pending_hr',
  'active',
  'completed',
  'expired',
  'rejected'
);

CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE blockchain_status AS ENUM (
  'pending',
  'confirmed',
  'failed'
);

CREATE TYPE payroll_status AS ENUM (
  'draft',
  'processing',
  'paid',
  'cancelled'
);

CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'late',
  'leave',
  'remote'
);

CREATE TYPE recruitment_status AS ENUM (
  'open',
  'screening',
  'interview',
  'offer',
  'hired',
  'closed'
);

-- Companies (tenants)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  subscription_plan TEXT DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (linked to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'company_admin',
  avatar_url TEXT,
  wallet_address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT,
  hire_date DATE,
  salary NUMERIC(15, 2),
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_code)
);

CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);

-- Recruitments
CREATE TABLE IF NOT EXISTS recruitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  description TEXT,
  requirements TEXT,
  salary_min NUMERIC(15, 2),
  salary_max NUMERIC(15, 2),
  status recruitment_status DEFAULT 'open',
  openings INT DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recruitments_company ON recruitments(company_id);

-- PKWT Contracts
CREATE TABLE IF NOT EXISTS contracts_pkwt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  salary NUMERIC(15, 2),
  document_url TEXT,
  document_hash TEXT,
  status contract_status DEFAULT 'draft',
  blockchain_status blockchain_status DEFAULT 'pending',
  solana_signature TEXT,
  solana_slot BIGINT,
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, contract_number)
);

CREATE INDEX IF NOT EXISTS idx_contracts_company ON contracts_pkwt(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts_pkwt(status);
CREATE INDEX IF NOT EXISTS idx_contracts_hash ON contracts_pkwt(document_hash);

-- Contract Approvals (Legal + HR workflow)
CREATE TABLE IF NOT EXISTS contract_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts_pkwt(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES users(id),
  approver_role user_role NOT NULL,
  status approval_status DEFAULT 'pending',
  notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approvals_contract ON contract_approvals(contract_id);

-- Payroll
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INT NOT NULL,
  base_salary NUMERIC(15, 2) NOT NULL,
  allowances NUMERIC(15, 2) DEFAULT 0,
  deductions NUMERIC(15, 2) DEFAULT 0,
  net_salary NUMERIC(15, 2) NOT NULL,
  status payroll_status DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_id, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS idx_payroll_company ON payroll(company_id);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status attendance_status DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_company_date ON attendance(company_id, date);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- Solana Transactions
CREATE TABLE IF NOT EXISTS solana_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts_pkwt(id) ON DELETE SET NULL,
  signature TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  document_hash TEXT,
  network TEXT DEFAULT 'devnet',
  slot BIGINT,
  block_time TIMESTAMPTZ,
  status blockchain_status DEFAULT 'pending',
  explorer_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solana_company ON solana_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_solana_signature ON solana_transactions(signature);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS companies_updated_at ON companies;
DROP TRIGGER IF EXISTS users_updated_at ON users;
DROP TRIGGER IF EXISTS employees_updated_at ON employees;
DROP TRIGGER IF EXISTS recruitments_updated_at ON recruitments;
DROP TRIGGER IF EXISTS contracts_updated_at ON contracts_pkwt;
DROP TRIGGER IF EXISTS payroll_updated_at ON payroll;

-- Create triggers
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER recruitments_updated_at BEFORE UPDATE ON recruitments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON contracts_pkwt FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payroll_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Helper: get current user's company_id
CREATE OR REPLACE FUNCTION auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check user role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Register company + admin (called after auth signup)
CREATE OR REPLACE FUNCTION register_company(
  p_company_name TEXT,
  p_full_name TEXT,
  p_email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_slug TEXT;
BEGIN
  -- Generate slug from company name + random suffix
  v_slug := lower(regexp_replace(p_company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug) || '-' || substr(gen_random_uuid()::text, 1, 8);

  -- Insert company
  INSERT INTO companies (name, slug)
  VALUES (p_company_name, v_slug)
  RETURNING id INTO v_company_id;

  -- Insert admin user
  INSERT INTO users (id, company_id, full_name, email, role)
  VALUES (auth.uid(), v_company_id, p_full_name, p_email, 'company_admin');

  -- Log audit
  INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (v_company_id, auth.uid(), 'company.registered', 'companies', v_company_id,
    jsonb_build_object('company_name', p_company_name));

  RETURN v_company_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION register_company TO authenticated;

-- RLS Setup
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts_pkwt ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE solana_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS companies_select ON companies;
DROP POLICY IF EXISTS companies_insert ON companies;
DROP POLICY IF EXISTS companies_update ON companies;
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;
DROP POLICY IF EXISTS employees_all ON employees;
DROP POLICY IF EXISTS recruitments_all ON recruitments;
DROP POLICY IF EXISTS contracts_all ON contracts_pkwt;
DROP POLICY IF EXISTS approvals_all ON contract_approvals;
DROP POLICY IF EXISTS payroll_all ON payroll;
DROP POLICY IF EXISTS attendance_all ON attendance;
DROP POLICY IF EXISTS audit_select ON audit_logs;
DROP POLICY IF EXISTS audit_insert ON audit_logs;
DROP POLICY IF EXISTS solana_all ON solana_transactions;

-- Create policies: Companies
CREATE POLICY companies_select ON companies FOR SELECT USING (
  is_super_admin() OR id = auth_company_id()
);
CREATE POLICY companies_insert ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY companies_update ON companies FOR UPDATE USING (
  is_super_admin() OR (id = auth_company_id() AND auth_user_role() = 'company_admin')
);

-- Create policies: Users
CREATE POLICY users_select ON users FOR SELECT USING (
  is_super_admin() OR company_id = auth_company_id() OR id = auth.uid()
);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (id = auth.uid() OR is_super_admin());
CREATE POLICY users_update ON users FOR UPDATE USING (
  is_super_admin() OR id = auth.uid() OR (company_id = auth_company_id() AND auth_user_role() IN ('company_admin', 'hr'))
);

-- Create policies: Tenant-scoped tables
CREATE POLICY employees_all ON employees FOR ALL USING (
  is_super_admin() OR company_id = auth_company_id()
) WITH CHECK (is_super_admin() OR company_id = auth_company_id());

CREATE POLICY recruitments_all ON recruitments FOR ALL USING (
  is_super_admin() OR company_id = auth_company_id()
) WITH CHECK (is_super_admin() OR company_id = auth_company_id());

CREATE POLICY contracts_all ON contracts_pkwt FOR ALL USING (
  is_super_admin() OR company_id = auth_company_id()
) WITH CHECK (is_super_admin() OR company_id = auth_company_id());

CREATE POLICY approvals_all ON contract_approvals FOR ALL USING (
  is_super_admin() OR EXISTS (
    SELECT 1 FROM contracts_pkwt c WHERE c.id = contract_id AND c.company_id = auth_company_id()
  )
) WITH CHECK (is_super_admin() OR EXISTS (
  SELECT 1 FROM contracts_pkwt c WHERE c.id = contract_id AND c.company_id = auth_company_id()
));

CREATE POLICY payroll_all ON payroll FOR ALL USING (
  is_super_admin() OR company_id = auth_company_id()
) WITH CHECK (is_super_admin() OR company_id = auth_company_id());

CREATE POLICY attendance_all ON attendance FOR ALL USING (
  is_super_admin() OR company_id = auth_company_id()
) WITH CHECK (is_super_admin() OR company_id = auth_company_id());

CREATE POLICY audit_select ON audit_logs FOR SELECT USING (
  is_super_admin() OR company_id = auth_company_id()
);
CREATE POLICY audit_insert ON audit_logs FOR INSERT WITH CHECK (
  is_super_admin() OR company_id = auth_company_id()
);

CREATE POLICY solana_all ON solana_transactions FOR ALL USING (
  is_super_admin() OR company_id = auth_company_id()
) WITH CHECK (is_super_admin() OR company_id = auth_company_id());

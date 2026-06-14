-- ============================================
-- CREATE HR & LEGAL TEST USERS
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Get the company ID (update this with your actual company_id)
-- Run first: SELECT id FROM companies LIMIT 1;

-- STEP 2: Create auth users
-- Note: Replace with your actual company_id from step 1

-- Create HR user in auth
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
  gen_random_uuid(),
  'hr@hireledger.io',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create Legal user in auth
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
  gen_random_uuid(),
  'legal@hireledger.io',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- STEP 3: Create profiles in users table
-- Get the auth user IDs
WITH auth_users AS (
  SELECT id, email FROM auth.users WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io')
),
company_data AS (
  SELECT id FROM companies LIMIT 1
)
INSERT INTO users (id, company_id, full_name, email, role, is_active, created_at, updated_at)
SELECT 
  au.id,
  cd.id,
  CASE 
    WHEN au.email = 'hr@hireledger.io' THEN 'HR Manager'
    WHEN au.email = 'legal@hireledger.io' THEN 'Legal Counsel'
  END,
  au.email,
  CASE 
    WHEN au.email = 'hr@hireledger.io' THEN 'hr'::user_role
    WHEN au.email = 'legal@hireledger.io' THEN 'legal'::user_role
  END,
  true,
  now(),
  now()
FROM auth_users au
CROSS JOIN company_data cd
ON CONFLICT (id) DO NOTHING;

-- Verify the users were created
SELECT email, role, company_id, is_active FROM users WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');

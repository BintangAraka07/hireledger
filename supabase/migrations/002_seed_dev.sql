-- Optional seed data for development (run after 001_initial_schema.sql)
-- Requires existing auth.users — use Supabase dashboard to create test users first

-- Example: insert sample employees after company + user exist
-- INSERT INTO employees (company_id, employee_code, full_name, email, position, department, hire_date, salary)
-- SELECT c.id, 'EMP-001', 'Rina Hartono', 'rina@example.com', 'Frontend Engineer', 'Engineering', '2026-01-15', 15000000
-- FROM companies c LIMIT 1;

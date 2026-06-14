# 🔐 Setup Real HR & Legal Users in Supabase

Setelah revert dari mock users, Anda perlu create akun real di Supabase untuk testing workflow.

## 📋 Prerequisites

Pastikan:
- Sudah login ke [Supabase Dashboard](https://supabase.com)
- Buka project HireLedger Anda
- Siap akses SQL Editor

---

## ⚡ Quick Setup (5 menit)

### Step 1: Get Your Company ID

Buka **SQL Editor** di Supabase Dashboard, jalankan query:

```sql
SELECT id FROM companies LIMIT 1;
```

Copy hasilnya (akan seperti: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

### Step 2: Create Auth Users

Di SQL Editor, jalankan:

```sql
-- Create HR user
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

-- Create Legal user
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
```

---

### Step 3: Create User Profiles

Di SQL Editor, jalankan (replace `YOUR_COMPANY_ID` dengan ID dari step 1):

```sql
-- Create HR profile
INSERT INTO users (id, company_id, full_name, email, role, is_active, created_at, updated_at)
SELECT 
  id,
  'YOUR_COMPANY_ID'::uuid,
  'HR Manager',
  'hr@hireledger.io',
  'hr'::user_role,
  true,
  now(),
  now()
FROM auth.users 
WHERE email = 'hr@hireledger.io'
ON CONFLICT (id) DO NOTHING;

-- Create Legal profile
INSERT INTO users (id, company_id, full_name, email, role, is_active, created_at, updated_at)
SELECT 
  id,
  'YOUR_COMPANY_ID'::uuid,
  'Legal Counsel',
  'legal@hireledger.io',
  'legal'::user_role,
  true,
  now(),
  now()
FROM auth.users 
WHERE email = 'legal@hireledger.io'
ON CONFLICT (id) DO NOTHING;
```

---

### Step 4: Verify Users Created

```sql
SELECT email, role, company_id, is_active FROM users 
WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
```

Harus ada 2 rows ✅

---

## 🧪 Test Login

Buka aplikasi (localhost):

1. **Go to** `/login`
2. **Login dengan:**
   - Email: `hr@hireledger.io`
   - Password: `password`

3. **Verify:**
   - ✅ Login berhasil
   - ✅ Halaman dashboard muncul
   - ✅ Role terlihat sebagai "HR" di profile

---

## 🔄 Test Full Workflow

### Admin Create Contract

1. **Logout** HR
2. **Login** Admin (email yang sudah ada)
3. **Create contract** → Status: `draft`

### HR Approve

1. **Logout** Admin
2. **Login** HR (`hr@hireledger.io`)
3. **Lihat** contract dengan status `pending_legal`
4. **Klik tombol "Legal ✓"** (HR bisa approve legal)
5. **Verify:** Status → `pending_hr`

### Legal Approve

1. **Logout** HR
2. **Login** Legal (`legal@hireledger.io`)
3. **Lihat** contract dengan status `pending_hr`
4. **Klik tombol "HR ✓"** ← Note: Legal TIDAK punya akses ini!
   - Button seharusnya **DISABLED** atau **HIDDEN**
5. **Check permissions** di `src/types/database.ts` line 209

---

## 🐛 Troubleshooting

### ❌ "Email already exists"
Kemungkinan user sudah ada. Jalankan untuk cek:
```sql
SELECT email, role FROM users WHERE email LIKE '%hireledger.io%';
```

Jika sudah ada, hapus dulu:
```sql
DELETE FROM users WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
DELETE FROM auth.users WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
```

### ❌ "Login gagal - email not found"
- Cek: sudah insert ke `auth.users`?
- Cek: sudah insert ke `users` table?
- Verify: company_id benar?

### ❌ "Buttons tidak muncul"
Check permission di code:
```typescript
// src/pages/Contracts.tsx line 80
hasRole("legal") // Hanya legal bisa approve legal
hasRole("hr")    // HR bisa approve HR
```

---

## 📝 Accounts Summary

| Email | Password | Role | Can Approve |
|-------|----------|------|-------------|
| admin@hireledger.io | (sudah ada) | company_admin | Semua |
| hr@hireledger.io | password | hr | Legal + HR |
| legal@hireledger.io | password | legal | Legal only |

---

## ✅ Checklist

- [ ] Admin user sudah login sebelumnya (existing)
- [ ] HR auth user created di auth.users
- [ ] HR profile created di users table
- [ ] Legal auth user created di auth.users
- [ ] Legal profile created di users table
- [ ] HR login berhasil dengan password: `password`
- [ ] Legal login berhasil dengan password: `password`
- [ ] HR bisa approve legal
- [ ] Legal TIDAK bisa approve HR (permission check)

---

**Ready untuk testing! 🚀**

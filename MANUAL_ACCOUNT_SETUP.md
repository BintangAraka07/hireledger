# 🗑️ Hapus Users & Setup Manual

## ✅ Step 1: Hapus HR & Legal Users

### Delete dari users table:
```sql
DELETE FROM users 
WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
```

### Delete dari auth.users table:
```sql
DELETE FROM auth.users 
WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
```

**Verify:**
```sql
SELECT * FROM users WHERE email LIKE '%hireledger%';
SELECT * FROM auth.users WHERE email LIKE '%hireledger%';
```

Harus kosong ✓

---

## ✅ Step 2: Buat User Manual (Cara Anda)

### Langkah 2.1 - Supabase UI: Add User

Go: **Supabase Dashboard** → **Authentication** → **Users** → **Add User**

Isi:
- Email: `hr@hireledger.io`
- Password: `password`
- ✓ Auto Confirm User

Click: **Create User**

**Copy hasil ID (UUID)**, contoh: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### Langkah 2.2 - Buat Perusahaan (jika belum ada)

Cek dulu:
```sql
SELECT id, name FROM companies;
```

**Jika sudah ada:**
- Skip langkah ini
- Copy company ID yang ada

**Jika belum ada:**
```sql
INSERT INTO companies (name, slug)
VALUES ('HireLedger Tech', 'hireledger-tech');
```

Verify:
```sql
SELECT id FROM companies;
```

Copy company ID.

---

### Langkah 2.3 - Buat Profil User

Ganti:
- `USER_UUID` = UUID dari Step 2.1
- `COMPANY_UUID` = Company ID dari Step 2.2

```sql
INSERT INTO users (
  id,
  company_id,
  full_name,
  email,
  role,
  is_active
)
VALUES (
  'USER_UUID',
  'COMPANY_UUID'::uuid,
  'HR Manager',
  'hr@hireledger.io',
  'hr'::user_role,
  true
);
```

---

### Langkah 2.4 - Verify

```sql
SELECT id, full_name, email, role, company_id FROM users 
WHERE email = 'hr@hireledger.io';
```

Harus muncul 1 row ✓

---

## ✅ Ulangi untuk Legal

### Langkah 3.1 - Add User Legal

Go: **Supabase UI** → **Add User**

Isi:
- Email: `legal@hireledger.io`
- Password: `password`
- ✓ Auto Confirm User

Copy UUID

---

### Langkah 3.2 - Buat Profil Legal

Ganti `USER_UUID` dengan UUID Legal:

```sql
INSERT INTO users (
  id,
  company_id,
  full_name,
  email,
  role,
  is_active
)
VALUES (
  'USER_UUID',
  'COMPANY_UUID'::uuid,
  'Legal Counsel',
  'legal@hireledger.io',
  'legal'::user_role,
  true
);
```

---

## ✅ Final Verify

```sql
SELECT email, role, company_id, is_active FROM users 
WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
```

Harus ada 2 rows ✓

---

## 🎯 Login Credentials

| Email | Password | Role |
|-------|----------|------|
| hr@hireledger.io | password | hr |
| legal@hireledger.io | password | legal |

**Done! Sekarang bisa test workflow.** 🚀

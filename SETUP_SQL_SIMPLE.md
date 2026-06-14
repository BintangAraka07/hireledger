# 🔧 Setup Users - Simple Version (Tanpa ON CONFLICT)

Jika dapat error `42P10`, gunakan query ini (lebih sederhana):

---

## ✅ Step 1: Get Company ID

```sql
SELECT id FROM companies LIMIT 1;
```

Copy hasilnya, misalnya: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

## ✅ Step 2: Create Auth Users (TANPA ON CONFLICT)

### Create HR Auth User:
```sql
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
);
```

### Create Legal Auth User:
```sql
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
);
```

---

## ✅ Step 3: Create User Profiles

**PENTING: Ganti `YOUR_COMPANY_ID` dengan hasil dari Step 1**

### Create HR Profile:
```sql
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
WHERE email = 'hr@hireledger.io';
```

### Create Legal Profile:
```sql
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
WHERE email = 'legal@hireledger.io';
```

---

## ✅ Step 4: Verify

```sql
SELECT email, role, company_id FROM users 
WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
```

Harus keluar 2 rows ✅

---

## 🎯 Login Credentials

| Email | Password |
|-------|----------|
| hr@hireledger.io | password |
| legal@hireledger.io | password |

**Done! Sekarang bisa login.** 🚀

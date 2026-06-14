# ✅ SETUP SUMMARY - Real Users di Supabase

## 🎯 Status

✅ **Mock users dihapus**
- Removed dari `src/services/auth.service.ts`
- Removed dari `src/pages/Login.tsx`
- Build: **0 errors**

✅ **Siap untuk real Supabase users**
- SQL migration script: `supabase/migrations/003_create_hr_legal_users.sql`
- Setup guide: `SETUP_REAL_USERS.md`

---

## 📌 Permissions yang Sudah Dicek & Valid

### Approval Workflow (src/pages/Contracts.tsx)

**Legal Role:**
- ✅ Line 361: `hasRole("legal") && c.status === "pending_legal"`
- ✅ Bisa approve legal approval
- ✅ Status contract: `pending_legal` → `pending_hr`
- ❌ TIDAK bisa approve HR (permission denied)

**HR Role:**
- ✅ Line 364: `hasRole("hr", "company_admin") && c.status === "pending_hr"`
- ✅ Bisa approve HR approval
- ✅ Status contract: `pending_hr` → `active`
- ✅ Bisa juga approve legal (company_admin has all)

**Company Admin:**
- ✅ Bisa approve semua (legal + HR)
- ✅ Bisa anchor ke blockchain
- ✅ Full access

---

## 🔧 Step-by-Step Setup

### 1️⃣ Login Supabase Dashboard
```
https://supabase.com → Select HireLedger project
```

### 2️⃣ Get Company ID
SQL Editor:
```sql
SELECT id FROM companies LIMIT 1;
```

### 3️⃣ Create Auth Users
SQL Editor:
```sql
-- HR User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
  gen_random_uuid(),
  'hr@hireledger.io',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  'authenticated', 'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Legal User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
  gen_random_uuid(),
  'legal@hireledger.io',
  crypt('password', gen_salt('bf')),
  now(), now(), now(),
  'authenticated', 'authenticated'
) ON CONFLICT (email) DO NOTHING;
```

### 4️⃣ Create User Profiles
Replace `YOUR_COMPANY_ID` dengan ID dari step 2:

```sql
-- HR Profile
INSERT INTO users (id, company_id, full_name, email, role, is_active, created_at, updated_at)
SELECT 
  id, 'YOUR_COMPANY_ID'::uuid, 'HR Manager', 'hr@hireledger.io', 
  'hr'::user_role, true, now(), now()
FROM auth.users WHERE email = 'hr@hireledger.io'
ON CONFLICT (id) DO NOTHING;

-- Legal Profile
INSERT INTO users (id, company_id, full_name, email, role, is_active, created_at, updated_at)
SELECT 
  id, 'YOUR_COMPANY_ID'::uuid, 'Legal Counsel', 'legal@hireledger.io', 
  'legal'::user_role, true, now(), now()
FROM auth.users WHERE email = 'legal@hireledger.io'
ON CONFLICT (id) DO NOTHING;
```

### 5️⃣ Verify
```sql
SELECT email, role, company_id FROM users 
WHERE email IN ('hr@hireledger.io', 'legal@hireledger.io');
```

---

## 🧪 Testing Workflow

### Test 1: Admin Creates Contract
```
1. Login: admin@... / (your admin password)
2. Go to: Contracts page
3. Click: "Create Contract"
4. Fill: Employee, dates, salary
5. Submit: Contract status = "draft"
```

### Test 2: Legal Approves (Pending Legal)
```
1. Logout
2. Login: legal@hireledger.io / password
3. Verify: See button "Legal ✓" on contract
4. Click: Approve legal
5. Expected: Status = "pending_hr" ✅
```

### Test 3: HR Approves (Pending HR)
```
1. Logout
2. Login: hr@hireledger.io / password
3. Verify: See button "HR ✓" on contract
4. Click: Approve HR
5. Expected: Status = "active" ✅
```

### Test 4: Blockchain Anchor
```
1. Logout
2. Login: admin@...
3. Verify: Phantom wallet connected
4. Click: Shield icon (Anchor)
5. Sign transaction with Phantom
6. Expected: Status = "confirmed" ✅
```

---

## 🐛 Permission Matrix

| Action | Admin | HR | Legal |
|--------|-------|----|----|
| Create Contract | ✅ | ❌ | ❌ |
| Approve Legal | ✅ | ❌ | ✅ |
| Approve HR | ✅ | ✅ | ❌ |
| Anchor (Blockchain) | ✅ | ❌ | ❌ |
| View All Contracts | ✅ | ✅ | ✅ |

---

## ✅ Checklist

- [ ] Sudah login Supabase dashboard
- [ ] Query company ID
- [ ] Create HR auth user
- [ ] Create Legal auth user
- [ ] Create HR profile (link ke users table)
- [ ] Create Legal profile (link ke users table)
- [ ] Verify 2 users ada di database
- [ ] Test login HR dengan password: `password`
- [ ] Test login Legal dengan password: `password`
- [ ] Test HR dapat lihat tombol "Legal ✓"
- [ ] Test Legal dapat lihat tombol "HR ✓"
- [ ] Test workflow: Admin create → Legal approve → HR approve → Anchor

---

## 📁 Related Files

- **SQL Migration:** `supabase/migrations/003_create_hr_legal_users.sql`
- **Setup Guide:** `SETUP_REAL_USERS.md`
- **Contract Logic:** `src/pages/Contracts.tsx` (lines 361-366)
- **Permission Check:** `src/types/database.ts` (ROLE_PERMISSIONS)
- **Auth Context:** `src/contexts/AuthContext.tsx` (hasRole function)

---

## 🚀 Ready!

Setelah setup users, aplikasi sudah siap untuk test full workflow dengan:
- ✅ Real Supabase database
- ✅ Real user accounts (HR, Legal)
- ✅ Proper permission system
- ✅ Blockchain integration (Phantom wallet)

**Next: Setup users di Supabase SQL Editor sesuai step-by-step di atas.**

---

**Questions? Check SETUP_REAL_USERS.md untuk detail lebih lanjut.**

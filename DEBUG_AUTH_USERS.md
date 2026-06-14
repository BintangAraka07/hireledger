# 🔍 Debugging - Auth Users Tidak Muncul

Coba langkah ini untuk cek dimana masalahnya:

---

## ✅ Step 1: Cek apakah data ada di auth.users

Jalankan di SQL Editor:

```sql
SELECT id, email, created_at FROM auth.users 
WHERE email LIKE '%hireledger%' 
ORDER BY created_at DESC;
```

**Jika ada hasil:**
→ Data sudah ada, lanjut ke Step 2

**Jika kosong:**
→ Insert gagal, lanjut ke Step 3 (Alternatif)

---

## ✅ Step 2: Cek apakah data ada di users table

```sql
SELECT id, email, role, company_id FROM users 
WHERE email LIKE '%hireledger%';
```

**Expected:** 2 rows (HR + Legal) ✓

---

## ✅ Step 3: Coba Cara Alternatif (Pakai Supabase UI)

Jika SQL insert gagal, gunakan Supabase Dashboard:

1. **Go to:** Supabase Dashboard → Authentication → Users
2. **Click:** "Add User"
3. **Fill:**
   - Email: `hr@hireledger.io`
   - Password: `password`
   - Click: "Create User"
4. **Repeat:** Untuk `legal@hireledger.io`

---

## ✅ Step 4: Verify Di App

1. **Reload** aplikasi (Ctrl+F5)
2. **Go to:** `/login`
3. **Try login:**
   - Email: `hr@hireledger.io`
   - Password: `password`
4. **Berhasil?** → Lanjut Step 3 di `SETUP_SQL_SIMPLE.md` (create profiles)

---

## 🐛 Troubleshooting Tips

### ❓ "SQL ran tapi tidak ada error message"
- Supabase UI mungkin auto-run tapi tidak menampilkan hasil
- **Solution:** Cek dengan query di Step 1 & 2

### ❓ "Error `role 'authenticated' tidak ada`"
- Ganti `'authenticated'` jadi `'user'`
```sql
INSERT INTO auth.users (..., aud, role)
VALUES (..., 'authenticated', 'user');
```

### ❓ "Masih tidak ada akun"
- **Gunakan cara alternatif di Step 3** (Supabase UI lebih reliable)

---

## 🚀 Next Setelah Auth Users OK

Jika auth users sudah ada, run Step 3 dari `SETUP_SQL_SIMPLE.md`:

```sql
-- Create HR Profile
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

-- Create Legal Profile  
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

**Report back hasil dari Step 1 cek!** 🔍

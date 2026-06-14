import { supabase } from "@/integrations/supabase/client";
import type { AuthUser, UserProfile } from "@/types";
import { handleSupabaseError } from "@/lib/api-client";

export async function signIn(email: string, password: string) {
  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    return data;
  } catch (error: any) {
    handleSupabaseError(error, "Login gagal");
    throw error;
  }
}

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, string>
) {
  try {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: undefined,
        },
      });

    if (error) {
      if (error.status === 429) {
        throw new Error(
          "Terlalu banyak percobaan registrasi. Tunggu beberapa menit lalu coba lagi."
        );
      }

      throw error;
    }

    return data;
  } catch (error: any) {
    handleSupabaseError(error, "Registrasi gagal");
    throw error;
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut();

    localStorage.removeItem(
      "sb-tghgzaruxdpqkhgrzlmv-auth-token"
    );

    localStorage.removeItem(
      "hireledger.remember"
    );

  } catch (error: any) {
    handleSupabaseError(error, "Logout gagal");
    throw error;
  }
}

export async function getSession() {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) throw error;

  return data.session;
}

export async function fetchUserProfile(
  userId: string
): Promise<UserProfile | null> {

  const { data, error } =
    await supabase
      .from("users")
      .select(`
        id, email, full_name, role, company_id, created_at,
        company:companies(id, name, logo_url)
      `)
      .eq("id", userId)
      .maybeSingle();

  if (error) {
    handleSupabaseError(
      error,
      "Gagal memuat profil pengguna"
    );

    return null;
  }

  return data as UserProfile | null;
}

export async function registerCompany(payload: {
  companyName: string;
  fullName: string;
  email: string;
}): Promise<string> {

  try {

    const { data, error } =
      await supabase.rpc(
        "register_company",
        {
          p_company_name:
            payload.companyName,

          p_full_name:
            payload.fullName,

          p_email:
            payload.email,
        }
      );

    if (error) throw error;

    return data as string;

  } catch (error: any) {

    handleSupabaseError(
      error,
      "Gagal mendaftarkan perusahaan"
    );

    throw error;
  }
}

export function mapProfileToAuthUser(
  profile: UserProfile
): AuthUser {

  const company =
    profile.company as {
      name?: string;
    } | null;

  return {
    id: profile.id,

    email: profile.email,

    fullName:
      profile.full_name,

    role:
      profile.role,

    companyId:
      profile.company_id,

    companyName:
      company?.name ?? null,

    avatarUrl:
      profile.avatar_url,

    walletAddress:
      profile.wallet_address,
  };
}

export async function updateWalletAddress(
  userId: string,
  walletAddress: string | null
) {

  const { error } =
    await supabase
      .from("users")
      .update({
        wallet_address:
          walletAddress,
      })
      .eq("id", userId);

  if (error) {
    handleSupabaseError(
      error,
      "Gagal menyimpan wallet"
    );
  }
}

export function setRememberMe(
  remember: boolean
) {
  if (remember) {
    localStorage.setItem(
      "hireledger.remember",
      "true"
    );
  } else {
    localStorage.removeItem(
      "hireledger.remember"
    );
  }
}

export async function inviteUser(payload: {
  email: string;
  fullName: string;
  role: "hr" | "legal" | "finance" | "employee";
  companyId: string;
}) {
  try {
    // Buat user baru via signUp
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: payload.email,
      password: "TempPassword123!" + Math.random().toString(36).slice(-4),
      options: {
        data: {
          full_name: payload.fullName,
          role: payload.role,
        },
      },
    });

    if (signUpError) throw signUpError;

    if (!authData.user) throw new Error("User creation failed");

    // Insert ke user_profiles dengan role yang sesuai
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: payload.email,
        full_name: payload.fullName,
        role: payload.role,
        company_id: payload.companyId,
        is_active: true,
      });

    if (profileError) throw profileError;

    return {
      success: true,
      message: `User ${payload.fullName} berhasil diundang. Email verifikasi telah dikirim.`,
    };
  } catch (error: any) {
    handleSupabaseError(error, "Gagal mengundang user");
    throw error;
  }
}

export async function getCompanyUsers(companyId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (error: any) {
    handleSupabaseError(error, "Gagal mengambil data user");
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    handleSupabaseError(error, "Gagal menghapus user");
    throw error;
  }
}
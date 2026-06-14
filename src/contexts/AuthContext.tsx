import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AuthUser, UserRole } from "@/types";
import { ROLE_PERMISSIONS } from "@/types";
import {
  signIn,
  signUp,
  signOut,
  fetchUserProfile,
  registerCompany,
  mapProfileToAuthUser,
  setRememberMe,
} from "@/services/auth.service";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (payload: {
    nama: string;
    email: string;
    password: string;
    tenantName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ✅ Local cache helpers for instant loading
const CACHE_KEY = "hireledger.auth.user";

function getCachedUser(): AuthUser | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Ignore storage errors (quota exceeded, etc)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ Initialize from cache for instant display
  const [user, setUser] = useState<AuthUser | null>(getCachedUser());
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profile = await fetchUserProfile(userId);
      if (profile) {
        const authUser = mapProfileToAuthUser(profile);
        setUser(authUser);
        setCachedUser(authUser); // ✅ Update cache
      } else {
        setUser(null);
        setCachedUser(null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      // If profile load fails, keep cached user but mark as stale
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // ✅ Check session and load fresh profile
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (session?.user) {
          // Load fresh profile data
          await loadProfile(session.user.id);
        } else {
          // No session, clear user
          setUser(null);
          setCachedUser(null);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    // ✅ Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setCachedUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = async (email: string, password: string, rememberMe = true) => {
    const { user: authUser } = await signIn(email, password);
    if (!authUser) throw new Error("Login gagal");
    setRememberMe(rememberMe);
    await loadProfile(authUser.id);
  };

  const register = async (payload: {
    nama: string;
    email: string;
    password: string;
    tenantName: string;
  }) => {
    const { user: authUser } = await signUp(payload.email, payload.password, {
      full_name: payload.nama,
      company_name: payload.tenantName,
    });

    if (!authUser) throw new Error("Registrasi gagal");

    await registerCompany({
      companyName: payload.tenantName,
      fullName: payload.nama,
      email: payload.email,
    });

    await loadProfile(authUser.id);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setCachedUser(null); // ✅ Clear cache on logout
  };

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      const perms = ROLE_PERMISSIONS[user.role];
      return perms.includes("*") || perms.includes(permission);
    },
    [user],
  );

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  const refreshProfile = useCallback(async () => {
    if (user?.id) await loadProfile(user.id);
  }, [user?.id, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      hasPermission,
      hasRole,
      refreshProfile,
    }),
    [user, isLoading, hasPermission, hasRole, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return context;
}

"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { config, SiteConfig } from "./config";

type AdminProfile = SiteConfig["admin"];

type AuthCtx = {
  isAdmin: boolean;
  adminConfig: AdminProfile;
  loading: boolean;
  loginAdmin: (
    username: string,
    pass: string
  ) => Promise<{
    ok: boolean;
    error?: string;
    remainingAttempts?: number;
    blockedRemainingSeconds?: number;
  }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateAdminProfile: (updated: Partial<AdminProfile>) => Promise<boolean>;
};

const AuthContext = createContext<AuthCtx | null>(null);

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server-side";
  try {
    let id = localStorage.getItem("nimzz_device_id");
    if (!id) {
      id = "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("nimzz_device_id", id);
    }
    return id;
  } catch {
    return "ephemeral-device";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminConfig, setAdminConfig] = useState<AdminProfile>(config.admin);
  const [loading, setLoading] = useState(true);

  // 1. Initial Local Cache for zero-delay paint
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("nimzz_admin_custom_profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          setAdminConfig((prev) => ({
            ...prev,
            ...parsed,
            socials: { ...prev.socials, ...(parsed.socials || {}) },
          }));
        }
      } catch {}
    }
  }, []);

  // 2. Fetch server-side JSON database admin profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setAdminConfig((prev) => {
            const merged = {
              ...prev,
              ...json.data,
              socials: {
                ...prev.socials,
                ...(json.data.socials || {}),
              },
            };
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("nimzz_admin_custom_profile", JSON.stringify(merged));
              } catch {}
            }
            return merged;
          });
        }
      }
    } catch {}
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(Boolean(data.authenticated));
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
    fetchProfile();
    const interval = setInterval(fetchProfile, 10000);
    return () => clearInterval(interval);
  }, [checkSession, fetchProfile]);

  const loginAdmin = async (username: string, pass: string) => {
    const deviceId = getOrCreateDeviceId();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
        body: JSON.stringify({
          username: username.trim(),
          password: pass,
          deviceId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setIsAdmin(true);
        await fetchProfile();
        return { ok: true };
      }

      return {
        ok: false,
        error: data.error || "Gagal masuk.",
        remainingAttempts: data.remainingAttempts,
        blockedRemainingSeconds: data.blockedRemainingSeconds,
      };
    } catch {
      return {
        ok: false,
        error: "Terjadi gangguan jaringan, coba beberapa saat lagi.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    await checkSession();
    await fetchProfile();
  };

  const updateAdminProfile = async (updated: Partial<AdminProfile>): Promise<boolean> => {
    try {
      // 1. Optimistically update local state & cache
      setAdminConfig((prev) => {
        const merged = {
          ...prev,
          ...updated,
          socials: {
            ...prev.socials,
            ...(updated.socials || {}),
          },
        };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("nimzz_admin_custom_profile", JSON.stringify(merged));
          } catch {}
        }
        return merged;
      });

      // 2. Persist to JSON database via API
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      return res.ok;
    } catch (e) {
      console.error("Failed to persist admin profile:", e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminConfig,
        loading,
        loginAdmin,
        logout,
        refreshProfile,
        updateAdminProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

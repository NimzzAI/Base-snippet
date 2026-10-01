"use client";
import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { config, SiteConfig } from "./config";

type AdminProfile = SiteConfig["admin"];

type AuthCtx = {
  isAdmin: boolean;
  adminConfig: AdminProfile;
  /** true selama status login admin belum selesai dicek server (jangan redirect / tampilkan peringatan dulu) */
  loading: boolean;
  /** true setelah profil dari server berhasil dimuat sekali (cache lokal tidak dihitung) */
  profileReady: boolean;
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
  updateAdminProfile: (updated: Partial<AdminProfile>) => Promise<{ ok: boolean; error?: string }>;
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
  const [profileReady, setProfileReady] = useState(false);
  const lastProfileJson = useRef<string>("");

  // 1. Initial Local Cache for zero-delay paint
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (localStorage.getItem("nimzz_admin_hint") === "1") setIsAdmin(true);
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
      const res = await fetch("/api/admin/profile", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (!json.ok || !json.data) return;

      setProfileReady(true);

      // Kalau isi profil di server sama dengan yang terakhir, jangan bikin object baru.
      // Object baru tiap polling membuat form yang sedang diedit ikut ter-reset.
      const serialized = JSON.stringify(json.data);
      if (serialized === lastProfileJson.current) return;
      lastProfileJson.current = serialized;

      setAdminConfig((prev) => {
        const merged = {
          ...prev,
          ...json.data,
          socials: {
            ...prev.socials,
            ...(json.data.socials || {}),
          },
        };
        try {
          localStorage.setItem("nimzz_admin_custom_profile", JSON.stringify(merged));
        } catch {}
        return merged;
      });
    } catch {
      // Gagal jaringan: biarkan profil yang sedang tampil, jangan balik ke default
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const authed = Boolean(data.authenticated);
        setIsAdmin(authed);
        try {
          if (authed) localStorage.setItem("nimzz_admin_hint", "1");
          else localStorage.removeItem("nimzz_admin_hint");
        } catch {}
      }
      // Kalau server error (5xx) atau jaringan putus, status login lama dipertahankan.
      // Sebelumnya langsung dianggap logout sehingga admin tiba-tiba disuruh login.
    } catch {
      // abaikan, pertahankan status sebelumnya
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
        try { localStorage.setItem("nimzz_admin_hint", "1"); } catch {}
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
    try { localStorage.removeItem("nimzz_admin_hint"); } catch {}
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    await checkSession();
    await fetchProfile();
  };

  const updateAdminProfile = async (
    updated: Partial<AdminProfile>
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json().catch(() => null);

      // Ambil ulang dari server supaya tampilan sama dengan yang tersimpan
      await fetchProfile();

      if (!res.ok || !json?.ok) {
        return { ok: false, error: json?.error };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: "Tidak bisa terhubung ke server" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminConfig,
        loading,
        profileReady,
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

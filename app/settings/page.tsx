"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SettingsRedirect() {
  const router = useRouter();
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAdmin) {
      router.replace("/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [isAdmin, loading, router]);

  return (
    <div className="empty-state">
      <i className="fa-solid fa-gear fa-spin" />
      <h3>Mengarahkan ke Pengaturan Admin...</h3>
    </div>
  );
}

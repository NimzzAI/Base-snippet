"use client";
import { useEffect, useState } from "react";
import { config } from "@/lib/config";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenance] = useState(false);

  if (!isMaintenance) return <>{children}</>;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", flexDirection: "column", gap: 16, textAlign: "center", padding: 24,
    }}>
      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 48, color: "var(--accent-yellow)" }} />
      <h1 style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700 }}>
        {config.websiteName}
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 360 }}>
        Sedang dalam pemeliharaan. Kembali lagi nanti.
      </p>
      <div style={{
        padding: "8px 18px", border: "1px solid var(--border)",
        borderRadius: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-muted)",
      }}>
        maintenance_mode = true
      </div>
    </div>
  );
}

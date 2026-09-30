"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileTabBar from "./MobileTabBar";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminConfig, isAdmin } = useAuth();
  const socials = adminConfig?.socials || config.admin.socials;

  // Halaman embed tampil polos tanpa sidebar dan tab bar
  if (pathname?.startsWith("/embed")) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      {/* Neo-brutalist Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="main-area">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content-wrapper">
          <div className="container">{children}</div>
        </main>

        <footer>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <Link href="/owner" className="social-btn" style={{ background: "var(--yellow)", color: "#000" }}>
                <i className="fa-solid fa-user-astronaut" /> Halaman Developer & Tautan Resmi
              </Link>
              {socials.whatsapp && (
                <a href={socials.whatsapp} target="_blank" rel="noreferrer" className="social-btn social-btn-wa">
                  <i className="fa-brands fa-whatsapp" /> WA Channel
                </a>
              )}
              {socials.github && (
                <a
                  href={socials.github.startsWith("http") ? socials.github : `https://github.com/${socials.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn social-btn-gh"
                >
                  <i className="fa-brands fa-github" /> GitHub
                </a>
              )}
              {socials.telegram && (
                <a
                  href={socials.telegram.startsWith("http") ? socials.telegram : `https://t.me/${socials.telegram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn social-btn-tg"
                >
                  <i className="fa-brands fa-telegram" /> Telegram
                </a>
              )}
              {socials.tiktok && (
                <a
                  href={socials.tiktok.startsWith("http") ? socials.tiktok : `https://tiktok.com/@${socials.tiktok.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn social-btn-tt"
                >
                  <i className="fa-brands fa-tiktok" /> TikTok
                </a>
              )}
            </div>

            <p style={{ marginBottom: 6 }}>
              © {new Date().getFullYear()} <strong>{config.websiteName}</strong> — {config.description}
            </p>
            <div style={{ fontSize: "0.76rem", color: "#888", display: "flex", justifyContent: "center", gap: 14 }}>
              <span>{config.branding.footerText}</span>
              <span>•</span>
              <Link href="/owner" style={{ color: "var(--text)", fontWeight: 700 }}>
                Profil Developer
              </Link>
              <span>•</span>
              <Link href={isAdmin ? "/dashboard" : "/admin/login"} style={{ color: "var(--text)", fontWeight: 700 }}>
                {isAdmin ? "Panel Admin" : "Login Admin"}
              </Link>
            </div>
          </div>
        </footer>

        {/* Mobile Fixed Bottom Navigation Tab Bar */}
        <MobileTabBar />
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import { useRealtimeCategories } from "@/lib/categories";

const CAT_ICONS: Record<string, string> = {
  Tools: "fa-wrench",
  Bot: "fa-robot",
  Game: "fa-gamepad",
  AI: "fa-brain",
  Anime: "fa-star",
  Web: "fa-globe",
  Mobile: "fa-mobile-screen",
  API: "fa-plug",
  Security: "fa-shield-halved",
  DevOps: "fa-gears",
  Database: "fa-database",
  Script: "fa-terminal",
  Other: "fa-box-archive",
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, adminConfig, logout } = useAuth();
  const { categories } = useRealtimeCategories();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalCodes, setTotalCodes] = useState(0);

  // Lock body scroll when mobile sidebar is open to prevent "tembus"
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Codes count per category from API
  useEffect(() => {
    let mounted = true;
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/codes");
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && mounted) {
            const cnt: Record<string, number> = {};
            json.data.forEach((d: any) => {
              const cat = d.category || "Other";
              cnt[cat] = (cnt[cat] || 0) + 1;
            });
            setCounts(cnt);
            setTotalCodes(json.data.length);
          }
        }
      } catch {}
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: "/", icon: "fa-house", label: "Beranda" },
    { href: "/search", icon: "fa-magnifying-glass", label: "Cari Code", count: totalCodes },
    { href: "/request", icon: "fa-clipboard-list", label: "Request Code" },
    { href: "/owner", icon: "fa-user-astronaut", label: "Profil Developer" },
    ...(isAdmin
      ? [
          { href: "/publish", icon: "fa-plus", label: "Publish Code" },
          { href: "/dashboard", icon: "fa-gauge", label: "Panel Admin" },
        ]
      : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const avatarSrc = adminConfig?.photoURL || config.admin.photoURL;
  const adminName = adminConfig?.displayName || config.admin.displayName;

  return (
    <>
      {/* Opaque backdrop to prevent any clicking/scrolling through */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(3px)",
          zIndex: 9998,
          display: isOpen ? "block" : "none",
        }}
      />

      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{
          zIndex: 9999,
          background: "#FFFFFF",
          boxShadow: isOpen ? "8px 0px 24px rgba(0,0,0,0.3)" : undefined,
        }}
      >
        {/* Brand header with mobile close button */}
        <div
          className="sidebar-brand"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-code" />
            <Link href="/" onClick={onClose}>
              {config.branding.logoPrefix}
              <span>{config.branding.logoSuffix}</span>
            </Link>
          </div>

          {/* Close button visible on mobile */}
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Menu"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid #000",
                background: "var(--red)",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 800,
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu Utama</div>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className={`sidebar-link ${isActive(l.href) ? "active" : ""}`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className={`fa-solid ${l.icon}`} />
                <span>{l.label}</span>
              </span>
              {l.count !== undefined && l.count > 0 && (
                <span className="sidebar-count">{l.count}</span>
              )}
            </Link>
          ))}

          <div className="sidebar-divider" />

          {/* Dynamic Real-time Categories */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingRight: 6,
            }}
          >
            <div className="sidebar-section-title" style={{ paddingBottom: 0 }}>
              Kategori ({categories.length})
            </div>
            {isAdmin && (
              <Link
                href="/dashboard"
                onClick={onClose}
                title="Kelola Kategori di Admin"
                style={{ fontSize: "0.75rem", color: "var(--blue)", fontWeight: 700 }}
              >
                <i className="fa-solid fa-plus-minus" />
              </Link>
            )}
          </div>

          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
            {categories.map((cat) => {
              const href = `/category/${encodeURIComponent(cat)}`;
              const active = pathname === href;
              return (
                <Link
                  key={cat}
                  href={href}
                  onClick={onClose}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  style={{ padding: "8px 12px" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <i className={`fa-solid ${CAT_ICONS[cat] || "fa-tag"}`} />
                    <span>{cat}</span>
                  </span>
                  {counts[cat] !== undefined && counts[cat] > 0 && (
                    <span className="sidebar-count">{counts[cat]}</span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="sidebar-divider" />

          {/* Official Community Link to Developer / Owner page */}
          <div className="sidebar-section-title">Developer & Komunitas</div>
          <Link
            href="/owner"
            onClick={onClose}
            className={`sidebar-link ${pathname === "/owner" ? "active" : ""}`}
            style={{
              background: pathname === "/owner" ? "var(--surface)" : "var(--yellow)",
              color: "#000",
              border: "2px solid #000",
              boxShadow: "2px 2px 0px #000",
              marginBottom: 4,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-address-card" />
              <span>Profil Owner & Sosial</span>
            </span>
            <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.8rem" }} />
          </Link>
        </nav>

        {/* Footer: Admin Status & Login Action */}
        <div className="sidebar-footer">
          {isAdmin ? (
            <div>
              <div className="sidebar-user">
                <div className="avatar-lg">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={adminName}
                      width={42}
                      height={42}
                      unoptimized={avatarSrc.startsWith("data:")}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  ) : (
                    <span>{(adminName || "A")[0]}</span>
                  )}
                </div>
                <div className="sidebar-user-info">
                  <strong>{adminName}</strong>
                  <span>
                    <i className="fa-solid fa-crown" style={{ color: "var(--yellow)" }} />
                    Administrator
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="btn btn-sm btn-yellow"
                  style={{ textAlign: "center" }}
                >
                  <i className="fa-solid fa-gear" /> Panel
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    if (onClose) onClose();
                  }}
                  className="btn btn-sm btn-danger"
                >
                  <i className="fa-solid fa-power-off" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Clear Admin Login Button ("login admin nya mana woi") */}
              <Link
                href="/admin/login"
                onClick={onClose}
                className="btn btn-sm btn-block"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "2px solid #000",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  boxShadow: "2px 2px 0px #000",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <i className="fa-solid fa-shield-halved" style={{ color: "var(--blue)" }} />
                <span>Login Administrator</span>
              </Link>

              <div style={{ padding: "4px 2px", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textAlign: "center" }}>
                <div>{config.websiteName}</div>
                <div style={{ fontSize: "0.7rem", color: "#888", marginTop: 2 }}>
                  {config.branding.footerText}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import { useRealtimeCategories } from "@/lib/categories";
import { useBookmarks } from "@/lib/bookmarks";

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
  const { count: bookmarkCount } = useBookmarks();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalCodes, setTotalCodes] = useState(0);

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
    { href: "/bookmarks", icon: "fa-bookmark", label: "Tersimpan", count: bookmarkCount },
    { href: "/request", icon: "fa-clipboard-list", label: "Request Code" },
    { href: "/owner", icon: "fa-user-astronaut", label: "Profil Developer" },
    { href: "/api-docs", icon: "fa-plug", label: "API Publik" },
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
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: 9998,
          display: isOpen ? "block" : "none",
        }}
      />

      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{
          zIndex: 9999,
          background: "var(--surface)",
          boxShadow: isOpen ? "8px 0px 0px var(--border)" : undefined,
        }}
      >
        {/* Brand header */}
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

          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Menu"
              style={{
                width: 32,
                height: 32,
                borderRadius: "6px",
                border: "2px solid var(--border)",
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
          <div className="sidebar-section-title" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-muted)" }}>
            MENU UTAMA
          </div>
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

          <hr className="stitch-divider" style={{ margin: "10px 6px" }} />

          {/* Dynamic Real-time Categories */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingRight: 6,
            }}
          >
            <div
              className="sidebar-section-title"
              style={{ paddingBottom: 0, fontFamily: "var(--font-mono)", color: "var(--ink-muted)" }}
            >
              KATEGORI ({categories.length})
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

          <hr className="stitch-divider" style={{ margin: "10px 6px" }} />

          <div className="sidebar-section-title" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-muted)" }}>
            DEVELOPER & KOMUNITAS
          </div>
          <Link
            href="/owner"
            onClick={onClose}
            className={`sidebar-link ${pathname === "/owner" ? "active" : ""}`}
            style={{
              background: pathname === "/owner" ? "var(--surface)" : "var(--yellow)",
              color: "#000",
              border: "2px solid var(--border)",
              boxShadow: "2px 2px 0px var(--border)",
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
        <div className="sidebar-footer" style={{ background: "var(--surface)" }}>
          {isAdmin ? (
            <div>
              <div className="sidebar-user">
                <div className="avatar-lg" style={{ borderRadius: 10 }}>
                  {avatarSrc ? (
                    <Image
                      quality={95}
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
                  <span style={{ fontFamily: "var(--font-mono)" }}>
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
              <Link
                href="/admin/login"
                onClick={onClose}
                className="btn btn-sm btn-block"
                style={{
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "2px solid var(--border)",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  boxShadow: "2px 2px 0px var(--border)",
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

              <div
                style={{
                  padding: "4px 2px",
                  fontSize: "0.72rem",
                  color: "var(--ink-muted)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                <div>{config.websiteName}</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Code } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import CodeCard from "@/components/CodeCard";

export default function OwnerPage() {
  const { adminConfig, isAdmin } = useAuth();
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveProfile, setLiveProfile] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setLiveProfile(json.data);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 8000);
    return () => clearInterval(interval);
  }, [fetchProfile]);

  const displayName = liveProfile?.displayName || adminConfig?.displayName || config.admin.displayName;
  const username = liveProfile?.username || adminConfig?.username || config.admin.username;
  const bio = liveProfile?.bio || adminConfig?.bio || config.admin.bio;
  const photoURL = liveProfile?.photoURL !== undefined ? liveProfile.photoURL : (adminConfig?.photoURL || config.admin.photoURL);
  const banner = liveProfile?.banner !== undefined ? liveProfile.banner : (adminConfig?.banner || config.admin.banner);
  const socials = { ...config.admin.socials, ...(adminConfig?.socials || {}), ...(liveProfile?.socials || {}) };

  const fetchOwnerCodes = useCallback(async () => {
    try {
      const res = await fetch(`/api/codes?authorUsername=${encodeURIComponent(username)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setCodes(json.data);
        }
      }
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchOwnerCodes();
    const interval = setInterval(fetchOwnerCodes, 8000);
    return () => clearInterval(interval);
  }, [fetchOwnerCodes]);

  const waUrl = socials.whatsapp;
  const ghUrl = socials.github?.startsWith("http")
    ? socials.github
    : `https://github.com/${socials.github || "NimzzAI"}`;
  const tgUrl = socials.telegram?.startsWith("http")
    ? socials.telegram
    : `https://t.me/${socials.telegram || "nimzz_dev"}`;
  const ttUrl = socials.tiktok?.startsWith("http")
    ? socials.tiktok
    : `https://tiktok.com/@${(socials.tiktok || "nimzz_code").replace("@", "")}`;

  const techStack = [
    { name: "JavaScript", icon: "fa-brands fa-js", bg: "#F7DF1E", color: "#000" },
    { name: "TypeScript", icon: "fa-solid fa-code", bg: "#3178C6", color: "#FFF" },
    { name: "Next.js", icon: "fa-solid fa-n", bg: "#000000", color: "#FFF" },
    { name: "React", icon: "fa-brands fa-react", bg: "#61DAFB", color: "#000" },
    { name: "Node.js", icon: "fa-brands fa-node", bg: "#339933", color: "#FFF" },
    { name: "Python", icon: "fa-brands fa-python", bg: "#3776AB", color: "#FFF" },
    { name: "Tailwind CSS", icon: "fa-solid fa-wind", bg: "#06B6D4", color: "#FFF" },
  ];

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", paddingTop: 10, paddingBottom: 40 }}>
      {/* Developer Hero Profile Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "3px solid #000",
          borderRadius: "16px",
          boxShadow: "6px 6px 0px #000",
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        {/* Banner Area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 220,
            background: "linear-gradient(135deg, #00ffa4 0%, #2563EB 100%)",
            borderBottom: "3px solid #000",
          }}
        >
          {banner && (
            <Image
 quality={95}
              src={banner}
              alt="Developer Banner"
              fill
              unoptimized={banner.startsWith("data:")}
              style={{ objectFit: "cover" }}
              priority
            />
          )}

          {/* Quick Edit button for admin */}
          {isAdmin && (
            <Link
              href="/dashboard"
              className="btn btn-sm btn-yellow"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 10,
                boxShadow: "3px 3px 0px #000",
              }}
            >
              <i className="fa-solid fa-pen" /> Edit Banner & Avatar
            </Link>
          )}
        </div>

        {/* Developer Info Box */}
        <div style={{ padding: "0 26px 26px", position: "relative" }}>
          {/* Avatar Pin */}
          <div
            style={{
              position: "relative",
              marginTop: -72,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 132,
                height: 132,
                borderRadius: "50%",
                border: "4px solid #000",
                background: "var(--yellow)",
                overflow: "hidden",
                boxShadow: "4px 4px 0px #000",
                position: "relative",
              }}
            >
              {photoURL ? (
                <Image
 quality={95}
                  src={photoURL}
                  alt={displayName}
                  width={264}
                  height={264}
                  unoptimized={photoURL.startsWith("data:")}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  priority
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    fontWeight: 800,
                  }}
                >
                  {displayName[0] || "N"}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span
                className="category-badge"
                style={{
                  background: "var(--yellow)",
                  color: "#000",
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                  border: "2px solid #000",
                }}
              >
                <i className="fa-solid fa-crown" style={{ marginRight: 6 }} />
                Platform Owner & Developer
              </span>
              <span
                className="category-badge"
                style={{
                  background: "var(--green)",
                  color: "#000",
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                  border: "2px solid #000",
                }}
              >
                <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
                Verified Creator
              </span>
            </div>
          </div>

          {/* Name & Bio */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 4 }}>
              {displayName}
            </h1>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.95rem",
                color: "var(--text-muted)",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              @{username} • Full-Stack Developer & Software Engineer
            </div>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text)",
                lineHeight: 1.6,
                maxWidth: 780,
                fontWeight: 600,
              }}
            >
              {bio}
            </p>
          </div>

          {/* Tech Stack Chips */}
          <div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
                color: "var(--text-muted)",
              }}
            >
              Tech Stack & Keahlian Utama
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  style={{
                    background: tech.bg,
                    color: tech.color,
                    border: "2px solid #000",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "2px 2px 0px #000",
                  }}
                >
                  <i className={tech.icon} />
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Official Channels & Social Hub */}
      <section style={{ marginBottom: 36 }}>
        <div className="section-head" style={{ marginBottom: 18 }}>
          <div>
            <h2>
              <i className="fa-solid fa-globe" style={{ color: "var(--blue)" }} />
              Tautan Resmi & Saluran Komunitas
            </h2>
            <p>
              Ikuti dan hubungi developer langsung melalui tautan saluran resmi berikut.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 16,
          }}
        >
          {/* WhatsApp Channel Card */}
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "var(--surface)",
                border: "3px solid #000",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "4px 4px 0px #000",
                textDecoration: "none",
                color: "var(--text)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    background: "#25D366",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    border: "2px solid #000",
                    boxShadow: "2px 2px 0px #000",
                    marginBottom: 12,
                  }}
                >
                  <i className="fa-brands fa-whatsapp" />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 4 }}>
                  WhatsApp Channel
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Update script terbaru, tips pemrograman, rilis code, dan diskusi sesama developer.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "#25D366",
                }}
              >
                <span>Gabung Saluran</span>
                <i className="fa-solid fa-arrow-right" />
              </div>
            </a>
          )}

          {/* GitHub Card */}
          {socials.github && (
            <a
              href={ghUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "var(--surface)",
                border: "3px solid #000",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "4px 4px 0px #000",
                textDecoration: "none",
                color: "var(--text)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    background: "#181818",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    border: "2px solid #000",
                    boxShadow: "2px 2px 0px #000",
                    marginBottom: 12,
                  }}
                >
                  <i className="fa-brands fa-github" />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 4 }}>
                  GitHub Profile
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Eksplorasi repositori open source, project bot, dan kontribusi kode publik.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "var(--text)",
                }}
              >
                <span>Kunjungi GitHub</span>
                <i className="fa-solid fa-arrow-right" />
              </div>
            </a>
          )}

          {/* Telegram Card */}
          {socials.telegram && (
            <a
              href={tgUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "var(--surface)",
                border: "3px solid #000",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "4px 4px 0px #000",
                textDecoration: "none",
                color: "var(--text)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    background: "#229ED9",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    border: "2px solid #000",
                    boxShadow: "2px 2px 0px #000",
                    marginBottom: 12,
                  }}
                >
                  <i className="fa-brands fa-telegram" />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 4 }}>
                  Telegram
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Hubungi langsung untuk kolaborasi teknis, diskusi script, atau konsultasi.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "#229ED9",
                }}
              >
                <span>Buka Telegram</span>
                <i className="fa-solid fa-arrow-right" />
              </div>
            </a>
          )}

          {/* TikTok Card */}
          {socials.tiktok && (
            <a
              href={ttUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "var(--surface)",
                border: "3px solid #000",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "4px 4px 0px #000",
                textDecoration: "none",
                color: "var(--text)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    background: "#FE2C55",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    border: "2px solid #000",
                    boxShadow: "2px 2px 0px #000",
                    marginBottom: 12,
                  }}
                >
                  <i className="fa-brands fa-tiktok" />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 4 }}>
                  TikTok
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Video singkat tutorial coding, behind-the-scenes bot automation, dan tips developer.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: "#FE2C55",
                }}
              >
                <span>Follow di TikTok</span>
                <i className="fa-solid fa-arrow-right" />
              </div>
            </a>
          )}
        </div>
      </section>

      {/* Section: Codes by the Developer */}
      <section>
        <div className="section-head" style={{ marginBottom: 18 }}>
          <div>
            <h2>
              <i className="fa-solid fa-code" style={{ color: "var(--green)" }} />
              Koleksi Kode oleh {displayName}
            </h2>
            <p>Daftar snippet dan modul kode yang dibagikan oleh developer.</p>
          </div>
        </div>

        {loading ? (
          <div className="snippets-grid">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="skeleton skeleton-card" />
              ))}
          </div>
        ) : codes.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-inbox" />
            <h3>Belum Ada Code Terbit</h3>
            <p>Developer belum mempublikasikan code publik.</p>
          </div>
        ) : (
          <div className="snippets-grid">
            {codes.map((code) => (
              <CodeCard key={code.id} code={code} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

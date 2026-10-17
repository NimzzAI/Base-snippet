"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Code } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import CodeCard from "@/components/CodeCard";
import { MustardDividerStrip, StitchedLoader } from "@/components/FieldJournalDecor";

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
  const photoURL =
    liveProfile?.photoURL !== undefined
      ? liveProfile.photoURL
      : adminConfig?.photoURL || config.admin.photoURL;
  const socials = {
    ...config.admin.socials,
    ...(adminConfig?.socials || {}),
    ...(liveProfile?.socials || {}),
  };

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
    "JavaScript",
    "TypeScript",
    "Next.js",
    "React",
    "Node.js",
    "Python",
    "Tailwind CSS",
  ];

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto" }}>
      {/* ============================================================
          1. OPEN CANVAS DEVELOPER PROFILE & TILTED ID WINDOW
          ============================================================ */}
      <section className="scratch-hero-section">
        <div className="scratch-hero-grid">
          {/* Left Column: Clean Canvas Typography + 1 Bottom Marker Highlight */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div className="scratch-status-line" style={{ marginBottom: 18 }}>
              <span className="scratch-status-dot" />
              <span>MAKER PROFILE // @{username.toUpperCase()}</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(2.2rem, 4.8vw, 3.7rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 0.96,
                marginBottom: 20,
                color: "var(--ink)",
              }}
            >
              Halo, saya <span className="marker-under">{displayName}</span>.
            </h1>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: "var(--ink-muted)",
                maxWidth: 540,
                marginBottom: 24,
              }}
            >
              {bio}
            </p>

            {/* Tech Stack Monospace List */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
              {techStack.map((tech) => (
                <span key={tech} className="camp-stamp">
                  ✳ {tech}
                </span>
              ))}
            </div>

            {isAdmin && (
              <Link href="/dashboard" className="btn btn-yellow btn-sm">
                <i className="fa-solid fa-pen" /> KELOLA PROFIL &amp; BANNER
              </Link>
            )}
          </div>

          {/* Right Column: Tilted Profile Window (-1.2deg) with 2 Corner Sticky Notes */}
          <div className="scratch-window-wrap">
            <div className="scratch-sticker-tl">VERIFIED // PLATFORM OWNER</div>

            <div className="scratch-window">
              <div className="scratch-window-bar">
                <span>id-card.json</span>
                <span style={{ color: "#2d6a4f" }}>● ONLINE</span>
              </div>

              <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    border: "1.5px solid var(--border)",
                    background: "var(--surface-alt)",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {photoURL ? (
                    <Image
                      quality={95}
                      src={photoURL}
                      alt={displayName}
                      width={168}
                      height={168}
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
                        fontSize: "2rem",
                        fontWeight: 800,
                      }}
                    >
                      {displayName[0] || "N"}
                    </div>
                  )}
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>
                    {displayName}
                  </div>
                  <div style={{ color: "var(--ink-muted)" }}>@{username}</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="camp-stamp" style={{ background: "var(--sage-note)", color: "#141413" }}>
                      {codes.length} PUBLIC SNIPPETS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="scratch-sticker-br">OPEN FOR COLLAB ✳ 24/7</div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. FULL-WIDTH MUSTARD MARQUEE STRIP
          ============================================================ */}
      <MustardDividerStrip
        items={[
          `@${username.toUpperCase()}`,
          "FULL-STACK DEVELOPER",
          `${codes.length} SNIPPET PUBLIK`,
          "OPEN SOURCE & AUTOMATION",
          "DIRECT CHANNELS",
        ]}
      />

      {/* ============================================================
          3. OFFICIAL CHANNELS ON OPEN CANVAS
          ============================================================ */}
      <section className="section" style={{ paddingTop: 44, paddingBottom: 28 }}>
        <div className="section-head" style={{ marginBottom: 20 }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginBottom: 6,
              }}
            >
              ✳ NETWORK // DIRECT LINKS
            </div>
            <h2 style={{ fontSize: "1.65rem", fontWeight: 800 }}>
              Saluran Resmi &amp; <span className="marker-under">Kontak Developer</span>
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="feature-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}
            >
              <div>
                <span className="camp-stamp" style={{ marginBottom: 10, background: "var(--sage-note)", color: "#141413" }}>
                  01 // WHATSAPP
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>Saluran WhatsApp</h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Catatan rilis script terbaru, tips pemrograman, dan pembaruan platform.
                </p>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", fontWeight: 700 }}>
                GABUNG SALURAN →
              </div>
            </a>
          )}

          {socials.github && (
            <a
              href={ghUrl}
              target="_blank"
              rel="noreferrer"
              className="feature-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}
            >
              <div>
                <span className="camp-stamp" style={{ marginBottom: 10, background: "var(--mustard)", color: "#141413" }}>
                  02 // GITHUB
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>Arsip GitHub</h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Eksplorasi repositori sumber terbuka, eksperimen bot, dan pustaka utilitas.
                </p>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", fontWeight: 700 }}>
                BUKA GITHUB →
              </div>
            </a>
          )}

          {socials.telegram && (
            <a
              href={tgUrl}
              target="_blank"
              rel="noreferrer"
              className="feature-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}
            >
              <div>
                <span className="camp-stamp" style={{ marginBottom: 10, background: "var(--rose-note)", color: "#141413" }}>
                  03 // TELEGRAM
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>Kontak Telegram</h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Sapa langsung untuk diskusi teknis, kolaborasi fitur, atau arsitektur sistem.
                </p>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", fontWeight: 700 }}>
                KIRIM PESAN →
              </div>
            </a>
          )}

          {socials.tiktok && (
            <a
              href={ttUrl}
              target="_blank"
              rel="noreferrer"
              className="feature-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}
            >
              <div>
                <span className="camp-stamp" style={{ marginBottom: 10 }}>
                  04 // TIKTOK
                </span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>Video TikTok</h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Cuplikan singkat eksperimen koding, demo proyek, dan pembuatan aplikasi.
                </p>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", fontWeight: 700 }}>
                TONTON VIDEO →
              </div>
            </a>
          )}
        </div>
      </section>

      {/* ============================================================
          4. DEVELOPER SNIPPETS
          ============================================================ */}
      <section className="section" style={{ paddingTop: 16, paddingBottom: 48 }}>
        <div className="section-head" style={{ marginBottom: 20 }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginBottom: 6,
              }}
            >
              ✳ REPOSITORY // PUBLISHED BY @{username.toUpperCase()}
            </div>
            <h2 style={{ fontSize: "1.65rem", fontWeight: 800 }}>
              Koleksi Kode <span className="marker-under">{displayName}</span>
            </h2>
          </div>
        </div>

        {loading ? (
          <StitchedLoader label="Memuat Koleksi Kode Developer..." code="[OWNER.CODES]" count={3} />
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

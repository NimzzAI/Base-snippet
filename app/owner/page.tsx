"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Code } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import CodeCard from "@/components/CodeCard";
import {
  ParallaxCampBanner,
  MustardDividerStrip,
  StitchedLoader,
} from "@/components/FieldJournalDecor";

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

  const displayName =
    liveProfile?.displayName || adminConfig?.displayName || config.admin.displayName;
  const username =
    liveProfile?.username || adminConfig?.username || config.admin.username;
  const bio = liveProfile?.bio || adminConfig?.bio || config.admin.bio;
  const photoURL =
    liveProfile?.photoURL !== undefined
      ? liveProfile.photoURL
      : adminConfig?.photoURL || config.admin.photoURL;
  const banner =
    liveProfile?.banner !== undefined
      ? liveProfile.banner
      : adminConfig?.banner || config.admin.banner;
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

  const totalViews = codes.reduce((acc, c) => acc + (c.views || 0), 0);

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
    { name: "JavaScript", icon: "fa-brands fa-js" },
    { name: "TypeScript", icon: "fa-solid fa-code" },
    { name: "Next.js", icon: "fa-solid fa-n" },
    { name: "React", icon: "fa-brands fa-react" },
    { name: "Node.js", icon: "fa-brands fa-node" },
    { name: "Python", icon: "fa-brands fa-python" },
    { name: "Tailwind CSS", icon: "fa-solid fa-wind" },
  ];

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", paddingTop: 8, paddingBottom: 48 }}>
      {/* ============================================================
          1. DEVELOPER SHOWCASE PROFILE CARD (WITH 60FPS BANNER & CLEAN AVATAR LAYOUT)
          ============================================================ */}
      <section
        style={{
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: "2px",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        {/* 60fps Interactive Developer Banner */}
        <ParallaxCampBanner
          imageUrl={banner || undefined}
          height={220}
          stampLeft={`DEVELOPER STUDIO // @${username.toUpperCase()}`}
          stampRight="● VERIFIED OWNER"
        >
          {isAdmin && (
            <Link
              href="/dashboard"
              className="btn btn-sm btn-yellow"
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                zIndex: 10,
              }}
            >
              <i className="fa-solid fa-camera" /> Edit Banner &amp; Profil
            </Link>
          )}
        </ParallaxCampBanner>

        {/* Profile Body — ONLY the Avatar overlaps the Banner; Text sits 100% cleanly on the light card! */}
        <div style={{ padding: "0 22px 26px", position: "relative" }}>
          {/* Row 1: Overlapping Framed Avatar on Left + Live Stats Strip on Right */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 16,
            }}
          >
            {/* ONLY the Avatar Frame has negative marginTop so text NEVER touches the dark banner */}
            <div
              style={{
                marginTop: -54,
                position: "relative",
                zIndex: 10,
                background: "var(--surface)",
                padding: 6,
                border: "1.5px solid var(--border)",
                boxShadow: "3px 3px 0px var(--border)",
                transform: "rotate(-1.2deg)",
              }}
            >
              <div
                style={{
                  width: 104,
                  height: 104,
                  border: "1.5px solid var(--border)",
                  background: "var(--surface-alt)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {photoURL ? (
                  <Image
                    quality={95}
                    src={photoURL}
                    alt={displayName}
                    width={208}
                    height={208}
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
                      fontSize: "2.4rem",
                      fontWeight: 800,
                    }}
                  >
                    {displayName[0] || "N"}
                  </div>
                )}
              </div>
            </div>

            {/* Live Developer Stats Strip (Sits cleanly on the card below the banner) */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 12 }}>
              <div
                style={{
                  background: "var(--surface-alt)",
                  border: "1.5px solid var(--border)",
                  padding: "7px 14px",
                  boxShadow: "2px 2px 0px var(--border)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <div style={{ fontSize: "0.66rem", color: "var(--ink-muted)", fontWeight: 700 }}>
                  TOTAL SNIPPET
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--ink)" }}>
                  {codes.length} File
                </div>
              </div>

              <div
                style={{
                  background: "var(--mustard)",
                  border: "1.5px solid #141413",
                  padding: "7px 14px",
                  boxShadow: "2px 2px 0px #141413",
                  fontFamily: "var(--font-mono)",
                  color: "#141413",
                }}
              >
                <div style={{ fontSize: "0.66rem", fontWeight: 700, opacity: 0.85 }}>
                  TOTAL DIBACA
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                  {totalViews} Views
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Clean Developer Name, Role Badge, & Handle (100% on light card background) */}
          <div style={{ marginBottom: 20 }}>
            <div className="scratch-status-line" style={{ marginBottom: 6 }}>
              <span className="live-dot-pulse" />
              <span>PLATFORM CREATOR &amp; LEAD DEVELOPER</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "clamp(1.75rem, 3.4vw, 2.35rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.1,
                  color: "var(--ink)",
                }}
              >
                <span className="marker-under">{displayName}</span>
              </h1>
              <span className="camp-stamp" style={{ background: "var(--sage-note)", color: "#141413" }}>
                ✓ VERIFIED
              </span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.84rem",
                color: "var(--ink-muted)",
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              @{username} • Full-Stack Software Engineer
            </div>
          </div>

          {/* Row 3: Bio Box & Tech Stack */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              paddingTop: 18,
              borderTop: "1.5px solid var(--border)",
            }}
          >
            {/* Bio */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  marginBottom: 8,
                }}
              >
                ✳ TENTANG DEVELOPER
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.86rem",
                  lineHeight: 1.65,
                  color: "var(--ink)",
                }}
              >
                {bio}
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  marginBottom: 8,
                }}
              >
                ✳ TECH STACK &amp; KEAHLIAN UTAMA
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="camp-stamp"
                    style={{
                      padding: "5px 10px",
                      fontSize: "0.76rem",
                      background: "var(--surface-alt)",
                      gap: 6,
                    }}
                  >
                    <i className={tech.icon} />
                    <span>{tech.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. FULL-BLEED INFINITE LOOPING MUSTARD MARQUEE STRIP
          ============================================================ */}
      <div style={{ marginBottom: 36 }}>
        <MustardDividerStrip
          items={[
            `@${username.toUpperCase()}`,
            "VERIFIED PLATFORM OWNER",
            `${codes.length} SNIPPET PUBLIK`,
            `${totalViews} TOTAL VIEWS`,
            "OPEN SOURCE & AUTOMATION",
            "DIRECT COMMUNITY CHANNELS",
          ]}
        />
      </div>

      {/* ============================================================
          3. OFFICIAL CHANNELS & SOCIAL HUB
          ============================================================ */}
      <section style={{ marginBottom: 40 }}>
        <div className="section-head" style={{ marginBottom: 18 }}>
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
              ✳ NETWORK // DIRECT CHANNELS
            </div>
            <h2 style={{ fontSize: "1.55rem", fontWeight: 800 }}>
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
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="camp-stamp" style={{ background: "var(--sage-note)", color: "#141413" }}>
                    01 // WHATSAPP
                  </span>
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: "1.25rem", margin: 0, width: 34, height: 34 }} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>
                  Saluran WhatsApp
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Update rilis script terbaru, tips pemrograman, dan pengumuman komunitas.
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
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="camp-stamp" style={{ background: "var(--mustard)", color: "#141413" }}>
                    02 // GITHUB
                  </span>
                  <i className="fa-brands fa-github" style={{ fontSize: "1.25rem", margin: 0, width: 34, height: 34 }} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>
                  Repositori GitHub
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Eksplorasi proyek open-source, modul otomatisasi, dan pustaka kode.
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
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="camp-stamp" style={{ background: "var(--rose-note)", color: "#141413" }}>
                    03 // TELEGRAM
                  </span>
                  <i className="fa-brands fa-telegram" style={{ fontSize: "1.25rem", margin: 0, width: 34, height: 34 }} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>
                  Kontak Telegram
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Hubungi langsung untuk diskusi teknis, kolaborasi fitur, atau pertanyaan.
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
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="camp-stamp">04 // TIKTOK</span>
                  <i className="fa-brands fa-tiktok" style={{ fontSize: "1.25rem", margin: 0, width: 34, height: 34 }} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>
                  Video &amp; Demo TikTok
                </h3>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  Cuplikan singkat eksperimen koding, showcase bot, dan tutorial praktis.
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
          4. PUBLISHED SNIPPETS BY DEVELOPER
          ============================================================ */}
      <section>
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
            <h2 style={{ fontSize: "1.55rem", fontWeight: 800 }}>
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

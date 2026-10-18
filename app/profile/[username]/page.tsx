"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { NimzzUser, Code } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import CodeCard from "@/components/CodeCard";
import { ParallaxCampBanner, StitchedLoader } from "@/components/FieldJournalDecor";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const { adminConfig, isAdmin } = useAuth();
  const [profileData, setProfileData] = useState<NimzzUser | null>(null);
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);

  const uName = decodeURIComponent(rawUsername || "");
  const isMatchAdmin =
    uName.toLowerCase() === (adminConfig.username || config.admin.username).toLowerCase();

  const loadData = useCallback(async () => {
    try {
      if (isMatchAdmin) {
        setProfileData({
          uid: "admin",
          displayName: adminConfig.displayName || config.admin.displayName,
          username: adminConfig.username || config.admin.username,
          photoURL: adminConfig.photoURL || config.admin.photoURL,
          bio: adminConfig.bio || config.admin.bio,
          banner: adminConfig.banner || config.admin.banner,
          role: "owner",
          verified: true,
          socials: adminConfig.socials || config.admin.socials,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const res = await fetch(`/api/codes?authorUsername=${encodeURIComponent(uName)}`);
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
  }, [uName, isMatchAdmin, adminConfig]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", paddingTop: 14 }}>
        <StitchedLoader label={`Memuat Profil @${uName}...`} code="[PROFILE.SYNC]" count={2} />
      </div>
    );
  }

  const activeProfile =
    profileData ||
    (isMatchAdmin
      ? {
          displayName: adminConfig.displayName || config.admin.displayName,
          username: adminConfig.username || config.admin.username,
          bio: adminConfig.bio || config.admin.bio,
          photoURL: adminConfig.photoURL || config.admin.photoURL,
          banner: adminConfig.banner || config.admin.banner,
          role: "owner",
          socials: adminConfig.socials || config.admin.socials,
        }
      : null);

  if (!activeProfile) {
    return (
      <div className="empty-state">
        <i className="fa-solid fa-user-slash" />
        <h3>Profil Tidak Ditemukan</h3>
        <p>Pengguna dengan username @{uName} tidak ditemukan.</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/" className="btn btn-primary">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const totalViews = codes.reduce((a, c) => a + (c.views || 0), 0);
  const socials = activeProfile.socials || adminConfig.socials || {};

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingTop: 14 }}>
      {/* Profile Card with Washi Tape, 60fps Parallax Banner, and Tilted Polaroid Frame */}
      <div
        style={{
          position: "relative",
          background: "var(--surface)",
          border: "var(--border-w) solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          marginBottom: "28px",
          overflow: "visible",
        }}
      >
        <div className="washi-tape" />

        <div style={{ borderRadius: "calc(var(--radius) - 3px)", overflow: "hidden" }}>
          <ParallaxCampBanner
            imageUrl={activeProfile.banner || undefined}
            height={200}
            stampLeft={`USER.LOG // @${activeProfile.username.toUpperCase()}`}
            stampRight={`${codes.length} SNIPPET • ${totalViews} DIBACA`}
          />

          <div style={{ padding: "0 24px 24px", position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
                position: "relative",
                zIndex: 10,
              }}
            >
              {/* Tilted Polaroid Frame — only the avatar overlaps the banner */}
              <div
                className="polaroid-frame"
                style={{
                  marginTop: -54,
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
                    borderRadius: 2,
                    border: "1.5px solid var(--border)",
                    background: "var(--surface-alt)",
                    overflow: "hidden",
                  }}
                >
                  {activeProfile.photoURL ? (
                    <Image
                      quality={95}
                      src={activeProfile.photoURL}
                      alt={activeProfile.displayName}
                      width={208}
                      height={208}
                      unoptimized={activeProfile.photoURL.startsWith("data:")}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.2rem",
                        fontWeight: 800,
                      }}
                    >
                      {(activeProfile.displayName || "A")[0]}
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && isMatchAdmin && (
                <div style={{ paddingTop: 12 }}>
                  <Link href="/dashboard" className="btn btn-sm btn-yellow">
                    <i className="fa-solid fa-pen" /> Edit Profil
                  </Link>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.55rem", fontWeight: 700 }}>
                <span className="text-laidback">{activeProfile.displayName}</span>
              </h1>
              <span className="inline-stamp-pill">
                <i className="fa-solid fa-crown" /> ADMIN
              </span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "var(--ink-muted)",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              @{activeProfile.username}
            </div>

            {activeProfile.bio && (
              <p
                style={{
                  color: "var(--ink)",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  maxWidth: 640,
                  lineHeight: 1.55,
                  marginBottom: 14,
                }}
              >
                {activeProfile.bio}
              </p>
            )}

            <hr className="stitch-divider" />

            {/* Social Links */}
            <div className="socials-cluster">
              {socials.whatsapp && (
                <a href={socials.whatsapp} target="_blank" rel="noreferrer" className="social-btn social-btn-wa">
                  <i className="fa-brands fa-whatsapp" /> WhatsApp Channel
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
          </div>
        </div>
      </div>

      {/* Snippets by User */}
      <div className="section-head" style={{ marginBottom: 16 }}>
        <div>
          <h2>
            <i className="fa-solid fa-code" style={{ color: "var(--accent)" }} />
            Catatan Kode oleh <span className="text-laidback">{activeProfile.displayName}</span>
          </h2>
          <p>{codes.length} snippet dipublikasikan</p>
        </div>
      </div>

      {codes.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-folder-open" />
          <h3>Belum Ada Kode</h3>
          <p>Pengguna ini belum mempublikasikan snippet kode.</p>
        </div>
      ) : (
        <div className="snippets-grid" style={{ paddingTop: 8 }}>
          {codes.map((c) => (
            <CodeCard key={c.id} code={c} />
          ))}
        </div>
      )}
    </div>
  );
}

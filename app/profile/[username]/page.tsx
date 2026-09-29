"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { NimzzUser, Code } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";
import CodeCard from "@/components/CodeCard";
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
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="skeleton" style={{ height: 180 }} />
        <div className="skeleton" style={{ height: 100 }} />
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
    <div style={{ maxWidth: 960, margin: "0 auto", paddingTop: 10 }}>
      {/* Banner */}
      <div className="profile-banner-wrap">
        {activeProfile.banner && (
          <Image
            src={activeProfile.banner}
            alt="Banner"
            fill
            unoptimized={activeProfile.banner.startsWith("data:")}
            style={{ objectFit: "cover" }}
          />
        )}
        <div className="profile-avatar-pin">
          <div className="avatar-lg" style={{ background: "var(--yellow)" }}>
            {activeProfile.photoURL ? (
              <Image
                src={activeProfile.photoURL}
                alt={activeProfile.displayName}
                width={80}
                height={80}
                unoptimized={activeProfile.photoURL.startsWith("data:")}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              <span>{(activeProfile.displayName || "A")[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "var(--border-w) solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          padding: "24px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 800 }}>{activeProfile.displayName}</h1>
              <span className="category-badge" style={{ background: "var(--yellow)" }}>
                <i className="fa-solid fa-crown" style={{ fontSize: "0.68rem" }} />
                Admin
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 700 }}>
              @{activeProfile.username}
            </div>
            {activeProfile.bio && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600, maxWidth: 620, lineHeight: 1.5, marginBottom: 12 }}>
                {activeProfile.bio}
              </p>
            )}

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

          {isAdmin && (
            <Link href="/dashboard" className="btn btn-sm btn-yellow">
              <i className="fa-solid fa-pen" /> Edit Banner / Avatar
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="stats-row" style={{ marginTop: 22, marginBottom: 0 }}>
          <div className="stat-card" style={{ padding: "14px 18px" }}>
            <div className="num" style={{ fontSize: "1.4rem" }}>{codes.length}</div>
            <div className="lbl">Code Dipublish</div>
          </div>
          <div className="stat-card" style={{ padding: "14px 18px" }}>
            <div className="num" style={{ fontSize: "1.4rem", color: "var(--success)" }}>{totalViews}</div>
            <div className="lbl">Total Views</div>
          </div>
        </div>
      </div>

      {/* Code List */}
      <div className="section-head" style={{ marginBottom: 18 }}>
        <h2>
          <i className="fa-solid fa-code" style={{ color: "var(--blue)" }} />
          Code oleh {activeProfile.displayName}
        </h2>
      </div>

      {codes.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-inbox" />
          <h3>Belum Ada Code</h3>
          <p>Belum ada code yang dipublikasikan oleh akun ini.</p>
        </div>
      ) : (
        <div className="snippets-grid">
          {codes.map((code) => (
            <CodeCard key={code.id} code={code} />
          ))}
        </div>
      )}
    </div>
  );
}

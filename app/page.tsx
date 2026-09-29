"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Code, SUPPORTED_LANGUAGES } from "@/lib/types";
import { config } from "@/lib/config";
import { useRealtimeCategories } from "@/lib/categories";
import CodeCard from "@/components/CodeCard";

export default function HomePage() {
  const { categories } = useRealtimeCategories();
  const [recentCodes, setRecentCodes] = useState<Code[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  const fetchRecentCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/codes?limit=6");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setRecentCodes(json.data);
        }
      }
    } catch {
      setRecentCodes([]);
    } finally {
      setLoadingCodes(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentCodes();
    // Poll every 6 seconds to show newly published codes smoothly
    const interval = setInterval(fetchRecentCodes, 6000);
    return () => clearInterval(interval);
  }, [fetchRecentCodes]);

  const featuredLanguages = [
    { name: "JavaScript", icon: "fa-brands fa-js", color: "#F7DF1E" },
    { name: "TypeScript", icon: "fa-solid fa-code", color: "#3178C6" },
    { name: "Python", icon: "fa-brands fa-python", color: "#3776AB" },
    { name: "PHP", icon: "fa-brands fa-php", color: "#777BB4" },
    { name: "Go", icon: "fa-solid fa-cube", color: "#00ADD8" },
    { name: "Rust", icon: "fa-solid fa-gear", color: "#DEA584" },
    { name: "HTML/CSS", icon: "fa-brands fa-html5", color: "#E34F26" },
    { name: "Bash/Shell", icon: "fa-solid fa-terminal", color: "#4EAA25" },
    { name: "SQL", icon: "fa-solid fa-database", color: "#00758F" },
    { name: "JSON", icon: "fa-solid fa-brackets-curly", color: "#CBCB41" },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingTop: 10, paddingBottom: 40 }}>
      {/* Hero / Introduction Header */}
      <section className="hero" style={{ marginBottom: 32, padding: "40px 16px 36px" }}>
        <h1>
          Selamat Datang di <span className="grad">{config.websiteName}</span>
        </h1>
        <p style={{ maxWidth: 660, margin: "0 auto 24px" }}>
          {config.description}
        </p>

        {/* Clean exploratory actions */}
        <div className="hero-actions">
          <Link href="/search" className="btn btn-primary">
            <i className="fa-solid fa-magnifying-glass" /> Jelajahi Koleksi Kode
          </Link>
          <Link href="/publish" className="btn btn-yellow">
            <i className="fa-solid fa-plus" /> Publikasikan Kode
          </Link>
          <Link href="/owner" className="btn btn-secondary">
            <i className="fa-solid fa-user-astronaut" /> Profil Developer
          </Link>
        </div>
      </section>

      {/* Code Collection Section */}
      <section className="section" style={{ paddingTop: 0, marginBottom: 36 }}>
        <div className="section-head" style={{ marginBottom: 16 }}>
          <div>
            <h2>
              <i className="fa-solid fa-code" style={{ color: "var(--yellow)" }} /> Snippet Kode Terbaru
            </h2>
            <p>
              {loadingCodes
                ? "Memuat koleksi kode..."
                : recentCodes.length === 0
                ? "Belum ada kode yang dipublikasikan."
                : `Menampilkan ${recentCodes.length} snippet kode aktif.`}
            </p>
          </div>
          {recentCodes.length > 0 && (
            <Link href="/search" className="btn btn-sm btn-outline">
              Lihat Semua ({recentCodes.length}) <i className="fa-solid fa-arrow-right" />
            </Link>
          )}
        </div>

        {loadingCodes ? (
          <div className="snippets-grid">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="skeleton skeleton-card" />
              ))}
          </div>
        ) : recentCodes.length === 0 ? (
          <div className="empty-state" style={{ padding: "36px 20px" }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: "2.8rem", color: "var(--yellow)" }} />
            <h3>Belum Ada Snippet Kode</h3>
            <p style={{ maxWidth: 520, margin: "0 auto 16px" }}>
              Koleksi kode saat ini masih kosong. Jadilah yang pertama membagikan modul, script, atau snippet kode ke komunitas!
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/publish" className="btn btn-primary">
                <i className="fa-solid fa-plus" /> Publikasikan Kode Pertama
              </Link>
              <Link href="/request" className="btn btn-secondary">
                <i className="fa-solid fa-clipboard-question" /> Ajukan Request Kode
              </Link>
            </div>
          </div>
        ) : (
          <div className="snippets-grid">
            {recentCodes.map((code) => (
              <CodeCard key={code.id} code={code} />
            ))}
          </div>
        )}
      </section>

      {/* Purpose & Mission Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <h2>
              <i className="fa-solid fa-compass" style={{ color: "var(--blue)" }} />
              Tentang & Tujuan Platform
            </h2>
            <p>Mengenal fungsi utama dan cara menggunakan {config.websiteName}.</p>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <i className="fa-solid fa-code" />
            <h3>Berbagi Snippet Kode</h3>
            <p>
              Menyediakan repositori kode siap pakai untuk berbagai kebutuhan pengembangan perangkat lunak,
              mulai dari script otomatisasi, handler bot, hingga template integrasi API.
            </p>
          </div>

          <div className="feature-card">
            <i className="fa-solid fa-terminal" />
            <h3>Tampilan ala Visual Studio Code</h3>
            <p>
              Setiap potongan kode disajikan dengan editor ala VS Code yang elegan, nomor baris rapi,
              pewarnaan syntax highlighting akurat, tombol salin instan, dan preview cepat.
            </p>
          </div>

          <div className="feature-card">
            <i className="fa-solid fa-magnifying-glass" />
            <h3>Pencarian Fleksibel</h3>
            <p>
              Pengguna dapat mencari kode berdasarkan judul, tag, bahasa pemrograman, maupun kategori
              secara langsung melalui halaman pencarian khusus.
            </p>
          </div>

          <div className="feature-card">
            <i className="fa-solid fa-lightbulb" />
            <h3>Permintaan Kode Terbuka</h3>
            <p>
              Membutuhkan solusi atau implementasi fungsi tertentu? Pengguna dapat mengajukan ide atau
              permintaan modul kode baru melalui formulir request.
            </p>
          </div>
        </div>
      </section>

      {/* Categories & Languages Overview */}
      <section className="section">
        <div className="section-head">
          <div>
            <h2>
              <i className="fa-solid fa-layer-group" style={{ color: "var(--green)" }} />
              Kategori & Bahasa Pemrograman
            </h2>
            <p>Jelajahi berbagai kategori kode dan bahasa pemrograman populer.</p>
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "var(--border-w) solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: "24px 26px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
              Kategori Aktif ({categories.length})
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>
              <i className="fa-solid fa-tags" style={{ color: "var(--yellow)", marginRight: 4 }} />
              Semua Topik
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat)}`}
                className="category-badge"
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                <i className="fa-solid fa-folder-open" style={{ fontSize: "0.75rem" }} />
                {cat}
              </Link>
            ))}
          </div>

          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 12 }}>
            Bahasa Pemrograman yang Didukung ({SUPPORTED_LANGUAGES.length} Bahasa)
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {featuredLanguages.map((l) => (
              <Link
                key={l.name}
                href={`/search?q=${encodeURIComponent(l.name.toLowerCase())}`}
                className="tag-pill"
                style={{
                  padding: "6px 12px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                }}
              >
                <i className={l.icon} style={{ color: l.color }} />
                <span>{l.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

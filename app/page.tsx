"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Code, SUPPORTED_LANGUAGES } from "@/lib/types";
import { config } from "@/lib/config";
import { useRealtimeCategories } from "@/lib/categories";
import CodeCard from "@/components/CodeCard";
import {
  TiltedScratchpadWindow,
  MustardDividerStrip,
  StitchedLoader,
} from "@/components/FieldJournalDecor";
import { fileNameFor } from "@/lib/code-utils";

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
    const interval = setInterval(fetchRecentCodes, 6000);
    return () => clearInterval(interval);
  }, [fetchRecentCodes]);

  const featuredSnippet = recentCodes[0];
  const showcaseFilename = featuredSnippet ? fileNameFor(featuredSnippet) : "hello-world.js";
  const showcaseLines = featuredSnippet?.code
    ? featuredSnippet.code.split("\n").slice(0, 8)
    : undefined;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      {/* ============================================================
          1. OPEN CANVAS HERO (High Whitespace, 1 Focal Marker, Tilted Window)
          ============================================================ */}
      <section className="scratch-hero-section">
        <div className="scratch-hero-grid">
          {/* Left Column: Restrained Status + Bold Tight Headline + Monospace Sub */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            {/* Max 1 status indicator above the headline */}
            <div className="scratch-status-line" style={{ marginBottom: 18 }}>
              <span className="scratch-status-dot" />
              <span>THE INTERNET&apos;S SCRATCHPAD // {config.websiteName.toUpperCase()}</span>
            </div>

            {/* Bold tight display typography with ONLY 1 bottom marker highlight */}
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(2.35rem, 5.2vw, 4.1rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 0.96,
                marginBottom: 22,
                color: "var(--ink)",
              }}
            >
              Simpan, bagikan, &amp; temukan{" "}
              <span className="marker-under">snippet kode</span> siap pakai.
            </h1>

            {/* Monospace technical description paragraph */}
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: "var(--ink-muted)",
                maxWidth: 520,
                marginBottom: 28,
              }}
            >
              {config.description} Dirancang dengan kanvas terbuka yang bersih, viewer VS Code,
              pencarian instan <code>Ctrl+K</code>, serta akses REST API publik tanpa ribet.
            </p>

            {/* Crisp Sharp-Cornered Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: "100%" }}>
              <Link href="/search" className="btn btn-primary">
                JELAJAHI KODE →
              </Link>
              <Link href="/bookmarks" className="btn btn-yellow">
                ✳ BOOKMARKS
              </Link>
              <Link href="/request" className="btn">
                AJUKAN REQUEST
              </Link>
            </div>
          </div>

          {/* Right Column: The 1 Tilted Code Showcase Window (-1.2deg) with 2 Corner Sticky Notes */}
          <div>
            <TiltedScratchpadWindow
              filename={showcaseFilename}
              statusLabel="● PUBLIC"
              stickerTopLeft={
                featuredSnippet
                  ? `LATEST // ${(featuredSnippet.language || "CODE").toUpperCase()}`
                  : "SNIPPET // READY TO COPY"
              }
              stickerBottomRight="ZERO CONFIG ✳ INSTANT RAW"
              codeLines={showcaseLines}
              slug={featuredSnippet?.slug}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          2. FULL-WIDTH MUSTARD MARQUEE / DIVIDER STRIP
          ============================================================ */}
      <MustardDividerStrip
        items={[
          `${recentCodes.length} SNIPPET AKTIF`,
          `${categories.length} KATEGORI`,
          `${SUPPORTED_LANGUAGES.length} BAHASA PEMROGRAMAN`,
          "VS CODE SYNTAX VIEWER",
          "CTRL+K QUICK JUMP",
          "PUBLIC JSON & RAW API",
        ]}
      />

      {/* ============================================================
          3. RECENT SNIPPETS ON OPEN CANVAS
          ============================================================ */}
      <section className="section" style={{ paddingTop: 48, paddingBottom: 36 }}>
        <div className="section-head" style={{ marginBottom: 24 }}>
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
              ✳ DIRECTORY // LATEST UPLOADS
            </div>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
              }}
            >
              Catatan &amp; <span className="marker-under">Snippet Terbaru</span>
            </h2>
          </div>

          {recentCodes.length > 0 && (
            <Link href="/search" className="btn btn-sm">
              LIHAT SEMUA ({recentCodes.length}) →
            </Link>
          )}
        </div>

        {loadingCodes ? (
          <StitchedLoader label="Memuat Koleksi Snippet Terbaru..." code="[SYS.LOADING]" count={3} />
        ) : recentCodes.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <i className="fa-solid fa-inbox" />
            <h3>Belum Ada Snippet Kode</h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.84rem", maxWidth: 500, margin: "0 auto 18px" }}>
              Koleksi kode saat ini masih kosong. Publikasikan modul atau ajukan request baru.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/publish" className="btn btn-primary">
                + PUBLIKASIKAN KODE
              </Link>
              <Link href="/request" className="btn">
                AJUKAN REQUEST
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

      {/* ============================================================
          4. RESTRAINED FEATURE BLOCKS & CATEGORY INDEX ON OPEN CANVAS
          ============================================================ */}
      <section className="section" style={{ paddingTop: 20, paddingBottom: 48 }}>
        <div className="section-head" style={{ marginBottom: 24 }}>
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
              ✳ ARCHITECTURE // BUILT FOR MAKERS
            </div>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 2.8vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
              }}
            >
              Kenapa Pakai <span className="marker-under">{config.websiteName}</span>?
            </h2>
          </div>
        </div>

        <div className="features-grid" style={{ marginBottom: 36 }}>
          <div className="feature-card">
            <div className="camp-stamp" style={{ marginBottom: 12, background: "var(--mustard)" }}>
              01 // REPOSITORY
            </div>
            <h3>Snippet Siap Pakai</h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
              Kumpulan script otomatisasi, handler bot, dan utilitas produksi yang langsung siap disalin.
            </p>
          </div>

          <div className="feature-card">
            <div className="camp-stamp" style={{ marginBottom: 12, background: "var(--sage-note)" }}>
              02 // WORKFLOW
            </div>
            <h3>VS Code Viewer &amp; Ctrl+K</h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
              Syntax highlighting presisi, mode layar penuh, word-wrap otomatis di HP, dan navigasi kilat.
            </p>
          </div>

          <div className="feature-card">
            <div className="camp-stamp" style={{ marginBottom: 12, background: "var(--rose-note)" }}>
              03 // PORTABLE
            </div>
            <h3>Bookmark &amp; Export JSON</h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
              Simpan kode favorit ke browser tanpa login dan ekspor seluruh koleksimu ke file JSON.
            </p>
          </div>
        </div>

        {/* Clean Category Index Strip */}
        <div
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "2px",
            boxShadow: "var(--shadow)",
            padding: "22px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              ✳ INDEKS KATEGORI AKTIF ({categories.length})
            </span>
            <Link
              href="/search"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textDecoration: "underline",
              }}
            >
              CARI BERDASARKAN BAHASA →
            </Link>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat)}`}
                className="camp-stamp"
                style={{
                  padding: "6px 12px",
                  fontSize: "0.78rem",
                  background: "var(--surface-alt)",
                }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";
import React from "react";
import Link from "next/link";

/**
 * 1. StitchedLoader — Clean Scratchpad Loading State
 */
export function StitchedLoader({
  label = "Memuat Data Snippet...",
  code = "[SYS.LOADING]",
  count = 3,
}: {
  label?: string;
  code?: string;
  count?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="loading-stitched">
        <div className="loading-stitched-badge">
          <span>✳</span>
          <span>{code}</span>
          <span>•</span>
          <span>{label}</span>
        </div>
        <div className="stitch-divider" style={{ margin: "12px 0" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="loading-stitched-slot">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="camp-stamp">FILE #{String(idx + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  ● PUBLIC
                </span>
              </div>
              <div
                style={{
                  height: 11,
                  width: "75%",
                  background: "var(--bg-canvas)",
                  border: "1px solid var(--border)",
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  height: 9,
                  width: "48%",
                  background: "var(--bg-canvas)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 2. TiltedScratchpadWindow — Satu-satunya elemen yang miring (-1.2deg)
 *    Memiliki header bar seperti jendela editor (hello-world.js di tengah, status ● PUBLIC di kanan)
 *    serta 1 stiker sudut di kiri atas (#cbb340) dan 1 stiker sudut di kanan bawah (#cfa5b4).
 */
export function TiltedScratchpadWindow({
  filename = "hello-world.js",
  statusLabel = "● PUBLIC",
  stickerTopLeft = "SNIPPET // READY TO COPY",
  stickerBottomRight = "ZERO CONFIG ✳ RAW API",
  codeLines = [
    "import { fetchSnippet } from '@nimzz/scratchpad';",
    "",
    "export async function runModule() {",
    "  const mod = await fetchSnippet('hello-world');",
    "  console.log('✳ Loaded:', mod.title, mod.language);",
    "  return mod.execute({ mode: 'production' });",
    "}",
  ],
  slug,
}: {
  filename?: string;
  statusLabel?: string;
  stickerTopLeft?: string;
  stickerBottomRight?: string;
  codeLines?: string[];
  slug?: string;
}) {
  return (
    <div className="scratch-window-wrap">
      {/* Top-Left Corner Sticky Note (#cbb340) */}
      <div className="scratch-sticker-tl">{stickerTopLeft}</div>

      {/* Tilted Editor Window (-1.2deg) */}
      <div className="scratch-window">
        <div className="scratch-window-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #141413", background: "#e6e3da", display: "inline-block" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #141413", background: "#cbb340", display: "inline-block" }} />
          </div>

          <span style={{ letterSpacing: "0.04em" }}>{filename}</span>

          <span style={{ color: "#2d6a4f", fontWeight: 700, fontSize: "10px", letterSpacing: "0.06em" }}>
            {statusLabel}
          </span>
        </div>

        <div
          style={{
            background: "#141413",
            color: "#f2efe9",
            padding: "16px 16px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.78rem",
            lineHeight: 1.65,
            overflowX: "auto",
          }}
        >
          {codeLines.slice(0, 8).map((line, i) => (
            <div key={i} style={{ display: "flex", gap: 12, whiteSpace: "pre" }}>
              <span style={{ color: "#6e6b64", userSelect: "none", minWidth: 16, textAlign: "right" }}>
                {i + 1}
              </span>
              <span style={{ color: line.trim().startsWith("//") ? "#8eb897" : "#f2efe9" }}>
                {line || " "}
              </span>
            </div>
          ))}
        </div>

        {slug && (
          <div
            style={{
              padding: "8px 12px",
              background: "var(--surface)",
              borderTop: "1.5px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "10.5px",
            }}
          >
            <span style={{ color: "var(--ink-muted)" }}>FEATURED SCRATCHPAD</span>
            <Link
              href={`/code/${slug}`}
              style={{ fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              BUKA FILE →
            </Link>
          </div>
        )}
      </div>

      {/* Bottom-Right Corner Sticky Note (#cfa5b4) */}
      <div className="scratch-sticker-br">{stickerBottomRight}</div>
    </div>
  );
}

/**
 * 3. MustardDividerStrip — Infinite Horizontal Looping Marquee Strip
 *    Berjalan loop ke samping terus-menerus dengan simbol ✳.
 */
export function MustardDividerStrip({
  items = [
    "OPEN SNIPPET REPOSITORY",
    "VS CODE SYNTAX VIEWER",
    "CTRL+K QUICK JUMP",
    "PUBLIC JSON & RAW API",
    "INSTANT BOOKMARKS",
    "RAW & MARKDOWN EXPORT",
  ],
}: {
  items?: string[];
}) {
  // Duplicate items 4x so the track is always wider than ultrawide screens and loops seamlessly (-50%)
  const loopGroup = [...items, ...items];

  return (
    <div className="mustard-strip" role="region" aria-label="Fitur Utama">
      <div className="mustard-strip-track">
        {[0, 1].map((halfIdx) => (
          <div
            key={halfIdx}
            className="mustard-strip-group"
            aria-hidden={halfIdx === 1 ? "true" : undefined}
          >
            {loopGroup.map((item, idx) => (
              <React.Fragment key={`${halfIdx}-${idx}`}>
                <span>{item}</span>
                <span className="mustard-star" aria-hidden="true">
                  ✳
                </span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 4. ParallaxCampBanner — Clean Studio Profile Header Banner with Custom Image Support
 */
export function ParallaxCampBanner({
  imageUrl,
  height = 220,
  stampLeft = "STUDIO // PROFILE",
  stampRight = "● VERIFIED",
  children,
}: {
  imageUrl?: string;
  height?: number;
  stampLeft?: string;
  stampRight?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="studio-banner"
      style={{
        height,
        position: "relative",
        overflow: "hidden",
        borderBottom: "1.5px solid var(--border)",
        background: "#141413",
      }}
    >
      {/* Banner Image or Architectural Blueprint Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#141413",
        }}
      >
        {!imageUrl && (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#141413",
              backgroundImage:
                "radial-gradient(circle at 82% 24%, rgba(203, 179, 64, 0.25) 0%, transparent 45%), radial-gradient(circle at 18% 80%, rgba(142, 184, 151, 0.18) 0%, transparent 45%), linear-gradient(rgba(242,239,233,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.07) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px",
            }}
          />
        )}
      </div>

      {/* Subtle Bottom Vignette so Avatar & Buttons Pop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(20,20,19,0.2) 0%, rgba(20,20,19,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Badges */}
      <div className="banner-stamps">
        <span className="camp-stamp" style={{ background: "var(--surface)", color: "#141413" }}>
          ✳ {stampLeft}
        </span>
        <span className="camp-stamp" style={{ background: "var(--mustard)", color: "#141413" }}>
          {stampRight}
        </span>
      </div>

      {children && (
        <div style={{ position: "relative", zIndex: 6, height: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}

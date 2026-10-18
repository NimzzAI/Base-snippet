"use client";
import React, { useEffect, useRef, useState } from "react";
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
          <span className="pulse-star">✳</span>
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
 * 2. TiltedScratchpadWindow — 60fps Interactive Tilted Code Showcase Window
 *    Menggunakan useRef + requestAnimationFrame untuk animasi 60fps floating & interaktif
 *    serta live active line scanner agar jendela kode terlihat hidup.
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const stickerTLRef = useRef<HTMLDivElement>(null);
  const stickerBRRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState(0);

  const displayLines = codeLines.slice(0, 8);

  // Cycle active highlighted code line to make the editor window feel alive
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLine((prev) => (prev + 1) % Math.max(1, displayLines.length));
    }, 1800);
    return () => clearInterval(timer);
  }, [displayLines.length]);

  // 60fps requestAnimationFrame physics loop for smooth floating & pointer parallax
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let animId = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    const startTime = performance.now();

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const rx = (e.clientX - rect.left) / rect.width - 0.5;
      const ry = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = Math.max(-1, Math.min(1, rx));
      targetY = Math.max(-1, Math.min(1, ry));
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    wrap.addEventListener("mousemove", onMouseMove, { passive: true });
    wrap.addEventListener("mouseleave", onMouseLeave, { passive: true });

    const tick = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      const floatY = Math.sin(elapsed * 2.1) * 3.5;
      const floatRot = Math.cos(elapsed * 1.6) * 0.35;

      curX += (targetX - curX) * 0.09;
      curY += (targetY - curY) * 0.09;

      if (windowRef.current) {
        const rot = -1.2 + floatRot + curX * 1.8;
        const tx = curX * 6;
        const ty = floatY + curY * 5;
        windowRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
      }

      if (stickerTLRef.current) {
        const sTy = Math.sin(elapsed * 2.4 + 1) * 2.2 - curY * 4;
        stickerTLRef.current.style.transform = `translate3d(${-curX * 5}px, ${sTy}px, 0) rotate(-2.2deg)`;
      }

      if (stickerBRRef.current) {
        const sBy = Math.cos(elapsed * 2.2) * 2.5 + curY * 4;
        stickerBRRef.current.style.transform = `translate3d(${curX * 5}px, ${sBy}px, 0) rotate(1.5deg)`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      wrap.removeEventListener("mousemove", onMouseMove);
      wrap.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="scratch-window-wrap">
      {/* Top-Left Corner Sticky Note (#cbb340) */}
      <div ref={stickerTLRef} className="scratch-sticker-tl" style={{ willChange: "transform" }}>
        {stickerTopLeft}
      </div>

      {/* Tilted Editor Window (-1.2deg + 60fps float) */}
      <div ref={windowRef} className="scratch-window" style={{ willChange: "transform" }}>
        <div className="scratch-window-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #141413", background: "#cfa5b4", display: "inline-block" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #141413", background: "#cbb340", display: "inline-block" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #141413", background: "#8eb897", display: "inline-block" }} />
          </div>

          <span style={{ letterSpacing: "0.04em" }}>{filename}</span>

          <span
            style={{
              color: "#2d6a4f",
              fontWeight: 700,
              fontSize: "10px",
              letterSpacing: "0.06em",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span className="live-dot-pulse" />
            {statusLabel.replace("●", "").trim()}
          </span>
        </div>

        <div
          style={{
            background: "#141413",
            color: "#f2efe9",
            padding: "14px 12px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.78rem",
            lineHeight: 1.65,
            overflowX: "auto",
          }}
        >
          {displayLines.map((line, i) => {
            const isHighlighted = i === activeLine;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  whiteSpace: "pre",
                  padding: "0 6px",
                  borderRadius: 2,
                  background: isHighlighted ? "rgba(203, 179, 64, 0.14)" : "transparent",
                  borderLeft: isHighlighted ? "2px solid #cbb340" : "2px solid transparent",
                  transition: "background 0.25s ease",
                }}
              >
                <span
                  style={{
                    color: isHighlighted ? "#cbb340" : "#6e6b64",
                    userSelect: "none",
                    minWidth: 16,
                    textAlign: "right",
                    fontWeight: isHighlighted ? 700 : 400,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: line.trim().startsWith("//") || line.trim().startsWith("*") ? "#8eb897" : "#f2efe9" }}>
                  {line || " "}
                  {isHighlighted && <span className="cursor-blink">▋</span>}
                </span>
              </div>
            );
          })}
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
      <div ref={stickerBRRef} className="scratch-sticker-br" style={{ willChange: "transform" }}>
        {stickerBottomRight}
      </div>
    </div>
  );
}

/**
 * 3. MustardDividerStrip — Full-Bleed Edge-to-Edge 60fps Infinite Marquee Strip
 *    Membentang penuh dari ujung kiri ke ujung kanan layar dan berjalan mulus 60fps.
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
  const loopGroup = [...items, ...items, ...items];

  return (
    <div className="mustard-strip-fullbleed" role="region" aria-label="Fitur Utama">
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
 * 4. ParallaxCampBanner — 60fps Interactive Studio Profile Banner (useRef + requestAnimationFrame + Canvas)
 */
export function ParallaxCampBanner({
  imageUrl,
  height = 230,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    let animId = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const resize = () => {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth || 800;
      canvas.height = container.clientHeight || height;
    };
    resize();
    window.addEventListener("resize", resize);

    const palette = ["#cbb340", "#cfa5b4", "#8eb897", "#f2efe9"];
    const particles = Array.from({ length: 24 }, (_, i) => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || height),
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(0.25 + Math.random() * 0.45),
      r: 2 + (i % 3) * 1.3,
      alpha: 0.45 + Math.random() * 0.4,
      color: palette[i % palette.length],
    }));

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (e.clientX - rect.left) / rect.width - 0.5));
      targetY = Math.max(-1, Math.min(1, (e.clientY - rect.top) / rect.height - 0.5));
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    container.addEventListener("mousemove", onMouseMove, { passive: true });
    container.addEventListener("mouseleave", onMouseLeave, { passive: true });

    const startTime = performance.now();

    const loop = (now: number) => {
      const t = (now - startTime) * 0.001;
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;

      if (bgRef.current) {
        const panX = -curX * 14 + Math.sin(t * 0.7) * 4;
        const panY = -curY * 9 + Math.cos(t * 0.5) * 3;
        bgRef.current.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(1.06)`;
      }

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
          p.x += p.vx + curX * 0.3;
          p.y += p.vy;
          if (p.y < -8) {
            p.y = canvas.height + 6;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -8) p.x = canvas.width + 6;
          if (p.x > canvas.width + 8) p.x = -6;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.strokeStyle = "#141413";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [height]);

  return (
    <div
      ref={containerRef}
      className="studio-banner"
      style={{
        height,
        position: "relative",
        overflow: "hidden",
        borderBottom: "2px solid var(--border)",
        background: "#141413",
      }}
    >
      {/* 60fps Parallax Banner Layer */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: -16,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#141413",
          willChange: "transform",
        }}
      >
        {!imageUrl && (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#141413",
              backgroundImage:
                "radial-gradient(circle at 82% 24%, rgba(203, 179, 64, 0.28) 0%, transparent 45%), radial-gradient(circle at 18% 80%, rgba(142, 184, 151, 0.22) 0%, transparent 45%), linear-gradient(rgba(242,239,233,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.07) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px",
            }}
          />
        )}
      </div>

      {/* 60fps Floating Particles Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Subtle Bottom Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(20,20,19,0.12) 0%, rgba(20,20,19,0.5) 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Top Badges */}
      <div className="banner-stamps" style={{ zIndex: 5 }}>
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

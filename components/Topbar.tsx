"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { config } from "@/lib/config";
import { useBookmarks } from "@/lib/bookmarks";
import CommandPalette from "./CommandPalette";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const [query, setQuery] = useState("");
  const [nightMode, setNightMode] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { count: bookmarkCount } = useBookmarks();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("nimzz-theme-mode");
    if (saved === "night") {
      setNightMode(true);
      document.documentElement.setAttribute("data-mode", "night");
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleNightMode = () => {
    const next = !nightMode;
    setNightMode(next);
    if (next) {
      document.documentElement.setAttribute("data-mode", "night");
      localStorage.setItem("nimzz-theme-mode", "night");
    } else {
      document.documentElement.removeAttribute("data-mode");
      localStorage.setItem("nimzz-theme-mode", "day");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      {/* A. Top Strip (#141413) with spaced uppercase monospace text & star icon (✳) */}
      <div className="scratch-top-strip">
        <span className="star">✳</span>
        <span>{config.websiteName} — THE INTERNET&apos;S CODE SCRATCHPAD</span>
        <span className="star hidden-mobile-sm">✳</span>
        <span className="hidden-mobile-sm">OPEN REPOSITORY &amp; SNIPPET INDEX</span>
        <span className="star">✳</span>
      </div>

      {/* Minimal Header blending with the Warm Putty Paper Canvas */}
      <header className="topbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {/* Hamburger Menu Button */}
          <button
            type="button"
            className="topbar-toggle"
            onClick={onToggleSidebar}
            aria-label="Buka Menu Navigasi"
            title="Buka Menu Navigasi"
          >
            <i className="fa-solid fa-bars" />
          </button>

          {/* Framed Logo Box on Mobile/Compact + Search Input */}
          <Link
            href="/"
            className="camp-stamp hidden-mobile-xs"
            style={{
              background: "var(--surface)",
              padding: "6px 10px",
              fontWeight: 800,
              fontSize: "0.76rem",
              boxShadow: "2px 2px 0px var(--border)",
              flexShrink: 0,
            }}
          >
            ✳ {config.name.toUpperCase()}
          </Link>

          <form onSubmit={handleSearch} className="topbar-search" style={{ maxWidth: 440 }}>
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cari snippet di ${config.websiteName}...`}
              aria-label="Cari snippet kode"
            />
          </form>
        </div>

        {/* Restrained Square Action Buttons on the Right */}
        <div className="topbar-actions">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="btn btn-sm topbar-action-btn"
            style={{
              background: "var(--surface)",
            }}
            title="Buka Command Palette (Ctrl+K)"
            aria-label="Command Palette"
          >
            <i className="fa-solid fa-terminal" />
            <span className="topbar-btn-label">CTRL+K</span>
          </button>

          <Link
            href="/bookmarks"
            className="btn btn-sm topbar-action-btn"
            style={{
              background: bookmarkCount > 0 ? "var(--mustard)" : "var(--surface)",
              color: bookmarkCount > 0 ? "#141413" : "var(--text)",
            }}
            title="Koleksi Snippet Tersimpan"
            aria-label="Bookmark"
          >
            <i className="fa-solid fa-bookmark" />
            <span>{bookmarkCount}</span>
          </Link>

          <button
            type="button"
            onClick={toggleNightMode}
            className="btn btn-sm topbar-action-btn"
            style={{
              background: nightMode ? "var(--mustard)" : "var(--surface)",
              color: nightMode ? "#141413" : "var(--text)",
            }}
            title="Ubah Mode Kertas / Gelap"
            aria-label="Ubah Tema"
          >
            <i className={`fa-solid ${nightMode ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </header>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

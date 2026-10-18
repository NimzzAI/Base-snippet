"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Code } from "@/lib/types";
import { useBookmarks } from "@/lib/bookmarks";

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { count: bookmarkCount } = useBookmarks();
  const [query, setQuery] = useState("");
  const [codes, setCodes] = useState<Code[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 40);

    fetch("/api/codes")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.ok && Array.isArray(json.data)) {
          setCodes(json.data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const items = useMemo(() => {
    const quickActions = [
      {
        id: "nav-home",
        title: "Ke Beranda Utama",
        subtitle: "Halaman depan & Indeks Snippet",
        icon: "fa-house",
        badge: "HALAMAN",
        action: () => router.push("/"),
      },
      {
        id: "nav-search",
        title: "Jelajahi Semua Snippet Kode",
        subtitle: "Cari dan filter seluruh kode berdasarkan bahasa & kategori",
        icon: "fa-magnifying-glass",
        badge: "PENCARIAN",
        action: () => router.push("/search"),
      },
      {
        id: "nav-bookmarks",
        title: `Koleksi Tersimpan (${bookmarkCount})`,
        subtitle: "Buka daftar snippet favorit yang kamu simpan di browser",
        icon: "fa-bookmark",
        badge: "BOOKMARK",
        action: () => router.push("/bookmarks"),
      },
      {
        id: "nav-request",
        title: "Request Modul / Script Baru",
        subtitle: "Kirim permintaan fitur atau potongan kode ke Admin",
        icon: "fa-clipboard-question",
        badge: "REQUEST",
        action: () => router.push("/request"),
      },
      {
        id: "nav-api",
        title: "Dokumentasi REST API Publik",
        subtitle: "Coba endpoint JSON & raw code tanpa API key",
        icon: "fa-plug",
        badge: "API v1",
        action: () => router.push("/api-docs"),
      },
      {
        id: "nav-owner",
        title: "Profil Developer & Tautan Resmi",
        subtitle: "Informasi pengembang, tech stack, dan saluran komunitas",
        icon: "fa-user-astronaut",
        badge: "OWNER",
        action: () => router.push("/owner"),
      },
    ];

    const q = query.trim().toLowerCase();

    const matchingCodes = codes
      .filter(
        (c) =>
          !q ||
          c.title?.toLowerCase().includes(q) ||
          c.language?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map((c) => ({
        id: `code-${c.id}`,
        title: c.title,
        subtitle: `${c.category || "Tools"} • ${(c.language || "code").toUpperCase()}`,
        icon: "fa-file-code",
        badge: (c.language || "CODE").toUpperCase(),
        action: () => router.push(`/code/${c.slug}`),
      }));

    const matchingActions = quickActions.filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.badge.toLowerCase().includes(q)
    );

    return [...matchingCodes, ...matchingActions];
  }, [codes, query, bookmarkCount, router]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length ? (prev - 1 + items.length) % items.length : 0));
      } else if (e.key === "Enter" && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].action();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="preview-backdrop"
      onClick={onClose}
      style={{ zIndex: 99990, alignItems: "flex-start", paddingTop: "8vh" }}
    >
      <div
        className="preview-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 620, width: "100%", overflow: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px",
            borderBottom: "var(--border-w-sm) solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <i className="fa-solid fa-terminal" style={{ color: "var(--blue)", fontSize: "1rem" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik judul kode, bahasa, atau menu navigasi..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--text)",
              fontFamily: "var(--font)",
              fontSize: "0.95rem",
              fontWeight: 700,
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="camp-stamp"
            style={{ cursor: "pointer" }}
          >
            ESC
          </button>
        </div>

        <div style={{ maxHeight: "58vh", overflowY: "auto", padding: 10, background: "var(--bg)" }}>
          {items.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-muted)", fontWeight: 700 }}>
              Tidak ditemukan hasil untuk &ldquo;{query}&rdquo;
            </div>
          ) : (
            items.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    marginBottom: 4,
                    borderRadius: 2,
                    border: active ? "1.5px solid var(--border)" : "1.5px solid transparent",
                    background: active ? "var(--yellow)" : "var(--surface)",
                    color: active ? "#000" : "var(--text)",
                    boxShadow: active ? "2px 2px 0px var(--border)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 2,
                        border: "1.5px solid var(--border)",
                        background: active ? "#FFF" : "var(--bg-2)",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className={`fa-solid ${item.icon}`} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.76rem",
                          opacity: 0.8,
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className="camp-stamp"
                    style={{
                      background: active ? "#FFF" : "var(--bg-2)",
                      color: "#000",
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderTop: "var(--border-w-sm) solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.72rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            fontWeight: 700,
          }}
        >
          <span>↑↓ Navigasi • ENTER Buka • ESC Tutup</span>
          <span>CTRL + K</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

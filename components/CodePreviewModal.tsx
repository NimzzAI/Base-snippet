"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Code } from "@/lib/types";
import { Avatar } from "./CodeCard";
import { toast } from "./ToastProvider";
import VSCodeViewer from "./VSCodeViewer";
import { fileNameFor, validThumbnail } from "@/lib/code-utils";
import { useBookmarks } from "@/lib/bookmarks";

interface CodePreviewModalProps {
  code: Code;
  onClose: () => void;
}

export default function CodePreviewModal({ code, onClose }: CodePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "info">("code");
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const thumb = validThumbnail(code.thumbnail);
  const saved = isBookmarked(code.slug);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.code || "");
    setCopied(true);
    toast("Kode berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = () => {
    const nowSaved = toggleBookmark(code.slug);
    toast(
      nowSaved ? "Snippet disimpan ke Bookmark!" : "Snippet dihapus dari Bookmark",
      nowSaved ? "success" : "info"
    );
  };

  const fileName = fileNameFor(code);
  const lineCount = (code.code || "").split("\n").length;

  if (!mounted) return null;

  return createPortal(
    <div
      className="preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${code.title}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="preview-sheet">
        {/* Mobile Bottom-Sheet Pull Handle */}
        <div className="preview-pull-handle" aria-hidden="true">
          <span />
        </div>

        {/* Header */}
        <div className="preview-head">
          <div className="preview-head-main">
            <div className="preview-badges">
              <span className="camp-stamp">
                <i className="fa-solid fa-folder-open" style={{ color: "var(--accent)", marginRight: 5 }} />
                {code.category || "General"}
              </span>
              <span
                className="camp-stamp"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                {(code.language || "code").toUpperCase()}
              </span>
              <span className="camp-stamp">
                <i className="fa-solid fa-bars-staggered" style={{ marginRight: 4 }} />
                {lineCount} baris
              </span>
            </div>
            <h2 className="preview-title">{code.title}</h2>
          </div>

          <button type="button" onClick={onClose} aria-label="Tutup Preview" className="preview-close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Clean Tab Switcher (Makes Mobile Preview Super Tidy & Focused) */}
        <div className="preview-tabs-bar">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`preview-tab-btn ${activeTab === "code" ? "is-active" : ""}`}
          >
            <i className="fa-solid fa-code" />
            <span>Kode Snippet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`preview-tab-btn ${activeTab === "info" ? "is-active" : ""}`}
          >
            <i className="fa-solid fa-circle-info" />
            <span>Info & Detail</span>
            {thumb && (
              <span
                style={{
                  fontSize: "0.65rem",
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
              >
                IMG
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="preview-body">
          {activeTab === "code" ? (
            <div>
              {code.description && (
                <p
                  className="preview-desc"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginBottom: 10,
                    fontSize: "0.84rem",
                  }}
                >
                  {code.description}
                </p>
              )}

              <VSCodeViewer
                code={code.code || ""}
                language={code.language}
                filename={fileName}
                maxHeight="min(52vh, 420px)"
                showTabs={true}
                showStatusBar={true}
                showActions={true}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {thumb && (
                <div className="detail-thumb" style={{ marginBottom: 4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={`Thumbnail ${code.title}`}
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  background: "var(--bg)",
                  border: "2px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  Deskripsi Modul / Snippet
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.55, color: "var(--text)" }}>
                  {code.description || "Tidak ada deskripsi tambahan untuk snippet ini."}
                </p>
              </div>

              <div className="preview-meta" style={{ margin: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <Avatar src={code.authorAvatar} name={code.authorName} size={26} />
                  <div>
                    <div className="preview-author" style={{ color: "var(--text)", fontWeight: 800 }}>
                      {code.authorName || "Nimzz Admin"}
                    </div>
                    <div style={{ fontSize: "0.72rem" }}>File: {fileName}</div>
                  </div>
                </div>
                <span className="camp-stamp">
                  <i className="fa-regular fa-eye" style={{ marginRight: 5 }} />
                  {code.views || 0} views
                </span>
              </div>

              {code.tags && code.tags.length > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Tags Terkait
                  </div>
                  <div className="tags-row">
                    {code.tags.map((t) => (
                      <span key={t} className="camp-stamp">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="preview-actions">
          <button
            type="button"
            onClick={handleBookmark}
            className="btn btn-sm"
            style={{
              background: saved ? "var(--yellow)" : "var(--surface)",
              color: saved ? "#000" : "var(--text)",
              flex: "0 0 auto",
            }}
            title={saved ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
          >
            <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark`} />
            <span className="hidden-mobile-sm">{saved ? "Tersimpan" : "Simpan"}</span>
          </button>

          <button type="button" onClick={handleCopy} className="btn btn-secondary btn-sm">
            <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
            <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
          </button>

          <Link href={`/code/${code.slug}`} className="btn btn-primary btn-sm" onClick={onClose}>
            <i className="fa-solid fa-arrow-up-right-from-square" />
            <span>Buka Detail</span>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

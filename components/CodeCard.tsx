"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Code } from "@/lib/types";
import { toast } from "./ToastProvider";
import CodePreviewModal from "./CodePreviewModal";
import { fileNameFor, validThumbnail } from "@/lib/code-utils";
import { useBookmarks } from "@/lib/bookmarks";

export function Avatar({
  src,
  name,
  size = 24,
}: {
  src?: string;
  name: string;
  size?: number;
  radius?: number;
}) {
  const [err, setErr] = useState(false);
  const char = (name || "A")[0].toUpperCase();

  if (src && !err) {
    return (
      <div
        className="avatar-sm"
        style={{
          width: size,
          height: size,
          borderRadius: "2px",
        }}
      >
        <Image
          quality={90}
          src={src}
          alt={name}
          width={size}
          height={size}
          unoptimized={src.startsWith("data:")}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          onError={() => setErr(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="avatar-sm"
      style={{
        width: size,
        height: size,
        borderRadius: "2px",
        background: "var(--mustard)",
        color: "#141413",
      }}
    >
      {char}
    </div>
  );
}

export default function CodeCard({ code }: { code: Code }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const fileName = fileNameFor(code);
  const thumb = validThumbnail(code.thumbnail);
  const [thumbFailed, setThumbFailed] = useState(false);
  const saved = isBookmarked(code.slug);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code.code || "");
    setCopied(true);
    toast("Kode berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleBookmark(code.slug);
    toast(
      nowSaved ? "Snippet disimpan ke Bookmark!" : "Snippet dihapus dari Bookmark",
      nowSaved ? "success" : "info"
    );
  };

  return (
    <>
      <div className="snippet-card">
        {/* Top Row: Restrained Monospace Metadata & Bookmark */}
        <div className="snippet-card-top">
          <div className="badges-row">
            <span className="camp-stamp">
              {(code.language || "CODE").toUpperCase()}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--ink-muted)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              / {code.category || "General"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleBookmark}
            className="camp-stamp"
            style={{
              cursor: "pointer",
              background: saved ? "var(--mustard)" : "var(--surface)",
              color: saved ? "#141413" : "var(--text)",
              padding: "3px 8px",
            }}
            title={saved ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
            aria-label="Simpan snippet"
          >
            <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark`} />
          </button>
        </div>

        {/* Thumbnail */}
        {thumb && !thumbFailed && (
          <Link href={`/code/${code.slug}`} className="snippet-thumb" aria-label={`Buka ${code.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={`Thumbnail ${code.title}`}
              loading="lazy"
              onError={() => setThumbFailed(true)}
            />
          </Link>
        )}

        {/* Title */}
        <h3>
          <Link href={`/code/${code.slug}`}>{code.title}</Link>
        </h3>

        {/* Description */}
        {code.description && (
          <p className="snippet-desc" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
            {code.description}
          </p>
        )}

        {/* Clean Scratchpad Code Window */}
        <div
          className="code-window"
          onClick={() => setShowPreview(true)}
          style={{ cursor: "pointer" }}
          title="Klik untuk membuka preview cepat"
        >
          <div className="code-window-bar">
            <span className="filename" style={{ marginLeft: 0 }}>{fileName}</span>
            <span className="path-tag" style={{ borderRadius: 2 }}>
              ● PREVIEW
            </span>
          </div>
          <div className="code-window-body code-window-body--preview">
            {(code.code || "// no code preview")
              .split("\n")
              .slice(0, 5)
              .map((line, idx) => (
                <div key={idx} className="preview-line">
                  <span className="preview-ln">{idx + 1}</span>
                  <span className="preview-text">{line || " "}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Meta stats and Author */}
        <div className="snippet-meta" style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem" }}>
          <div className="author">
            <Avatar src={code.authorAvatar} name={code.authorName} size={20} />
            <span>{code.authorName || "Admin"}</span>
          </div>

          <div className="stat-icons">
            <span title={`${code.views || 0} views`}>
              {code.views || 0} views
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="snippet-actions">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn btn-yellow btn-sm"
            title="Preview cepat tanpa pindah halaman"
          >
            <i className="fa-solid fa-eye" /> Preview
          </button>

          <Link
            href={`/code/${code.slug}`}
            className="btn btn-primary btn-sm"
            title="Buka halaman detail lengkap"
          >
            Detail →
          </Link>

          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-sm"
            title="Salin Code"
          >
            {copied ? "Tersalin" : "Salin"}
          </button>
        </div>
      </div>

      {showPreview && (
        <CodePreviewModal
          code={code}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

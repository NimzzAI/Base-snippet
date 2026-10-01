"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Code } from "@/lib/types";
import { Avatar } from "./CodeCard";
import { toast } from "./ToastProvider";
import VSCodeViewer from "./VSCodeViewer";
import { fileNameFor, validThumbnail } from "@/lib/code-utils";

interface CodePreviewModalProps {
  code: Code;
  onClose: () => void;
}

export default function CodePreviewModal({ code, onClose }: CodePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const thumb = validThumbnail(code.thumbnail);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    // Prevent body scroll when modal is open
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

  const fileName = fileNameFor(code);

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
        <div className="preview-head">
          <div className="preview-head-main">
            <div className="preview-badges">
              <span className="category-badge">
                <i className="fa-solid fa-folder-open" style={{ fontSize: "0.68rem" }} />
                {code.category || "General"}
              </span>
              <span className="lang-badge">{code.language || "code"}</span>
            </div>
            <h2 className="preview-title">{code.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup Preview" className="preview-close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="preview-body">
          {thumb && (
            <div className="detail-thumb" style={{ marginBottom: 12 }}>
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

          {code.description && <p className="preview-desc">{code.description}</p>}

          <div className="preview-meta">
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <Avatar src={code.authorAvatar} name={code.authorName} size={22} />
              <span className="preview-author">{code.authorName || "Nimzz Admin"}</span>
            </div>
            <span>
              <i className="fa-regular fa-eye" style={{ marginRight: 4 }} />
              {code.views || 0} views
            </span>
          </div>

          <VSCodeViewer
            code={code.code || ""}
            language={code.language}
            filename={fileName}
            maxHeight="min(46vh, 380px)"
            showTabs={true}
            showStatusBar={true}
            showActions={true}
          />

          {code.tags && code.tags.length > 0 && (
            <div className="tags-row" style={{ marginTop: 12 }}>
              {code.tags.map((t) => (
                <span key={t} className="tag-pill">#{t}</span>
              ))}
            </div>
          )}
        </div>

        <div className="preview-actions">
          <button type="button" onClick={handleCopy} className="btn btn-secondary btn-sm">
            <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
            <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
          </button>
          <Link href={`/code/${code.slug}`} className="btn btn-primary btn-sm" onClick={onClose}>
            <i className="fa-solid fa-arrow-up-right-from-square" />
            <span>Halaman Lengkap</span>
          </Link>
          <button type="button" onClick={onClose} className="btn btn-sm btn-cancel">
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

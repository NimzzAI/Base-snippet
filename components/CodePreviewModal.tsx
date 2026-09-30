"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Code } from "@/lib/types";
import { Avatar } from "./CodeCard";
import { toast } from "./ToastProvider";
import VSCodeViewer from "./VSCodeViewer";

interface CodePreviewModalProps {
  code: Code;
  onClose: () => void;
}

export default function CodePreviewModal({ code, onClose }: CodePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.code || "");
    setCopied(true);
    toast("Kode berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const fileName = `${code.slug || "snippet"}.${
    code.language === "javascript"
      ? "js"
      : code.language === "typescript"
      ? "ts"
      : code.language === "python"
      ? "py"
      : code.language === "css"
      ? "css"
      : "txt"
  }`;

  return (
    <div
      className="confirm-backdrop is-open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        zIndex: 10000,
        padding: "16px",
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="confirm-card"
        style={{
          maxWidth: 820,
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          padding: "20px 22px 18px",
          overflow: "hidden",
          borderRadius: "16px",
          border: "3px solid #000",
          boxShadow: "8px 8px 0px #000",
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
              <span className="category-badge">
                <i className="fa-solid fa-folder-open" style={{ fontSize: "0.68rem" }} />
                {code.category || "General"}
              </span>
              <span className="lang-badge">{code.language || "code"}</span>
              <span
                className="category-badge"
                style={{ background: "var(--yellow)", color: "#000" }}
              >
                <i className="fa-solid fa-bolt" style={{ fontSize: "0.68rem" }} /> Quick Preview
              </span>
            </div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {code.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Preview"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "2px solid #000",
              background: "var(--red)",
              color: "#FFF",
              boxShadow: "2px 2px 0px #000",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ overflowY: "auto", flex: 1, paddingRight: 4, marginBottom: 12 }}>
          {code.description && (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.88rem",
                fontWeight: 600,
                lineHeight: 1.5,
                marginBottom: 10,
              }}
            >
              {code.description}
            </p>
          )}

          {/* Author and views stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontWeight: 700,
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Avatar src={code.authorAvatar} name={code.authorName} size={22} />
              <span>{code.authorName || "Nimzz Admin"}</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <span>
                <i className="fa-regular fa-eye" style={{ marginRight: 4 }} />
                {code.views || 0} views
              </span>
            </div>
          </div>

          {/* Authentic VS Code Editor Viewer */}
          <div style={{ marginBottom: 10 }}>
            <VSCodeViewer
              code={code.code || ""}
              language={code.language}
              filename={fileName}
              maxHeight="380px"
              showTabs={true}
              showStatusBar={true}
              showActions={true}
            />
          </div>

          {/* Tags */}
          {code.tags && code.tags.length > 0 && (
            <div className="tags-row" style={{ marginTop: 8 }}>
              {code.tags.map((t) => (
                <span key={t} className="tag-pill">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "var(--border-w-sm) solid var(--border)",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
          >
            <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
            <span>{copied ? "Disalin ke Clipboard!" : "Salin Kode"}</span>
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={`/code/${code.slug}`}
              className="btn btn-primary btn-sm"
              onClick={onClose}
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              <span>Buka Halaman Lengkap</span>
            </Link>

            <button type="button" onClick={onClose} className="btn btn-sm btn-cancel">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

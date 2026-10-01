"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Code } from "@/lib/types";
import { toast } from "./ToastProvider";
import CodePreviewModal from "./CodePreviewModal";
import { fileNameFor, validThumbnail } from "@/lib/code-utils";

export function Avatar({
  src,
  name,
  size = 26,
  radius = 50,
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
          borderRadius: `${radius}%`,
        }}
      >
        <Image
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
        borderRadius: `${radius}%`,
        background: "var(--yellow)",
        color: "#000",
      }}
    >
      {char}
    </div>
  );
}

export default function CodeCard({ code }: { code: Code }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileName = fileNameFor(code);
  const thumb = validThumbnail(code.thumbnail);
  const [thumbFailed, setThumbFailed] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code.code || "");
    setCopied(true);
    toast("Kode disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="snippet-card">
        {/* Top Badges */}
        <div className="snippet-card-top">
          <div className="badges-row">
            <span className="category-badge">
              <i className="fa-solid fa-folder-open" style={{ fontSize: "0.68rem" }} />
              {code.category || "General"}
            </span>
            <span className="lang-badge">{code.language || "code"}</span>
          </div>
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
        {code.description && <p className="snippet-desc">{code.description}</p>}

        {/* Terminal Code Window (Clickable to preview) */}
        <div
          className="code-window"
          onClick={() => setShowPreview(true)}
          style={{ cursor: "pointer" }}
          title="Klik untuk membuka preview cepat"
        >
          <div className="code-window-bar">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
            <span className="filename">{fileName}</span>
            <span className="path-tag">
              <i className="fa-solid fa-eye" style={{ fontSize: "0.65rem" }} />
              Quick View
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

        {/* Tags */}
        {code.tags && code.tags.length > 0 && (
          <div className="tags-row">
            {code.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag-pill">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Meta stats and Author (NO Like Counter) */}
        <div className="snippet-meta">
          <div className="author">
            <Avatar src={code.authorAvatar} name={code.authorName} size={24} />
            <span>{code.authorName || "Admin"}</span>
          </div>

          <div className="stat-icons">
            <span title={`${code.views || 0} views`}>
              <i className="fa-regular fa-eye" /> {code.views || 0}
            </span>
          </div>
        </div>

        {/* Actions with Quick Preview Button */}
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
            <i className="fa-solid fa-arrow-up-right-from-square" /> Detail
          </Link>

          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
            title="Salin Code"
          >
            {copied ? (
              <>
                <i className="fa-solid fa-check" /> Disalin
              </>
            ) : (
              <>
                <i className="fa-solid fa-copy" /> Salin
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Preview Modal */}
      {showPreview && (
        <CodePreviewModal
          code={code}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

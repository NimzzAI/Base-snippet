"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Code } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/components/ToastProvider";
import { Avatar } from "@/components/CodeCard";
import VSCodeViewer from "@/components/VSCodeViewer";
import { config } from "@/lib/config";
import Link from "next/link";

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}h lalu`;
  return new Date(d).toLocaleDateString("id-ID");
}

export default function CodeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState<Code | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const loadCode = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/codes/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          setCode(json.data);
          return;
        }
      }
      setCode(null);
    } catch {
      setCode(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCode();
  }, [loadCode]);

  const handleDeleteCode = async () => {
    if (!isAdmin || !code) return;
    if (!confirm("Hapus code ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/codes/${encodeURIComponent(code.slug)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Code berhasil dihapus", "success");
        router.push("/search");
      } else {
        toast("Gagal menghapus code", "error");
      }
    } catch {
      toast("Gagal menghapus code", "error");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code?.code || "");
    setCopied(true);
    toast("Code berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const ext =
      code?.language === "python"
        ? "py"
        : code?.language === "javascript"
        ? "js"
        : code?.language === "typescript"
        ? "ts"
        : code?.language === "php"
        ? "php"
        : code?.language === "go"
        ? "go"
        : code?.language === "rust"
        ? "rs"
        : code?.language === "css"
        ? "css"
        : "txt";
    const blob = new Blob([code?.code || ""], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${code?.slug || "snippet"}.${ext}`;
    a.click();
  };

  const handleShare = async () => {
    if (!code) return;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${code.title} — ${config.websiteName}`,
      text: code.description || `Lihat snippet kode ${code.title} di ${config.websiteName}`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        setSharing(true);
        await navigator.share(shareData);
        toast("Tautan berhasil dibagikan!", "success");
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast("Tautan halaman disalin ke clipboard!", "info");
          } catch {}
        }
      } finally {
        setSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast("Tautan halaman disalin ke clipboard!", "success");
      } catch {
        toast("Gagal menyalin tautan", "error");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="skeleton" style={{ height: 160 }} />
        <div className="skeleton" style={{ height: 420 }} />
      </div>
    );
  }

  if (!code) {
    return (
      <div className="empty-state">
        <i className="fa-solid fa-file-circle-question" />
        <h3>Code Tidak Ditemukan</h3>
        <p>Mungkin code ini sudah dipindahkan atau URL tautan tidak valid.</p>
        <Link href="/search" className="btn btn-primary" style={{ marginTop: 16 }}>
          <i className="fa-solid fa-magnifying-glass" /> Ke Pencarian
        </Link>
      </div>
    );
  }

  const fileName = `${code.slug}.${
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
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 10 }}>
      {/* Navigation Breadcrumb / Back button */}
      <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/search" className="btn btn-sm">
          <i className="fa-solid fa-arrow-left" /> Kembali ke Daftar
        </Link>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href={`/category/${encodeURIComponent(code.category || "Tools")}`} className="category-badge">
            <i className="fa-solid fa-folder-open" style={{ fontSize: "0.7rem" }} />
            {code.category}
          </Link>
          <span className="lang-badge">{code.language}</span>
        </div>
      </div>

      {/* Detail Head */}
      <div className="detail-head" style={{ marginBottom: 20 }}>
        <div className="detail-head-top">
          <div className="detail-title">
            <h1 style={{ fontSize: "1.55rem", fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
              {code.title}
            </h1>
          </div>

          {isAdmin && (
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/edit/${code.id}`} className="action-btn action-edit">
                <i className="fa-solid fa-pen" /> Edit
              </Link>
              <button
                type="button"
                onClick={handleDeleteCode}
                className="action-btn action-danger"
              >
                <i className="fa-solid fa-trash" /> Hapus
              </button>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="detail-meta">
          <span>
            <Avatar src={code.authorAvatar} name={code.authorName} size={24} />
            <Link href="/owner" className="author-link" style={{ marginLeft: 6 }}>
              {code.authorName || "Admin"}
            </Link>
          </span>
          <span>•</span>
          <span>
            <i className="fa-regular fa-clock" /> {timeAgo(code.createdAt)}
          </span>
          <span>•</span>
          <span>
            <i className="fa-regular fa-eye" /> {code.views || 0} views
          </span>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="detail-actions" style={{ marginTop: 14 }}>
          <button
            type="button"
            onClick={copyCode}
            className="action-btn"
            style={{ background: copied ? "var(--green)" : "var(--yellow)", color: "#000" }}
          >
            <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
            <span>{copied ? "Berhasil Disalin!" : "Salin Kode"}</span>
          </button>

          <button type="button" onClick={downloadCode} className="action-btn">
            <i className="fa-solid fa-download" />
            <span>Download File</span>
          </button>

          <Link
            href={`/code/${code.slug}/raw`}
            target="_blank"
            className="action-btn"
          >
            <i className="fa-solid fa-file-code" />
            <span>View Raw</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="action-btn"
            style={{ background: "var(--blue)", color: "#FFF" }}
            title="Bagikan URL Halaman Kode ini"
          >
            <i className="fa-solid fa-share-nodes" />
            <span>{sharing ? "Membuka..." : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Description */}
      {code.description && (
        <div className="detail-desc" style={{ marginBottom: 18 }}>
          <i className="fa-solid fa-circle-info" />
          <span>{code.description}</span>
        </div>
      )}

      {/* Tags */}
      {code.tags && code.tags.length > 0 && (
        <div className="detail-tags" style={{ marginBottom: 16 }}>
          <div className="tags-row">
            {code.tags.map((t) => (
              <span key={t} className="tag-pill">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Authentic VS Code Editor Viewer */}
      <div style={{ marginBottom: 30 }}>
        <VSCodeViewer
          code={code.code || ""}
          language={code.language}
          filename={fileName}
          maxHeight="680px"
          showTabs={true}
          showStatusBar={true}
          showActions={true}
          onRawClick={() => window.open(`/code/${code.slug}/raw`, "_blank")}
          onDownloadClick={downloadCode}
        />
      </div>
    </div>
  );
}

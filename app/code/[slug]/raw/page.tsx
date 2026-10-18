"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Code } from "@/lib/types";
import { fileNameFor } from "@/lib/code-utils";
import { toast } from "@/components/ToastProvider";

export default function RawPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [item, setItem] = useState<Code | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/codes/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.ok && json.data) {
          setItem(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const rawCode = item?.code || "";
  const fileName = item ? fileNameFor(item) : `${slug || "snippet"}.txt`;
  const lines = rawCode ? rawCode.split("\n") : [];
  const sizeBytes = new Blob([rawCode]).size;
  const sizeLabel =
    sizeBytes >= 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    toast("Raw kode berhasil disalin!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawCode], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#141413",
        color: "#f2efe9",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
      }}
    >
      {/* Clean Dedicated Raw Header Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#1f1f1d",
          borderBottom: "1.5px solid #333330",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Link
            href={`/code/${slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              background: "#2a2a27",
              color: "#f2efe9",
              border: "1px solid #4a4944",
              borderRadius: "2px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <i className="fa-solid fa-arrow-left" /> Kembali
          </Link>

          <span
            style={{
              padding: "3px 8px",
              background: "#cbb340",
              color: "#141413",
              fontWeight: 800,
              fontSize: "0.7rem",
              borderRadius: "2px",
              letterSpacing: "0.06em",
            }}
          >
            RAW VIEW
          </span>

          <span
            style={{
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "#f2efe9",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fileName}
          </span>

          {!loading && item && (
            <span style={{ fontSize: "0.72rem", color: "#9e9b93" }}>
              ({lines.length} baris • {sizeLabel})
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setWrap(!wrap)}
            style={{
              padding: "5px 10px",
              background: wrap ? "#cbb340" : "#2a2a27",
              color: wrap ? "#141413" : "#f2efe9",
              border: "1px solid #4a4944",
              borderRadius: "2px",
              fontSize: "0.74rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-text-width" style={{ marginRight: 5 }} />
            {wrap ? "Wrap: ON" : "Wrap: OFF"}
          </button>

          <a
            href={`/api/v1/snippets/${encodeURIComponent(slug)}/raw`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "5px 10px",
              background: "#2a2a27",
              color: "#f2efe9",
              border: "1px solid #4a4944",
              borderRadius: "2px",
              fontSize: "0.74rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
            title="Buka murni text/plain untuk curl/wget"
          >
            <i className="fa-solid fa-terminal" style={{ marginRight: 5 }} />
            text/plain
          </a>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!item}
            style={{
              padding: "5px 10px",
              background: "#2a2a27",
              color: "#f2efe9",
              border: "1px solid #4a4944",
              borderRadius: "2px",
              fontSize: "0.74rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-download" style={{ marginRight: 5 }} />
            Unduh
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!item}
            style={{
              padding: "5px 12px",
              background: copied ? "#8eb897" : "#cbb340",
              color: "#141413",
              border: "1px solid #141413",
              borderRadius: "2px",
              fontSize: "0.75rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} style={{ marginRight: 5 }} />
            {copied ? "Tersalin!" : "Salin Raw"}
          </button>
        </div>
      </header>

      {/* Pure Raw Code Content */}
      <main style={{ flex: 1, padding: "16px 0", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "24px 20px", color: "#9e9b93", fontSize: "0.85rem" }}>
            ✳ Memuat raw snippet...
          </div>
        ) : !item ? (
          <div style={{ padding: "24px 20px", color: "#ff6b6b", fontSize: "0.85rem" }}>
            {"//"} Snippet kode &quot;{slug}&quot; tidak ditemukan.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              lineHeight: 1.65,
            }}
          >
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      width: "1%",
                      minWidth: 48,
                      padding: "0 14px 0 16px",
                      textAlign: "right",
                      color: "#66645e",
                      userSelect: "none",
                      verticalAlign: "top",
                      borderRight: "1px solid #262624",
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      padding: "0 20px 0 16px",
                      color: "#f2efe9",
                      whiteSpace: wrap ? "pre-wrap" : "pre",
                      wordBreak: wrap ? "break-word" : "normal",
                    }}
                  >
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

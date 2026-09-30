"use client";
import { useState } from "react";
import { config } from "@/lib/config";
import { toast } from "@/components/ToastProvider";

const SITE = config.siteUrl.replace(/\/+$/, "");

type Endpoint = {
  method: string;
  path: string;
  title: string;
  desc: string;
  sample: string;
  tryPath?: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/snippets",
    title: "Daftar Snippet",
    desc: "Ambil snippet terbaru. Filter lewat search, category, language, tag, limit maksimal 50, dan offset.",
    sample: `curl "${SITE}/api/v1/snippets?limit=10&language=javascript"`,
    tryPath: "/api/v1/snippets?limit=3",
  },
  {
    method: "GET",
    path: "/api/v1/snippets/:slug",
    title: "Detail Snippet",
    desc: "Ambil satu snippet lengkap dengan isi kodenya.",
    sample: `curl "${SITE}/api/v1/snippets/contoh-slug"`,
  },
  {
    method: "GET",
    path: "/api/v1/snippets/:slug/raw",
    title: "Kode Mentah",
    desc: "Isi kode sebagai teks biasa. Tambah download=1 supaya langsung terunduh sebagai file.",
    sample: `curl "${SITE}/api/v1/snippets/contoh-slug/raw?download=1" -o snippet.js`,
  },
  {
    method: "PAGE",
    path: "/embed/:slug",
    title: "Embed Widget",
    desc: "Tampilkan snippet di blog atau website lewat iframe. Tombol Embed juga ada di halaman detail kode.",
    sample: `<iframe src="${SITE}/embed/contoh-slug" width="100%" height="420" style="border:0" loading="lazy"></iframe>`,
  },
];

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Berhasil disalin", "success");
  } catch {
    toast("Gagal menyalin", "error");
  }
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const tryIt = async () => {
    if (!ep.tryPath) return;
    setLoading(true);
    try {
      const res = await fetch(ep.tryPath);
      const text = await res.text();
      let out = text;
      try {
        out = JSON.stringify(JSON.parse(text), null, 2);
      } catch {}
      setResult(out.length > 1800 ? out.slice(0, 1800) + "\n// Dipotong" : out);
    } catch {
      setResult("// Gagal memanggil endpoint");
    } finally {
      setLoading(false);
    }
  };

  const codeBox: React.CSSProperties = {
    background: "var(--term-bg)",
    color: "#F8F8F2",
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    lineHeight: 1.6,
    padding: 12,
    borderRadius: "var(--radius-sm)",
    border: "var(--border-w-sm) solid var(--border)",
    overflowX: "auto",
    whiteSpace: "pre",
    margin: 0,
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "var(--border-w) solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: 18,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <span
          style={{
            background: "var(--green)",
            color: "#000",
            border: "var(--border-w-sm) solid var(--border)",
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: "0.72rem",
            fontWeight: 800,
          }}
        >
          {ep.method}
        </span>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700, overflowWrap: "anywhere" }}>
          {ep.path}
        </code>
      </div>

      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 4 }}>{ep.title}</h3>
      <p style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: 12 }}>{ep.desc}</p>

      <pre style={codeBox}>{ep.sample}</pre>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => copyText(ep.sample)}>
          <i className="fa-solid fa-copy" /> Salin
        </button>
        {ep.tryPath && (
          <button type="button" className="btn btn-sm btn-primary" onClick={tryIt} disabled={loading}>
            <i className={loading ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-play"} /> Coba Langsung
          </button>
        )}
      </div>

      {result && <pre style={{ ...codeBox, marginTop: 12, maxHeight: 320 }}>{result}</pre>}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div style={{ maxWidth: 880, margin: "0 auto", paddingTop: 10 }}>
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <h2>
            <i className="fa-solid fa-plug" style={{ color: "var(--blue)" }} />
            API Publik
          </h2>
          <p>Ambil snippet {config.websiteName} lewat REST API. Read only, tanpa API key, dan CORS terbuka.</p>
        </div>
      </div>

      <div
        style={{
          background: "var(--yellow)",
          color: "#000",
          border: "var(--border-w) solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          padding: "12px 16px",
          marginBottom: 22,
        }}
      >
        <div style={{ fontSize: "0.72rem", fontWeight: 800, marginBottom: 4 }}>BASE URL</div>
        <code style={{ fontFamily: "var(--font-mono)", fontWeight: 700, overflowWrap: "anywhere" }}>{SITE}</code>
      </div>

      {ENDPOINTS.map((ep) => (
        <EndpointCard key={ep.path} ep={ep} />
      ))}
    </div>
  );
}

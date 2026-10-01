"use client";
import { config } from "@/lib/config";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Code, SUPPORTED_LANGUAGES } from "@/lib/types";
import { toast } from "@/components/ToastProvider";
import { useRealtimeCategories } from "@/lib/categories";
import CustomSelect from "@/components/CustomSelect";
import Link from "next/link";

export default function EditCodePage() {
  const params = useParams();
  const id = params?.id as string;
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { categories } = useRealtimeCategories();

  const [code, setCode] = useState<Code | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tools");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");
  const [codeText, setCodeText] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const loadCode = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/codes/${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data) {
          const data = json.data as Code;
          setCode(data);
          setTitle(data.title || "");
          setDescription(data.description || "");
          setCategory(data.category || "Tools");
          setLanguage(data.language || "javascript");
          setTags(data.tags?.join(", ") || "");
          setCodeText(data.code || "");
          setThumbnailUrl(data.thumbnail || "");
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCode();
  }, [loadCode]);

  if (loading || authLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="skeleton" style={{ height: 120 }} />
        <div className="skeleton" style={{ height: 350 }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ maxWidth: 500, margin: "40px auto" }}>
        <i className="fa-solid fa-lock" style={{ background: "var(--red)", color: "#FFF" }} />
        <h3>Akses Ditolak</h3>
        <p>Hanya Administrator yang memiliki akses untuk mengedit code ini.</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/admin/login" className="btn btn-primary">
            Login Admin
          </Link>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="empty-state">
        <i className="fa-solid fa-file-circle-question" />
        <h3>Code Tidak Ditemukan</h3>
        <Link href="/search" className="btn btn-primary" style={{ marginTop: 16 }}>
          Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !codeText.trim()) {
      toast("Judul dan code wajib diisi!", "error");
      return;
    }

    setSaving(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5);

      const res = await fetch(`/api/codes/${encodeURIComponent(code.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          language,
          tags: tagList,
          thumbnail: thumbnailUrl.trim(),
          code: codeText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengupdate code");
      }

      toast("Perubahan berhasil disimpan!", "success");
      router.push(`/code/${code.slug}`);
    } catch {
      toast("Gagal mengupdate code", "error");
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c,
    label: c,
    icon: "fa-folder",
  }));

  const languageOptions = SUPPORTED_LANGUAGES.map((l) => ({
    value: l,
    label: l.toUpperCase(),
    icon: "fa-terminal",
  }));

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", paddingTop: 10 }}>
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <h2>
            <i className="fa-solid fa-pen-to-square" style={{ color: "var(--blue)" }} />
            Edit Code
          </h2>
          <p>
            Memperbarui: <strong>{code.title}</strong>
          </p>
        </div>
        <Link href={`/code/${code.slug}`} className="btn btn-sm">
          <i className="fa-solid fa-eye" /> Lihat Publik
        </Link>
      </div>

      <div
        className="card-form"
        style={{
          maxWidth: "100%",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Judul Code *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label>Deskripsi Singkat</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label>Kategori *</label>
              <CustomSelect
                label="Kategori"
                value={category}
                options={categoryOptions}
                onChange={setCategory}
                icon="fa-folder"
              />
            </div>

            <div className="form-group">
              <label>Bahasa Pemrograman *</label>
              <CustomSelect
                label="Bahasa"
                value={language}
                options={languageOptions}
                onChange={setLanguage}
                icon="fa-code"
              />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label>Tags (pisahkan dengan koma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>URL Thumbnail</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <label style={{ margin: 0 }}>Syntax Code *</label>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.74rem",
                  color: "var(--text-muted)",
                  fontWeight: 700,
                }}
              >
                {codeText.split("\n").length} baris
              </span>
            </div>

            <div
              style={{
                background: "var(--term-bg)",
                border: "var(--border-w-sm) solid var(--border)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "var(--term-bg-bar)",
                  borderBottom: "2px solid #000",
                }}
              >
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <span
                  style={{
                    marginLeft: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--term-faint)",
                  }}
                >
                  edit.{language}
                </span>
              </div>

              <textarea
                rows={16}
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#1E1E1E",
                  color: "#F8F8F2",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  border: "none",
                  outline: "none",
                  resize: "vertical",
                  boxShadow: "none",
                  borderRadius: 0,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" /> Simpan Perubahan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-cancel"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import { config } from "@/lib/config";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SUPPORTED_LANGUAGES } from "@/lib/types";
import { toast } from "@/components/ToastProvider";
import { useRealtimeCategories, addCategoryToFirestore } from "@/lib/categories";
import CustomSelect from "@/components/CustomSelect";
import { uploadImage } from "@/lib/upload-client";
import Link from "next/link";

export default function PublishPage() {
  const { isAdmin, adminConfig, loading: authLoading } = useAuth();
  const router = useRouter();
  const { categories } = useRealtimeCategories();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tools");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [formError, setFormError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  // Gulir ke pesan error supaya tidak tertutup tab bar
  useEffect(() => {
    if (formError) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [formError]);

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const url = await uploadImage(file, "thumbnail");
      setThumbnailUrl(url);
      toast("Thumbnail berhasil diupload", "success");
    } catch (err: any) {
      toast(err?.message || "Gagal upload thumbnail", "error");
    } finally {
      setUploadingThumb(false);
      input.value = "";
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="skeleton" style={{ height: 120 }} />
        <div className="skeleton" style={{ height: 350 }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ maxWidth: 540, margin: "40px auto" }}>
        <i className="fa-solid fa-lock" style={{ background: "var(--red)", color: "#FFF" }} />
        <h3>Akses Khusus Administrator</h3>
        <p>
          Halaman publish code diperuntukkan bagi Administrator {config.websiteName}.
          Silakan masuk dengan akun Admin untuk mempublikasikan kode baru.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/admin/login" className="btn btn-primary">
            <i className="fa-solid fa-shield-halved" /> Login Admin
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!title.trim() || !code.trim()) {
      setFormError("Judul dan code wajib diisi!");
      toast("Judul dan code wajib diisi!", "error");
      return;
    }

    setSubmitting(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5);

      const authorName = adminConfig.displayName || config.admin.displayName;
      const authorAvatar = adminConfig.photoURL || config.admin.photoURL;
      const authorUsername = adminConfig.username || config.admin.username;

      const res = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          language,
          tags: tagList,
          thumbnail: thumbnailUrl.trim(),
          code: code.trim(),
          authorUsername,
          authorName,
          authorAvatar,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Gagal publish code");
      }

      // Automatically register category in list if new
      if (category.trim()) {
        addCategoryToFirestore(category.trim()).catch(() => {});
      }

      toast("Code berhasil dipublish!", "success");
      router.push(`/code/${json.data.slug}`);
    } catch (err: any) {
      const message = err?.message || "Gagal publish code, silakan coba lagi.";
      setFormError(message);
      toast(message, "error");
    } finally {
      setSubmitting(false);
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
      {/* Header */}
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <h2>
            <i className="fa-solid fa-cloud-arrow-up" style={{ color: "var(--green)" }} />
            Publish Code Baru
          </h2>
          <p>Bagikan project atau snippet kode ke platform {config.websiteName}.</p>
        </div>
      </div>

      {/* Main Form */}
      <div
        className="card-form"
        style={{
          maxWidth: "100%",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Judul */}
          <div className="form-group">
            <label>Judul Code *</label>
            <input
              type="text"
              placeholder="Contoh: WhatsApp Bot Interactive Menu Handler"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label>Deskripsi Singkat</label>
            <textarea
              rows={2}
              placeholder="Jelaskan secara ringkas fungsi dan kegunaan code ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />
          </div>

          {/* Custom Selectors for Category & Language */}
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

          {/* Tags & Thumbnail URL */}
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label>Tags (pisahkan dengan koma)</label>
              <input
                type="text"
                placeholder="bot, whatsapp, baileys, api"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Thumbnail (Opsional)</label>
              <input
                type="url"
                placeholder="URL gambar atau pakai Upload"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
              <div style={{ marginTop: 8 }}>
                <label className="btn btn-sm btn-secondary" style={{ cursor: "pointer", margin: 0 }}>
                  <i className={uploadingThumb ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-upload"} />{" "}
                  {uploadingThumb ? "Mengupload..." : "Upload Gambar"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleThumbUpload}
                    disabled={uploadingThumb}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              {/^(https?:\/\/|\/)/i.test(thumbnailUrl.trim()) && (
                <div className="thumb-preview">
                  <Image
                    src={thumbnailUrl}
                    alt="Preview thumbnail"
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Code Body */}
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
                {code.split("\n").length} baris • {code.length} karakter
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
                  source.{language}
                </span>
              </div>

              <textarea
                rows={16}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Tulis atau tempel code di sini..."
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

          {formError && (
            <div className="form-error" ref={errorRef} role="alert">
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
              {formError}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" /> Menerbitkan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up" /> Terbitkan Code
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

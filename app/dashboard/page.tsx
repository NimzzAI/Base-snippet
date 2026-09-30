"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Code, CodeRequest } from "@/lib/types";
import { toast } from "@/components/ToastProvider";
import { config, DEFAULT_AVATAR } from "@/lib/config";
import { uploadImage } from "@/lib/upload-client";
import { useRealtimeCategories, addCategoryToFirestore, removeCategoryFromFirestore } from "@/lib/categories";
import Link from "next/link";

type Tab = "overview" | "codes" | "categories" | "requests" | "profile_settings";

const AVATAR_PRESETS = [DEFAULT_AVATAR];

const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
];

export default function DashboardPage() {
  const { isAdmin, adminConfig, logout, updateAdminProfile } = useAuth();
  const router = useRouter();
  const { categories, refresh: refreshCategories } = useRealtimeCategories();

  const [tab, setTab] = useState<Tab>("overview");
  const [codes, setCodes] = useState<Code[]>([]);
  const [requests, setRequests] = useState<CodeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile customization state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [github, setGithub] = useState("");
  const [telegram, setTelegram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState<"" | "avatar" | "banner">("");
  const avatarSrc = avatarUrl.trim() || DEFAULT_AVATAR;

  // Category management state
  const [newCatInput, setNewCatInput] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  useEffect(() => {
    if (!isAdmin && !loading) {
      router.replace("/admin/login");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    if (adminConfig) {
      setDisplayName(adminConfig.displayName || config.admin.displayName);
      setUsername(adminConfig.username || config.admin.username);
      setBio(adminConfig.bio || config.admin.bio);
      setAvatarUrl(adminConfig.photoURL || config.admin.photoURL);
      setBannerUrl(adminConfig.banner || config.admin.banner);
      setWhatsapp(adminConfig.socials?.whatsapp || config.admin.socials.whatsapp);
      setGithub(adminConfig.socials?.github || config.admin.socials.github);
      setTelegram(adminConfig.socials?.telegram || config.admin.socials.telegram);
      setTiktok(adminConfig.socials?.tiktok || config.admin.socials.tiktok);
    }
  }, [adminConfig]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [codesRes, reqsRes] = await Promise.all([
        fetch("/api/codes"),
        fetch("/api/requests"),
      ]);

      if (codesRes.ok) {
        const json = await codesRes.json();
        if (json.ok && Array.isArray(json.data)) {
          setCodes(json.data);
        }
      }

      if (reqsRes.ok) {
        const json = await reqsRes.json();
        if (json.ok && Array.isArray(json.data)) {
          setRequests(json.data);
        }
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 8000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const deleteCode = async (id: string) => {
    if (!confirm("Hapus code ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/codes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCodes((c) => c.filter((x) => x.id !== id && x.slug !== id));
        toast("Code berhasil dihapus", "info");
      } else {
        toast("Gagal menghapus code", "error");
      }
    } catch {
      toast("Gagal menghapus code", "error");
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "avatar" | "banner"
  ) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(target);
    try {
      const url = await uploadImage(file, target);
      if (target === "avatar") {
        setAvatarUrl(url);
        toast("Avatar berhasil diupload, klik Simpan Pengaturan.", "success");
      } else {
        setBannerUrl(url);
        toast("Banner berhasil diupload, klik Simpan Pengaturan.", "success");
      }
    } catch (err: any) {
      toast(err?.message || "Gagal upload gambar", "error");
    } finally {
      setUploading("");
      input.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const result = await updateAdminProfile({
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        photoURL: avatarUrl.trim(),
        banner: bannerUrl.trim(),
        socials: {
          whatsapp: whatsapp.trim(),
          github: github.trim(),
          telegram: telegram.trim(),
          tiktok: tiktok.trim(),
        },
      });

      if (result.ok) {
        toast("Custom Avatar, Banner & Profil Admin berhasil disimpan!", "success");
      } else {
        toast(result.error || "Gagal menyimpan profil, periksa koneksi.", "error");
      }
    } catch {
      toast("Gagal menyimpan profil", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    setAddingCat(true);
    try {
      const ok = await addCategoryToFirestore(newCatInput.trim());
      if (ok) {
        toast(`Kategori "${newCatInput.trim()}" berhasil ditambahkan!`, "success");
        setNewCatInput("");
        refreshCategories();
      } else {
        toast("Gagal menambahkan kategori.", "error");
      }
    } catch {
      toast("Terjadi kesalahan.", "error");
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (!confirm(`Hapus kategori "${cat}"?`)) return;
    try {
      const ok = await removeCategoryFromFirestore(cat);
      if (ok) {
        toast(`Kategori "${cat}" berhasil dihapus.`, "info");
        refreshCategories();
      }
    } catch {
      toast("Gagal menghapus kategori.", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="skeleton" style={{ height: 140 }} />
        <div className="skeleton" style={{ height: 260 }} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalViews = codes.reduce((a, c) => a + (c.views || 0), 0);

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", paddingTop: 10 }}>
      {/* Banner & Avatar Live Preview */}
      <div className="profile-banner-wrap" style={{ position: "relative" }}>
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt="Banner Preview"
            fill
            unoptimized={bannerUrl.startsWith("data:")}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #00ffa4, #2563EB)" }} />
        )}
        <div className="profile-avatar-pin">
          <div className="avatar-lg" style={{ background: "var(--yellow)" }}>
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Avatar Preview"
                width={80}
                height={80}
                unoptimized={avatarSrc.startsWith("data:")}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              <span>{(displayName || "A")[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Info Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{displayName}</h1>
            <span className="category-badge" style={{ background: "var(--yellow)" }}>
              <i className="fa-solid fa-crown" style={{ fontSize: "0.68rem" }} /> Administrator
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 600 }}>
            @{username} • {bio}
          </p>

          <div style={{ marginTop: 8 }}>
            <Link href="/owner" className="btn btn-sm" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
              <i className="fa-solid fa-arrow-up-right-from-square" /> Lihat Halaman Owner Publik
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/publish" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-plus" /> Publish Code
          </Link>
          <button type="button" onClick={() => logout()} className="btn btn-danger btn-sm">
            <i className="fa-solid fa-power-off" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`tab-btn ${tab === "overview" ? "active" : ""}`}
        >
          <i className="fa-solid fa-gauge" style={{ marginRight: 6 }} /> Ringkasan
        </button>
        <button
          type="button"
          onClick={() => setTab("codes")}
          className={`tab-btn ${tab === "codes" ? "active" : ""}`}
        >
          <i className="fa-solid fa-code" style={{ marginRight: 6 }} /> Kelola Codes ({codes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("categories")}
          className={`tab-btn ${tab === "categories" ? "active" : ""}`}
        >
          <i className="fa-solid fa-folder-tree" style={{ marginRight: 6 }} /> Kategori ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("requests")}
          className={`tab-btn ${tab === "requests" ? "active" : ""}`}
        >
          <i className="fa-solid fa-clipboard-list" style={{ marginRight: 6 }} /> Requests ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("profile_settings")}
          className={`tab-btn ${tab === "profile_settings" ? "active" : ""}`}
        >
          <i className="fa-solid fa-palette" style={{ marginRight: 6 }} /> Custom Avatar & Banner
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {tab === "overview" && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="num">{codes.length}</div>
            <div className="lbl">Total Snippets</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--success)" }}>
              {totalViews}
            </div>
            <div className="lbl">Total Views</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--blue)" }}>
              {requests.length}
            </div>
            <div className="lbl">Request Masuk</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: "var(--purple)" }}>
              {categories.length}
            </div>
            <div className="lbl">Kategori Aktif</div>
          </div>
        </div>
      )}

      {/* TAB: CODES */}
      {tab === "codes" && (
        <div
          style={{
            background: "var(--surface)",
            border: "var(--border-w) solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "var(--border-w-sm) solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-2)",
            }}
          >
            <strong style={{ fontWeight: 800 }}>Semua Koleksi Kode ({codes.length})</strong>
            <Link href="/publish" className="btn btn-sm btn-primary">
              <i className="fa-solid fa-plus" /> Tambah Baru
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {codes.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                Belum ada kode yang tersimpan. Klik Tambah Baru untuk membuat kode pertama.
              </div>
            ) : (
              codes.map((c, idx) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    borderBottom:
                      idx < codes.length - 1 ? "1px solid var(--border)" : "none",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <Link
                      href={`/code/${c.slug}`}
                      style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text)" }}
                    >
                      {c.title}
                    </Link>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <span className="lang-badge" style={{ fontSize: "0.68rem" }}>
                        {c.language}
                      </span>
                      <span className="tag-pill" style={{ fontSize: "0.68rem" }}>
                        {c.category}
                      </span>
                      <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 700 }}>
                        <i className="fa-regular fa-eye" /> {c.views || 0}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/code/${c.slug}`} className="btn btn-sm" title="Lihat">
                      <i className="fa-solid fa-arrow-up-right-from-square" />
                    </Link>
                    <Link href={`/edit/${c.id}`} className="btn btn-sm btn-secondary" title="Edit">
                      <i className="fa-solid fa-pen" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteCode(c.id)}
                      className="btn btn-sm btn-danger"
                      title="Hapus"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: CATEGORIES */}
      {tab === "categories" && (
        <div
          style={{
            background: "var(--surface)",
            border: "var(--border-w) solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: "24px",
          }}
        >
          <div className="section-head" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: "1.2rem" }}>
                <i className="fa-solid fa-folder-tree" style={{ color: "var(--yellow)", marginRight: 8 }} />
                Kelola Kategori
              </h2>
              <p>Tambah kategori baru kapan saja, otomatis muncul di sidebar, form upload, dan filter pencarian.</p>
            </div>
          </div>

          {/* Form to add category */}
          <form onSubmit={handleAddCategory} style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Ketik nama kategori baru (contoh: DevOps, Microservices, Game)..."
              style={{ flex: 1, minWidth: 260 }}
              required
            />
            <button
              type="submit"
              disabled={addingCat}
              className="btn btn-primary"
            >
              {addingCat ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-plus" />}
              <span>Tambah Kategori</span>
            </button>
          </form>

          {/* Existing Categories List */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat}
                style={{
                  background: "var(--bg)",
                  border: "2px solid #000",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "2px 2px 0px #000",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                  <i className="fa-solid fa-folder" style={{ color: "var(--yellow)" }} />
                  <span>{cat}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  title={`Hapus kategori ${cat}`}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--red)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: REQUESTS */}
      {tab === "requests" && (
        <div
          style={{
            background: "var(--surface)",
            border: "var(--border-w) solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: "20px",
          }}
        >
          <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: 14 }}>
            Request Kode dari Pengguna ({requests.length})
          </strong>

          {requests.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>Belum ada request masuk.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {requests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    border: "2px solid #000",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    background: "var(--bg)",
                    boxShadow: "2px 2px 0px #000",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "1rem" }}>{r.codeName}</strong>
                    <span className="lang-badge" style={{ background: "var(--yellow)", color: "#000" }}>
                      {r.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "6px 0" }}>
                    {r.description}
                  </p>
                  <div style={{ fontSize: "0.78rem", color: "#888" }}>
                    Dari: <strong>{r.authorName}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: PROFILE & CUSTOM AVATAR/BANNER */}
      {tab === "profile_settings" && (
        <div
          style={{
            background: "var(--surface)",
            border: "var(--border-w) solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            padding: "26px",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 4 }}>
            Kustomisasi Avatar, Banner & Identitas Admin
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 20 }}>
            Ubah foto avatar, banner latar, nama, dan tautan sosial resmi yang tampil di seluruh website dan halaman Owner.
          </p>

          <form onSubmit={handleSaveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label>Nama Tampilan Developer</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nimzz Admin"
                  required
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nimzz"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio & Deskripsi Singkat</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Pengelola dan creator platform Nimzz Code..."
              />
            </div>

            {/* Custom Avatar Section */}
            <div className="form-group" style={{ background: "var(--bg)", border: "2px solid #000", padding: "16px", borderRadius: "10px", marginBottom: 18 }}>
              <label style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                <i className="fa-solid fa-user-circle" style={{ marginRight: 6, color: "var(--blue)" }} />
                Kustom Avatar Admin
              </label>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #000", overflow: "hidden", background: "var(--yellow)", flexShrink: 0 }}>
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt="Preview Avatar"
                      width={56}
                      height={56}
                      unoptimized={avatarSrc.startsWith("data:")}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>A</div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="URL foto avatar atau pakai Upload File"
                  />
                </div>

                <div>
                  <label className="btn btn-sm btn-secondary" style={{ cursor: "pointer", margin: 0 }}>
                    <i className={uploading === "avatar" ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-upload"} /> {uploading === "avatar" ? "Mengupload..." : "Upload File"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "avatar")}
                      disabled={uploading !== ""}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* Avatar Presets */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>Avatar Default:</span>
                {AVATAR_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(p)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "2px solid #000",
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: 0,
                      boxShadow: "1px 1px 0px #000",
                    }}
                  >
                    <Image src={p} alt={`Preset ${i}`} width={32} height={32} style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Banner Section */}
            <div className="form-group" style={{ background: "var(--bg)", border: "2px solid #000", padding: "16px", borderRadius: "10px", marginBottom: 18 }}>
              <label style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                <i className="fa-solid fa-image" style={{ marginRight: 6, color: "var(--green)" }} />
                Kustom Banner Admin
              </label>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ width: 120, height: 48, borderRadius: "6px", border: "2px solid #000", overflow: "hidden", background: "var(--yellow)", position: "relative", flexShrink: 0 }}>
                  {bannerUrl && (
                    <Image
                      src={bannerUrl}
                      alt="Preview Banner"
                      fill
                      unoptimized={bannerUrl.startsWith("data:")}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="URL foto banner atau pakai Upload File"
                  />
                </div>

                <div>
                  <label className="btn btn-sm btn-secondary" style={{ cursor: "pointer", margin: 0 }}>
                    <i className={uploading === "banner" ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-upload"} /> {uploading === "banner" ? "Mengupload..." : "Upload File"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => handleFileUpload(e, "banner")}
                      disabled={uploading !== ""}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* Banner Presets */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>Pilihan Preset Banner:</span>
                {BANNER_PRESETS.map((b, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBannerUrl(b)}
                    className="btn btn-sm"
                    style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                  >
                    Banner #{i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div style={{ borderTop: "var(--border-w-sm) solid var(--border)", margin: "24px 0 18px", paddingTop: 14 }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 14 }}>
                <i className="fa-solid fa-share-nodes" style={{ marginRight: 8, color: "var(--blue)" }} />
                Tautan Media Sosial Resmi (Tampil di Halaman Owner)
              </h3>
            </div>

            <div className="form-group">
              <label>
                <i className="fa-brands fa-whatsapp" style={{ color: "#25D366", marginRight: 6 }} />
                WhatsApp Channel
              </label>
              <input
                type="url"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="https://whatsapp.com/channel/..."
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fa-brands fa-github" style={{ marginRight: 6 }} />
                GitHub
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="NimzzAI"
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fa-brands fa-telegram" style={{ color: "#229ED9", marginRight: 6 }} />
                Telegram
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="nimzz_dev"
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fa-brands fa-tiktok" style={{ marginRight: 6 }} />
                TikTok
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="nimzz_code"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
              style={{ marginTop: 14 }}
            >
              {savingProfile ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" /> Simpan Pengaturan
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

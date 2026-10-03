"use client";
import { useEffect, useState, useCallback } from "react";
import { CodeRequest } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/components/ToastProvider";
import CustomSelect from "@/components/CustomSelect";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; color: string; icon: string }
> = {
  new: { label: "Baru", bg: "var(--yellow)", color: "#000", icon: "fa-circle-plus" },
  "in-progress": { label: "Dikerjakan", bg: "var(--blue)", color: "#FFF", icon: "fa-spinner" },
  done: { label: "Selesai", bg: "var(--green)", color: "#000", icon: "fa-circle-check" },
  rejected: { label: "Ditolak", bg: "var(--red)", color: "#FFF", icon: "fa-circle-xmark" },
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "hari ini";
  if (days < 30) return `${days} hari lalu`;
  return new Date(d).toLocaleDateString("id-ID");
}

export default function RequestPage() {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState<CodeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeName, setCodeName] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | CodeRequest["status"]>("all");

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setRequests(json.data);
        }
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 6000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim() || !description.trim()) {
      toast("Judul dan deskripsi wajib diisi!", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        authorName: authorName.trim() || "Pengunjung",
        codeName: codeName.trim(),
        description: description.trim(),
      };

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Gagal mengirim request");
      }

      setRequests((prev) => [json.data, ...prev]);
      setCodeName("");
      setDescription("");
      setAuthorName("");
      toast("Request berhasil dikirim ke Admin!", "success");

      // Notify Telegram if configured
      fetch("/api/telegram/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new_request", data: json.data }),
      }).catch(() => {});
    } catch (err: any) {
      toast(err?.message || "Gagal mengirim request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (id: string, status: CodeRequest["status"]) => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        toast("Status request diperbarui", "success");
      } else {
        toast("Gagal update status", "error");
      }
    } catch {
      toast("Gagal update status", "error");
    }
  };

  const removeRequest = async (id: string, name: string) => {
    if (!isAdmin) return;
    if (!window.confirm(`Hapus request "${name}"?`)) return;
    try {
      const res = await fetch("/api/requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        toast("Request dihapus", "success");
      } else {
        toast("Gagal menghapus request", "error");
      }
    } catch {
      toast("Gagal menghapus request", "error");
    }
  };

  const counts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const visible = requests
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusOptions = [
    { value: "new", label: "Baru", icon: "fa-circle-plus" },
    { value: "in-progress", label: "Dikerjakan", icon: "fa-spinner" },
    { value: "done", label: "Selesai", icon: "fa-circle-check" },
    { value: "rejected", label: "Ditolak", icon: "fa-circle-xmark" },
  ];

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", paddingTop: 10 }}>
      {/* Head */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <h2>
            <i className="fa-solid fa-clipboard-question" style={{ color: "var(--yellow)" }} />
            Request Code & Fitur
          </h2>
          <p>Butuh script atau modul tertentu? Kirim ide kamu ke Admin tanpa perlu login!</p>
        </div>
      </div>

      {/* Request Form */}
      <div
        className="card-form"
        style={{
          maxWidth: "100%",
          padding: "26px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ fontSize: "1.2rem" }}>
          <i>
            <i className="fa-solid fa-paper-plane" />
          </i>
          Form Permintaan Kode Baru
        </h2>
        <p className="sub">
          Jelaskan kebutuhan kamu. Permintaan yang menarik akan dipublish oleh Admin ke Nimzz Code.
        </p>

        <form onSubmit={handleSubmit}>
          {!isAdmin && (
            <div className="form-group">
              <label>Nama / Panggilan Kamu</label>
              <input
                type="text"
                placeholder="Contoh: Alex Developer"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={50}
              />
            </div>
          )}

          <div className="form-group">
            <label>Nama Code / Fitur yang Diminta *</label>
            <input
              type="text"
              placeholder="Contoh: WhatsApp Bot AI Voice Note Handler"
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Deskripsi & Kebutuhan *</label>
            <textarea
              rows={4}
              placeholder="Jelaskan alur, bahasa yang diinginkan (JS/Python/Go), atau link referensi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={600}
            />
            <div className="req-counter">{description.length}/600</div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: "auto" }}
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" /> Mengirim...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" /> Kirim Request Sekarang
              </>
            )}
          </button>
        </form>
      </div>

      {/* Requests List */}
      <div className="section-head" style={{ marginBottom: 16 }}>
        <div>
          <h3>
            <i className="fa-solid fa-list-check" style={{ color: "var(--blue)", marginRight: 8 }} />
            Daftar Request Komunitas ({requests.length})
          </h3>
        </div>
      </div>

      {!loading && requests.length > 0 && (
        <div className="req-filters" role="tablist" aria-label="Filter status request">
          {([
            ["all", "Semua", requests.length],
            ["new", "Baru", counts["new"] || 0],
            ["in-progress", "Dikerjakan", counts["in-progress"] || 0],
            ["done", "Selesai", counts["done"] || 0],
            ["rejected", "Ditolak", counts["rejected"] || 0],
          ] as const).map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`req-chip ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key as typeof filter)}
            >
              {label} <span>{n}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100 }} />
            ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-inbox" />
          <h3>Belum Ada Request</h3>
          <p>Jadilah yang pertama mengirimkan permintaan code.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-filter" />
          <h3>Tidak Ada Request</h3>
          <p>Belum ada request dengan status ini.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {visible.map((r) => {
            const statusStyle = STATUS_CONFIG[r.status] || STATUS_CONFIG.new;
            return (
              <div
                key={r.id}
                className="snippet-card request-card"
                style={{ padding: "18px 22px", borderLeft: `8px solid ${statusStyle.bg}` }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        className="category-badge"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        <i className={`fa-solid ${statusStyle.icon}`} style={{ fontSize: "0.68rem" }} />
                        {statusStyle.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontWeight: 700,
                        }}
                      >
                        {timeAgo(r.createdAt)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.05rem", marginBottom: 6 }}>{r.codeName}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.5 }}>
                      {r.description}
                    </p>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <i className="fa-solid fa-user" />
                      <span>Diminta oleh: <strong>{r.authorName}</strong></span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ minWidth: 150 }}>
                        <CustomSelect
                          label="Status"
                          value={r.status}
                          options={statusOptions}
                          onChange={(val) => changeStatus(r.id, val as any)}
                          icon="fa-sliders"
                        />
                      </div>
                      <button
                        type="button"
                        className="req-delete"
                        onClick={() => removeRequest(r.id, r.codeName)}
                        aria-label={`Hapus request ${r.codeName}`}
                        title="Hapus request"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

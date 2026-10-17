"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Code } from "@/lib/types";
import { useBookmarks } from "@/lib/bookmarks";
import CodeCard from "@/components/CodeCard";
import { StitchedLoader } from "@/components/FieldJournalDecor";
import { toast } from "@/components/ToastProvider";

export default function BookmarksPage() {
  const { bookmarkedSlugs, clearAll } = useBookmarks();
  const [allCodes, setAllCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  const fetchAllCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/codes");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setAllCodes(json.data);
        }
      }
    } catch {
      setAllCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCodes();
  }, [fetchAllCodes]);

  const savedCodes = allCodes.filter((c) => bookmarkedSlugs.includes(c.slug));

  const filteredCodes = savedCodes.filter((c) => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return true;
    return (
      c.title?.toLowerCase().includes(q) ||
      c.language?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleExportBookmarks = () => {
    if (savedCodes.length === 0) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      total: savedCodes.length,
      snippets: savedCodes.map((c) => ({
        title: c.title,
        slug: c.slug,
        category: c.category,
        language: c.language,
        description: c.description,
        tags: c.tags,
        code: c.code,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nimzz-code-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast("Koleksi bookmark berhasil diunduh sebagai JSON!", "success");
  };

  const handleClearAll = () => {
    if (savedCodes.length === 0) return;
    if (!window.confirm("Kosongkan seluruh daftar snippet tersimpan di browser ini?")) return;
    clearAll();
    toast("Daftar bookmark dikosongkan", "info");
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", paddingTop: 14, paddingBottom: 40 }}>
      {/* Header */}
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <h2>
            <i className="fa-solid fa-bookmark" style={{ color: "var(--blue)" }} />
            Koleksi <span className="text-laidback">Snippet Tersimpan</span>
          </h2>
          <p>
            Simpan kode favoritmu di browser untuk diakses cepat kapan saja tanpa perlu login.
          </p>
        </div>

        {savedCodes.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={handleExportBookmarks} className="btn btn-sm btn-yellow">
              <i className="fa-solid fa-file-export" /> Export JSON ({savedCodes.length})
            </button>
            <button type="button" onClick={handleClearAll} className="btn btn-sm btn-danger">
              <i className="fa-solid fa-trash" /> Hapus Semua
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar if bookmarks exist */}
      {savedCodes.length > 0 && (
        <div className="filter-bar" style={{ position: "relative", marginBottom: 24, paddingTop: 20 }}>
          <div className="washi-tape" style={{ width: 110, height: 20, top: -10 }} />
          <div className="search-bar" style={{ flex: 1, maxWidth: "none" }}>
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Filter koleksi tersimpan berdasarkan judul, bahasa, atau kategori..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>
          <span className="camp-stamp">
            {filteredCodes.length} / {savedCodes.length} TERSIMPAN
          </span>
        </div>
      )}

      {loading ? (
        <StitchedLoader label="Memuat Koleksi Snippet Tersimpan..." code="[BOOKMARKS.SYNC]" count={3} />
      ) : savedCodes.length === 0 ? (
        <div className="empty-state">
          <i className="fa-regular fa-bookmark" />
          <h3>Belum Ada Snippet yang Disimpan</h3>
          <p style={{ maxWidth: 520, margin: "0 auto 16px" }}>
            Klik ikon <strong>Bookmark</strong> pada kartu snippet atau halaman detail kode untuk menyimpannya ke koleksi pribadimu.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/search" className="btn btn-primary">
              <i className="fa-solid fa-magnifying-glass" /> Jelajahi Katalog Kode
            </Link>
            <Link href="/" className="btn btn-secondary">
              <i className="fa-solid fa-house" /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-filter-circle-xmark" />
          <h3>Tidak Ditemukan di Koleksi</h3>
          <p>Tidak ada snippet tersimpan yang cocok dengan kata kunci &ldquo;{searchQ}&rdquo;.</p>
          <button
            type="button"
            onClick={() => setSearchQ("")}
            className="btn btn-primary"
            style={{ marginTop: 14 }}
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="snippets-grid" style={{ paddingTop: 8 }}>
          {filteredCodes.map((code) => (
            <CodeCard key={code.id} code={code} />
          ))}
        </div>
      )}
    </div>
  );
}

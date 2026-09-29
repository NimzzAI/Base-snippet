"use client";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Code, SUPPORTED_LANGUAGES } from "@/lib/types";
import { useRealtimeCategories } from "@/lib/categories";
import CodeCard from "@/components/CodeCard";
import CustomSelect from "@/components/CustomSelect";

function SearchContent() {
  const searchParams = useSearchParams();
  const { categories } = useRealtimeCategories();
  const [allCodes, setAllCodes] = useState<Code[]>([]);
  const [results, setResults] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [localQ, setLocalQ] = useState(searchParams.get("q") || "");
  const [filterLang, setFilterLang] = useState("all");
  const [filterCat, setFilterCat] = useState("Semua");
  const [sortBy, setSortBy] = useState("newest");

  const loadCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/codes");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setAllCodes(json.data);
        }
      }
    } catch (error) {
      console.warn("Codes fetch error:", error);
      setAllCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCodes();
    const interval = setInterval(loadCodes, 6000);
    return () => clearInterval(interval);
  }, [loadCodes]);

  useEffect(() => {
    setLocalQ(searchParams.get("q") || "");
  }, [searchParams]);

  const filterAndSort = useCallback(() => {
    let filtered = [...allCodes];
    const q = localQ.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q)) ||
          c.language?.toLowerCase().includes(q) ||
          c.authorName?.toLowerCase().includes(q)
      );
    }
    if (filterLang !== "all") {
      filtered = filtered.filter(
        (c) => c.language?.toLowerCase() === filterLang.toLowerCase()
      );
    }
    if (filterCat !== "Semua") {
      filtered = filtered.filter((c) => c.category === filterCat);
    }

    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    setResults(filtered);
  }, [allCodes, localQ, filterLang, filterCat, sortBy]);

  useEffect(() => {
    filterAndSort();
  }, [filterAndSort]);

  const categoryOptions = [
    { value: "Semua", label: "Semua Kategori", icon: "fa-tags" },
    ...categories.map((c) => ({ value: c, label: c, icon: "fa-folder" })),
  ];

  const languageOptions = [
    { value: "all", label: "Semua Bahasa", icon: "fa-code" },
    ...SUPPORTED_LANGUAGES.slice(0, 20).map((l) => ({
      value: l,
      label: l.toUpperCase(),
      icon: "fa-terminal",
    })),
  ];

  const sortOptions = [
    { value: "newest", label: "Terbaru", icon: "fa-clock" },
    { value: "popular", label: "Terpopuler", icon: "fa-fire" },
  ];

  return (
    <div style={{ paddingTop: 10 }}>
      {/* Search Header */}
      <div className="section-head" style={{ marginBottom: 16 }}>
        <div>
          <h2>
            <i className="fa-solid fa-magnifying-glass" /> Jelajahi Snippet Kode
          </h2>
          <p>
            {loading
              ? "Memuat koleksi kode..."
              : allCodes.length === 0
              ? "Koleksi kode masih kosong"
              : `Menampilkan ${results.length} dari ${allCodes.length} snippet kode aktif.`}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Cari judul, tag, bahasa, deskripsi..."
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
          />
          {localQ && (
            <button
              type="button"
              onClick={() => setLocalQ("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 6px",
                color: "#888",
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        <div className="filter-triggers" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ minWidth: 160 }}>
            <CustomSelect
              options={categoryOptions}
              value={filterCat}
              onChange={setFilterCat}
              placeholder="Pilih Kategori"
            />
          </div>

          <div style={{ minWidth: 150 }}>
            <CustomSelect
              options={languageOptions}
              value={filterLang}
              onChange={setFilterLang}
              placeholder="Pilih Bahasa"
            />
          </div>

          <div style={{ minWidth: 140 }}>
            <CustomSelect
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Urutkan"
            />
          </div>
        </div>

        {(filterCat !== "Semua" || filterLang !== "all" || localQ) && (
          <button
            type="button"
            onClick={() => {
              setLocalQ("");
              setFilterCat("Semua");
              setFilterLang("all");
            }}
            className="btn btn-sm btn-outline"
          >
            <i className="fa-solid fa-rotate-left" /> Reset Filter
          </button>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="snippets-grid">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
        </div>
      ) : allCodes.length === 0 ? (
        /* Database is genuinely empty */
        <div className="empty-state">
          <i className="fa-solid fa-folder-open" style={{ fontSize: "2.8rem", color: "var(--yellow)" }} />
          <h3>Database Kode Masih Kosong</h3>
          <p>
            Belum ada snippet kode yang dipublikasikan.
            Jadilah developer pertama yang membagikan modul atau kode siap pakai!
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/publish" className="btn btn-primary">
              <i className="fa-solid fa-plus" /> Publikasikan Kode Pertama
            </Link>
            <Link href="/request" className="btn btn-secondary">
              <i className="fa-solid fa-clipboard-question" /> Request Kode
            </Link>
          </div>
        </div>
      ) : results.length === 0 ? (
        /* Filter produced no matching results */
        <div className="empty-state">
          <i className="fa-solid fa-face-sad-tear" />
          <h3>Tidak Ada Hasil yang Cocok</h3>
          <p>Coba gunakan kata kunci yang lebih umum atau ubah opsi filter.</p>
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={() => {
                setLocalQ("");
                setFilterCat("Semua");
                setFilterLang("all");
              }}
              className="btn btn-primary"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>
      ) : (
        <div className="snippets-grid">
          {results.map((code) => (
            <CodeCard key={code.id} code={code} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="skeleton" style={{ height: 260 }} />}>
      <SearchContent />
    </Suspense>
  );
}

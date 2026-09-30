"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Code } from "@/lib/types";
import CodeCard from "@/components/CodeCard";
import CustomSelect from "@/components/CustomSelect";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const rawName = params?.name as string;
  const catName = decodeURIComponent(rawName || "");
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  const loadCodes = useCallback(async () => {
    if (!catName) return;
    try {
      const res = await fetch(`/api/codes?category=${encodeURIComponent(catName)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setCodes(json.data);
        }
      }
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, [catName]);

  useEffect(() => {
    loadCodes();
    const interval = setInterval(loadCodes, 6000);
    return () => clearInterval(interval);
  }, [loadCodes]);

  const sorted = [...codes].sort((a, b) => {
    if (sort === "popular") return (b.views || 0) - (a.views || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortOptions = [
    { value: "newest", label: "Terbaru", icon: "fa-clock" },
    { value: "popular", label: "Terpopuler", icon: "fa-fire" },
  ];

  return (
    <div style={{ paddingTop: 10 }}>
      {/* Category Header */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <Link href="/search" className="btn btn-sm btn-outline">
              <i className="fa-solid fa-arrow-left" /> Semua Kategori
            </Link>
            <span className="category-badge" style={{ fontSize: "0.85rem", padding: "4px 12px" }}>
              <i className="fa-solid fa-folder-open" style={{ marginRight: 6 }} />
              {catName}
            </span>
          </div>
          <h2>Koleksi Kode: {catName}</h2>
          <p>
            {loading
              ? "Memuat koleksi kode..."
              : `Ditemukan ${codes.length} snippet kode dalam kategori ini.`}
          </p>
        </div>

        {codes.length > 0 && (
          <div style={{ minWidth: 150 }}>
            <CustomSelect
              options={sortOptions}
              value={sort}
              onChange={setSort}
              placeholder="Urutkan"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="snippets-grid">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-folder-open" />
          <h3>Belum Ada Kode di Kategori {catName}</h3>
          <p>
            Belum ada snippet kode yang dipublikasikan pada kategori ini.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/publish" className="btn btn-primary">
              <i className="fa-solid fa-plus" /> Publikasikan Kode Baru
            </Link>
            <Link href="/search" className="btn btn-secondary">
              <i className="fa-solid fa-magnifying-glass" /> Jelajahi Kategori Lain
            </Link>
          </div>
        </div>
      ) : (
        <div className="snippets-grid">
          {sorted.map((code) => (
            <CodeCard key={code.id} code={code} />
          ))}
        </div>
      )}
    </div>
  );
}

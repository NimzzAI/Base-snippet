"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { config } from "@/lib/config";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="topbar">
      {/* Hamburger Menu Button */}
      <button
        type="button"
        className="topbar-toggle"
        onClick={onToggleSidebar}
        aria-label="Buka Menu Navigasi"
        title="Buka Menu Navigasi"
      >
        <i className="fa-solid fa-bars" />
      </button>

      {/* Clean Full-width Search Bar */}
      <form onSubmit={handleSearch} className="topbar-search" style={{ maxWidth: 640 }}>
        <i className="fa-solid fa-magnifying-glass" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Cari snippet di ${config.websiteName}...`}
          aria-label="Cari snippet kode"
        />
      </form>
    </header>
  );
}

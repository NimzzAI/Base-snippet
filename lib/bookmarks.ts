"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nimzz_saved_bookmarks_v1";
const EVENT_NAME = "nimzz-bookmarks-changed";

export function getBookmarkedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function isSlugBookmarked(slug: string): boolean {
  if (!slug) return false;
  return getBookmarkedSlugs().includes(slug);
}

export function toggleBookmarkSlug(slug: string): boolean {
  if (typeof window === "undefined" || !slug) return false;
  const current = getBookmarkedSlugs();
  const exists = current.includes(slug);
  const next = exists ? current.filter((s) => s !== slug) : [slug, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  } catch {}
  return !exists;
}

export function clearAllBookmarks(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
  } catch {}
}

export function useBookmarks() {
  const [slugs, setSlugs] = useState<string[]>([]);

  const sync = useCallback(() => {
    setSlugs(getBookmarkedSlugs());
  }, []);

  useEffect(() => {
    sync();
    const handler = () => sync();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, [sync]);

  const toggle = useCallback((slug: string) => {
    return toggleBookmarkSlug(slug);
  }, []);

  return {
    bookmarkedSlugs: slugs,
    count: slugs.length,
    isBookmarked: (slug: string) => slugs.includes(slug),
    toggleBookmark: toggle,
    clearAll: clearAllBookmarks,
  };
}

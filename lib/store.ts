import fs from "fs/promises";
import path from "path";

// Penyimpanan data, pakai Supabase kalau env ada, kalau tidak pakai file lokal
const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DATA_DIR = path.join(process.cwd(), "data");

export class StorageError extends Error {}

export function errMsg(error: unknown, fallback: string): string {
  return error instanceof StorageError ? error.message : fallback;
}

const NOT_READY =
  "Penyimpanan belum aktif. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Vercel, lalu jalankan supabase.sql, lalu redeploy.";

function sbHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    ...extra,
  };
}

async function sbGet<T>(key: string): Promise<{ found: boolean; value?: T }> {
  const url = `${SB_URL}/rest/v1/nimzz_kv?key=eq.${encodeURIComponent(key)}&select=value`;
  const res = await fetch(url, { headers: sbHeaders(), cache: "no-store" });
  if (!res.ok) {
    throw new StorageError(`Supabase gagal dibaca dengan status ${res.status}. Cek tabel nimzz_kv sudah dibuat.`);
  }
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return { found: false };
  return { found: true, value: rows[0].value as T };
}

async function sbSet<T>(key: string, data: T): Promise<void> {
  const res = await fetch(`${SB_URL}/rest/v1/nimzz_kv?on_conflict=key`, {
    method: "POST",
    headers: sbHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify({ key, value: data, updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new StorageError(`Supabase gagal menyimpan dengan status ${res.status}. Cek tabel nimzz_kv sudah dibuat.`);
  }
}

async function localRead<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${key}.json`), "utf-8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function localWrite<T>(key: string, data: T): Promise<void> {
  const file = path.join(DATA_DIR, `${key}.json`);
  const temp = `${file}.tmp.${Date.now()}`;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(temp, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(temp, file);
  } catch {
    throw new StorageError(NOT_READY);
  }
}

export async function storeGet<T>(key: string, fallback: T): Promise<T> {
  if (SB_URL && SB_KEY) {
    const hit = await sbGet<T>(key);
    if (hit.found) return hit.value as T;
    // Belum ada di Supabase, pakai data awal dari file
    return localRead(key, fallback);
  }
  return localRead(key, fallback);
}

export async function storeSet<T>(key: string, data: T): Promise<void> {
  if (SB_URL && SB_KEY) return sbSet(key, data);
  return localWrite(key, data);
}

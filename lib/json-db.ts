import fs from "fs/promises";
import path from "path";
import { Code, CodeRequest, DEFAULT_CATEGORIES } from "./types";
import { config, SiteConfig } from "./config";

type AdminProfile = SiteConfig["admin"];

const DATA_DIR = path.join(process.cwd(), "data");
const CODES_FILE = path.join(DATA_DIR, "codes.json");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const PROFILE_FILE = path.join(DATA_DIR, "admin-profile.json");

// Ensure data directory exists
async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

// Generic safe read
async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      // File doesn't exist yet, write default fallback
      await writeJsonFile(filePath, fallback);
      return fallback;
    }
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

// Generic safe write
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDir();
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(tempPath, content, "utf-8");
  await fs.rename(tempPath, filePath);
}

// ----------------------------------------------------
// CODES
// ----------------------------------------------------

export async function getCodes(): Promise<Code[]> {
  const codes = await readJsonFile<Code[]>(CODES_FILE, []);
  return codes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getCodeBySlug(slug: string): Promise<Code | null> {
  const codes = await getCodes();
  return codes.find((c) => c.slug === slug) || null;
}

export async function getCodeById(id: string): Promise<Code | null> {
  const codes = await getCodes();
  return codes.find((c) => c.id === id) || null;
}

export async function createCode(
  data: Omit<Code, "id"> & { id?: string }
): Promise<Code> {
  const codes = await readJsonFile<Code[]>(CODES_FILE, []);
  const newCode: Code = {
    ...data,
    id: data.id || `code-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    views: data.views || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  codes.unshift(newCode);
  await writeJsonFile(CODES_FILE, codes);
  return newCode;
}

export async function updateCode(
  idOrSlug: string,
  updates: Partial<Code>
): Promise<Code | null> {
  const codes = await readJsonFile<Code[]>(CODES_FILE, []);
  const index = codes.findIndex(
    (c) => c.id === idOrSlug || c.slug === idOrSlug
  );
  if (index === -1) return null;

  codes[index] = {
    ...codes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeJsonFile(CODES_FILE, codes);
  return codes[index];
}

export async function incrementCodeViews(slug: string): Promise<number> {
  const codes = await readJsonFile<Code[]>(CODES_FILE, []);
  const item = codes.find((c) => c.slug === slug);
  if (!item) return 0;
  item.views = (item.views || 0) + 1;
  await writeJsonFile(CODES_FILE, codes);
  return item.views;
}

export async function deleteCode(idOrSlug: string): Promise<boolean> {
  const codes = await readJsonFile<Code[]>(CODES_FILE, []);
  const filtered = codes.filter(
    (c) => c.id !== idOrSlug && c.slug !== idOrSlug
  );
  if (filtered.length === codes.length) return false;
  await writeJsonFile(CODES_FILE, filtered);
  return true;
}

// ----------------------------------------------------
// REQUESTS
// ----------------------------------------------------

export async function getRequests(): Promise<CodeRequest[]> {
  const reqs = await readJsonFile<CodeRequest[]>(REQUESTS_FILE, []);
  return reqs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createRequest(
  data: Omit<CodeRequest, "id"> & { id?: string }
): Promise<CodeRequest> {
  const reqs = await readJsonFile<CodeRequest[]>(REQUESTS_FILE, []);
  const newReq: CodeRequest = {
    ...data,
    id: data.id || `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    status: data.status || "new",
    createdAt: data.createdAt || new Date().toISOString(),
  };

  reqs.unshift(newReq);
  await writeJsonFile(REQUESTS_FILE, reqs);
  return newReq;
}

export async function updateRequestStatus(
  id: string,
  status: CodeRequest["status"]
): Promise<boolean> {
  const reqs = await readJsonFile<CodeRequest[]>(REQUESTS_FILE, []);
  const target = reqs.find((r) => r.id === id);
  if (!target) return false;
  target.status = status;
  await writeJsonFile(REQUESTS_FILE, reqs);
  return true;
}

export async function deleteRequest(id: string): Promise<boolean> {
  const reqs = await readJsonFile<CodeRequest[]>(REQUESTS_FILE, []);
  const filtered = reqs.filter((r) => r.id !== id);
  if (filtered.length === reqs.length) return false;
  await writeJsonFile(REQUESTS_FILE, filtered);
  return true;
}

// ----------------------------------------------------
// CATEGORIES
// ----------------------------------------------------

export async function getCategories(): Promise<string[]> {
  const initial = config.categories || DEFAULT_CATEGORIES;
  const categories = await readJsonFile<string[]>(CATEGORIES_FILE, initial);
  return categories.length > 0 ? categories : initial;
}

export async function addCategory(categoryName: string): Promise<string[]> {
  const trimmed = categoryName.trim();
  if (!trimmed) return await getCategories();

  const categories = await getCategories();
  if (!categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    categories.push(trimmed);
    await writeJsonFile(CATEGORIES_FILE, categories);
  }
  return categories;
}

export async function deleteCategory(categoryName: string): Promise<string[]> {
  const categories = await getCategories();
  const filtered = categories.filter(
    (c) => c.toLowerCase() !== categoryName.toLowerCase()
  );
  await writeJsonFile(CATEGORIES_FILE, filtered);
  return filtered;
}

// ----------------------------------------------------
// ADMIN PROFILE
// ----------------------------------------------------

export async function getAdminProfile(): Promise<AdminProfile> {
  const fallback = config.admin;
  return await readJsonFile<AdminProfile>(PROFILE_FILE, fallback);
}

export async function updateAdminProfile(
  updates: Partial<AdminProfile>
): Promise<AdminProfile> {
  const current = await getAdminProfile();
  const merged: AdminProfile = {
    ...current,
    ...updates,
    socials: {
      ...current.socials,
      ...(updates.socials || {}),
    },
  };
  await writeJsonFile(PROFILE_FILE, merged);
  return merged;
}

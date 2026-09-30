export type UploadKind = "avatar" | "banner" | "thumbnail";

const LIMITS: Record<UploadKind, { maxBytes: number; maxSide: number }> = {
  avatar: { maxBytes: 2 * 1024 * 1024, maxSide: 512 },
  banner: { maxBytes: 4 * 1024 * 1024, maxSide: 1600 },
  thumbnail: { maxBytes: 4 * 1024 * 1024, maxSide: 1280 },
};

function isAllowed(file: File): boolean {
  if (file.type === "image/png" || file.type === "image/jpeg") return true;
  // Beberapa hp tidak mengisi tipe file, cek dari nama
  return !file.type && /\.(png|jpe?g)$/i.test(file.name);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca"));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

// Kecilkan gambar dulu supaya foto dari hp tidak kegedean
async function shrink(file: File, kind: UploadKind): Promise<File> {
  const { maxBytes, maxSide } = LIMITS[kind];
  const img = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung proses gambar");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const wantPng = file.type === "image/png";
  let blob = await toBlob(canvas, wantPng ? "image/png" : "image/jpeg", 0.88);
  let type = wantPng ? "image/png" : "image/jpeg";

  if (!blob || blob.size > maxBytes) {
    blob = await toBlob(canvas, "image/jpeg", 0.8);
    type = "image/jpeg";
  }
  if (!blob || blob.size > maxBytes) {
    blob = await toBlob(canvas, "image/jpeg", 0.6);
    type = "image/jpeg";
  }
  if (!blob || blob.size > maxBytes) {
    throw new Error(`Ukuran gambar maksimal ${maxBytes / (1024 * 1024)} MB`);
  }

  const ext = type === "image/png" ? "png" : "jpg";
  return new File([blob], `${kind}.${ext}`, { type });
}

export async function uploadImage(file: File, kind: UploadKind): Promise<string> {
  if (!isAllowed(file)) {
    throw new Error("Hanya gambar png atau jpg");
  }

  const ready = await shrink(file, kind);
  const form = new FormData();
  form.append("file", ready);
  form.append("kind", kind);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok || !json.url) {
    throw new Error(json?.error || "Gagal upload gambar");
  }
  return json.url as string;
}

// Upload gambar ke AceImg, gratis dan tanpa API key
const UPLOAD_URL = process.env.ACEIMG_API_URL || "https://api.aceimg.com/api/upload";

function makeVisitorId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getFileId(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/f=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function uploadToAceImg(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; fileId: string }> {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), filename);

  const res = await fetch(`${UPLOAD_URL}?visitorId=${makeVisitorId()}`, {
    method: "POST",
    body: form,
    redirect: "manual",
    headers: {
      Referer: "https://aceimg.com/",
      Origin: "https://aceimg.com",
      Accept: "application/json",
    },
  });

  let fileId = getFileId(res.headers.get("location"));

  if (!fileId && res.status >= 200 && res.status < 300) {
    const data = await res.json().catch(() => null);
    fileId = getFileId(data?.link ?? null);
  }

  if (!fileId) {
    throw new Error(`Upload ke AceImg gagal dengan status ${res.status}`);
  }

  return { url: `https://cdn.aceimg.com/${fileId}`, fileId };
}

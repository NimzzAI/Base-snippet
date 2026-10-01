import { ImageResponse } from "next/og";
import { getCodeBySlug } from "@/lib/json-db";
import { config } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gambar preview share otomatis untuk kode yang tidak punya thumbnail
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  let title = config.websiteName;
  let category = "";
  let language = "";
  let author = config.admin.displayName;
  let firstLines: string[] = [];

  try {
    const item = await getCodeBySlug(decodeURIComponent(params.slug));
    if (item) {
      title = item.title;
      category = item.category || "Umum";
      language = item.language || "code";
      author = item.authorName || author;
      firstLines = (item.code || "")
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, 6)
        .map((l) => (l.length > 54 ? `${l.slice(0, 51)}...` : l));
    }
  } catch {}

  const shortTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#00ffa4",
          padding: 48,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          {category ? (
            <div
              style={{
                display: "flex",
                background: "#FFE600",
                color: "#000",
                border: "4px solid #000",
                borderRadius: 14,
                padding: "8px 22px",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              {category}
            </div>
          ) : null}
          {language ? (
            <div
              style={{
                display: "flex",
                background: "#2563EB",
                color: "#fff",
                border: "4px solid #000",
                borderRadius: 14,
                padding: "8px 22px",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              {language}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 900,
              color: "#000",
              lineHeight: 1.1,
            }}
          >
            {shortTitle}
          </div>
          {firstLines.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#181818",
                border: "4px solid #000",
                borderRadius: 18,
                padding: "20px 26px",
                boxShadow: "8px 8px 0 #000",
              }}
            >
              {firstLines.map((l, i) => (
                <div
                  key={i}
                  style={{ display: "flex", color: "#d4d4d4", fontSize: 24, lineHeight: 1.5 }}
                >
                  {l}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 800,
            color: "#000",
          }}
        >
          <div style={{ display: "flex" }}>{config.websiteName}</div>
          <div style={{ display: "flex" }}>oleh {author}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

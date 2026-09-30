import { getCodeBySlug } from "@/lib/json-db";
import { LANG_EXTENSIONS } from "@/lib/types";
import { SITE_URL } from "@/lib/public-api";
import VSCodeViewer from "@/components/VSCodeViewer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Embed",
  robots: { index: false, follow: false },
};

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let item = null;
  try {
    item = await getCodeBySlug(slug);
  } catch {}

  const shell: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    background: "#181818",
    color: "#d4d4d4",
    fontFamily: "system-ui, sans-serif",
  };

  if (!item) {
    return (
      <div style={{ ...shell, alignItems: "center", justifyContent: "center" }}>
        Snippet kode tidak ditemukan.
      </div>
    );
  }

  const ext = LANG_EXTENSIONS[item.language] || "txt";

  return (
    <div style={shell}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 14px",
          background: "#000",
          borderBottom: "2px solid #00ffa4",
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.title}
        </span>
        <a
          href={`${SITE_URL}/code/${item.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#00ffa4", textDecoration: "none", fontWeight: 700, flexShrink: 0 }}
        >
          Nimzz Code
        </a>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <VSCodeViewer
          code={item.code || ""}
          language={item.language}
          filename={`${item.slug}.${ext}`}
          maxHeight="none"
          showTabs={false}
          showStatusBar={false}
          showActions={true}
        />
      </div>
    </div>
  );
}

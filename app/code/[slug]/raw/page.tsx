import { getCodeBySlug } from "@/lib/json-db";

export const dynamic = "force-dynamic";

export default async function RawPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let code = "";
  try {
    const item = await getCodeBySlug(slug);
    if (item) {
      code = item.code || "";
    }
  } catch {}

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0d0d0d",
        color: "#d4d4d4",
        zIndex: 99999,
        padding: "20px",
        overflow: "auto",
        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
        fontSize: "13px",
        lineHeight: 1.65,
        whiteSpace: "pre",
      }}
    >
      <pre style={{ margin: 0, font: "inherit" }}>
        {code || "// Snippet kode tidak ditemukan."}
      </pre>
    </div>
  );
}

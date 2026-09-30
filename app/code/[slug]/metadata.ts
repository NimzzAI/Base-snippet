import { getCodeBySlug } from "@/lib/json-db";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const item = await getCodeBySlug(slug);
    if (!item) return { title: "Not Found" };
    return {
      title: `${item.title || slug} - Share Code`,
      description: item.description || "View shared code snippet",
    };
  } catch {
    return { title: "Share Code" };
  }
}

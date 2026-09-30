import { getAdminProfile } from "@/lib/json-db";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  try {
    const { username } = await params;
    const admin = await getAdminProfile();
    if (admin.username.toLowerCase() === username.toLowerCase()) {
      return {
        title: `${admin.displayName} (@${admin.username}) - Profil Developer`,
        description: admin.bio || `Profil developer @${admin.username}`,
      };
    }
    return {
      title: `@${username} - Nimzz Code`,
      description: `Profil @${username} di Nimzz Code`,
    };
  } catch {
    return { title: "Profil Pengguna - Nimzz Code" };
  }
}

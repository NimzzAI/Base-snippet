import { getAdminProfile } from "@/lib/json-db";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  try {
    const username = decodeURIComponent(params.username);
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

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}

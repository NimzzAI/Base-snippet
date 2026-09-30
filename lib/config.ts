// ============================================================
//  NIMZZ CODE — CENTRAL CONFIGURATION
//  Semua konfigurasi nama, author, branding, dan security terpusat di sini.
//  Jika nilai di sini diubah, seluruh website otomatis menyesuaikan.
// ============================================================

export interface SiteConfig {
  name: string;
  websiteName: string;
  description: string;
  tagline: string;
  siteUrl: string;
  author: string;
  branding: {
    logoPrefix: string;
    logoSuffix: string;
    footerText: string;
  };
  admin: {
    username: string;
    defaultPasswordFallback: string;
    displayName: string;
    bio: string;
    photoURL: string;
    banner: string;
    socials: {
      whatsapp: string;
      github: string;
      telegram: string;
      tiktok: string;
    };
  };
  categories: string[];
  security: {
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    sessionDurationHours: number;
    maxCodeSizeKB: number;
  };
}

export const DEFAULT_AVATAR = "/avatar-default.png";

export const config: SiteConfig = {
  name: "Nimzz",
  websiteName: "Nimzz Code",
  description: "Platform berbagi snippet dan modul kode pemrograman untuk developer.",
  tagline: "Platform berbagi kode pemrograman",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://base-snippet.vercel.app",
  author: "Nimzz",
  branding: {
    logoPrefix: "nimzz",
    logoSuffix: ".code",
    footerText: "Crafted by Nimzz",
  },
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    defaultPasswordFallback: process.env.ADMIN_PASSWORD || "admin123",
    displayName: "Nimzz Admin",
    bio: "Pengelola platform Nimzz Code.",
    photoURL: "/avatar-default.png",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    socials: {
      whatsapp: "https://whatsapp.com/channel/0029VaNimzzCodeOfficial",
      github: "NimzzAI",
      telegram: "nimzz_dev",
      tiktok: "nimzz_code",
    },
  },
  categories: [
    "Tools",
    "Bot",
    "Web",
    "Script",
  ],
  security: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    sessionDurationHours: 24,
    maxCodeSizeKB: 512,
  },
};

export default config;

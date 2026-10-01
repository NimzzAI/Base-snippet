import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import AppShell from "@/components/AppShell";
import ToastProvider from "@/components/ToastProvider";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { config } from "@/lib/config";

export const viewport: Viewport = {
  themeColor: "#00ffa4",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: `${config.websiteName} — ${config.tagline}`,
    template: `%s — ${config.websiteName}`,
  },
  description: config.description,
  keywords: [
    "code sharing", "developer", "snippet", "programming",
    "javascript", "python", "nodejs", config.name.toLowerCase(), "neo brutalism",
  ],
  authors: [{ name: config.author, url: config.siteUrl }],
  creator: config.author,
  publisher: config.websiteName,
  metadataBase: new URL(config.siteUrl),

  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32.png",
  },
  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: config.siteUrl,
    siteName: config.websiteName,
    title: `${config.websiteName} — ${config.tagline}`,
    description: config.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${config.websiteName} — ${config.description}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${config.websiteName} — ${config.tagline}`,
    description: config.description,
    images: ["/og-image.png"],
    creator: `@${config.admin.username}`,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <AuthProvider>
          <MaintenanceGuard>
            <ToastProvider />
            <AppShell>{children}</AppShell>
          </MaintenanceGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

const settings = require("./settings");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Always allow Firebase Storage & Google avatars
      ...settings.security.allowedImageDomains.map(hostname => ({
        protocol: "https",
        hostname,
      })),
      // Fallback wildcard for dev
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

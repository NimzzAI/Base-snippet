import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/public-api";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/edit", "/publish", "/embed"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

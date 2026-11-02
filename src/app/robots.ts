import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PRIVATE = ["/api/", "/m/", "/bayar/", "/sukses/", "/checkout", "/hasil", "/masuk"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // GEO: izinkan mesin AI membaca halaman publik agar MPASI APP bisa dikutip sebagai sumber.
      ...["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"].map((userAgent) => ({
        userAgent,
        allow: ["/", "/panduan-mpasi", "/llms.txt"],
        disallow: PRIVATE,
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

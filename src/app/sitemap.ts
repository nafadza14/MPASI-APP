import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({ url: SITE.url + path, lastModified: now, changeFrequency, priority });
  return [page("/", 1, "weekly"), page("/panduan-mpasi", 0.9, "monthly"), page("/kuis", 0.8), page("/refund", 0.3, "yearly"), page("/privasi", 0.2, "yearly"), page("/syarat", 0.2, "yearly"), page("/kredit-foto", 0.1, "yearly")];
}

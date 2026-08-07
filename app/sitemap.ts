import type { MetadataRoute } from "next";
import { supabaseServer } from "@/lib/supabase-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const { data: profiles } = await supabaseServer
    .from("profiles")
    .select("slug, updated_at")
    .eq("is_published", true);

  const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${baseUrl}/perfil/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const { data: categories } = await supabaseServer
    .from("categories")
    .select("slug, name");

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${baseUrl}/categoria/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...profileRoutes, ...categoryRoutes];
}

import type { MetadataRoute } from "next";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  let profileRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabaseServer = getSupabaseServerClient();

    const { data: profiles } = await supabaseServer
      .from("profiles")
      .select("slug, updated_at")
      .eq("is_published", true);

    profileRoutes = (profiles ?? []).map((p) => ({
      url: `${baseUrl}/perfil/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const { data: categories } = await supabaseServer
      .from("categories")
      .select("slug, name");

    categoryRoutes = (categories ?? []).map((c) => ({
      url: `${baseUrl}/categoria/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Si no hay env vars en build time, devolver solo rutas estáticas
  }

  return [...staticRoutes, ...profileRoutes, ...categoryRoutes];
}

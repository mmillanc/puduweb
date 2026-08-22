import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/sobre-nosotros`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  let profileRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const supabaseServer = getSupabaseServerClient();

    const { data: profiles } = await supabaseServer
      .from("profiles")
      .select("slug, updated_at")
      .eq("is_published", true);

    profileRoutes = (profiles ?? []).map((p) => ({
      url: `${baseUrl}/${p.slug}`,
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

    const { data: posts } = await supabaseServer
      .from("blog_posts")
      .select("slug, updated_at, published_at, is_published")
      .eq("is_published", true);

    blogRoutes = (posts ?? []).map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date((p.updated_at as string) ?? (p.published_at as string) ?? new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    // Si no hay env vars en build time, devolver solo rutas estáticas
  }

  return [...staticRoutes, ...profileRoutes, ...categoryRoutes, ...blogRoutes];
}

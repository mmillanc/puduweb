import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { Profile, Category } from "@/lib/types";
import { ProfileCard } from "@/components/profile-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Heart,
  Hammer,
  Laptop,
  GraduationCap,
  Scissors,
  Utensils,
  Car,
  Scale,
  Home,
  Dumbbell,
  Palette,
  Tag,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  hammer: Hammer,
  laptop: Laptop,
  "graduation-cap": GraduationCap,
  scissors: Scissors,
  utensils: Utensils,
  car: Car,
  scale: Scale,
  home: Home,
  dumbbell: Dumbbell,
  palette: Palette,
  tag: Tag,
};

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const { getSupabaseServerClient } = await import("@/lib/supabase-server");
    const supabaseServer = getSupabaseServerClient();
    const { data } = await supabaseServer.from("categories").select("slug");
    return (data ?? []).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { getSupabaseServerClient } = await import("@/lib/supabase-server");
  const supabaseServer = getSupabaseServerClient();
  const { data } = await supabaseServer
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return { title: "Categoría no encontrada" };
  }

  const cat = data as Category;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const seoTitle =
    cat.seo_title && cat.seo_title.trim().length > 0
      ? cat.seo_title
      : `${cat.name} - Profesionales y pymes en Chile`;

  const seoDescription =
    cat.seo_description && cat.seo_description.trim().length > 0
      ? cat.seo_description
      : `Directorio de profesionales, pymes y vendedores en la categoría ${cat.name}. Encuentra servicios cerca de ti en Chile.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: `${baseUrl}/categoria/${cat.slug}` },
    openGraph: {
      title: `${seoTitle} | PuduWeb`,
      description: seoDescription,
      type: "website",
      locale: "es_CL",
      siteName: "PuduWeb",
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = await params;
  const selectedCity =
    typeof searchParams?.city === "string" ? searchParams.city : "";
  const selectedRegion =
    typeof searchParams?.region === "string" ? searchParams.region : "";

  const { getSupabaseServerClient } = await import("@/lib/supabase-server");
  const supabaseServer = getSupabaseServerClient();
  const { data: catData } = await supabaseServer
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!catData) notFound();

  const category = catData as Category;
  const Icon = iconMap[category.icon ?? "tag"] ?? Tag;

  let profilesQuery = supabaseServer
    .from("profiles")
    .select("*, category:categories(*)")
    .eq("is_published", true)
    .eq("category_id", category.id)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);

  if (selectedCity) {
    profilesQuery = profilesQuery.eq("city", selectedCity);
  }

  if (selectedRegion) {
    profilesQuery = profilesQuery.eq("region", selectedRegion);
  }

  const { data: profilesData } = await profilesQuery;

  const profiles = (profilesData as Profile[]) ?? [];

  const { data: locationsData } = await supabaseServer
    .from("profiles")
    .select("city, region")
    .eq("is_published", true)
    .eq("category_id", category.id);

  const cities = Array.from(
    new Set(
      (locationsData ?? [])
        .map((p: any) => (p.city as string | null) ?? "")
        .filter((c) => c && c.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const regions = Array.from(
    new Set(
      (locationsData ?? [])
        .map((p: any) => (p.region as string | null) ?? "")
        .filter((r) => r && r.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const seoTitle =
    category.seo_title && category.seo_title.trim().length > 0
      ? category.seo_title
      : `${category.name} - Profesionales y pymes en Chile`;

  const seoDescription =
    category.seo_description && category.seo_description.trim().length > 0
      ? category.seo_description
      : `Directorio de profesionales, pymes y vendedores en la categoría ${category.name}. Encuentra servicios cerca de ti en Chile.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${seoTitle} | PuduWeb`,
    description: seoDescription,
    url: `${baseUrl}/categoria/${category.slug}`,
    hasPart: profiles.map((p) => ({
      "@type": "LocalBusiness",
      name: p.name,
      url: `${baseUrl}/${p.slug}`,
      ...(p.city && { address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "CL" } }),
    })),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: "Categorías", href: "/categorias" },
                { label: category.name },
              ]}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{category.name}</h1>
              <p className="mt-1 text-muted-foreground">
                {profiles.length} {profiles.length === 1 ? "perfil" : "perfiles"} en esta categoría
              </p>
              {category.intro_text && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.intro_text}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtros + Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {(cities.length > 0 || regions.length > 0) && (
          <div className="mb-6 rounded-xl border bg-card p-4">
            <form className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Ciudad
                </label>
                <select
                  name="city"
                  defaultValue={selectedCity}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Región
                </label>
                <select
                  name="region"
                  defaultValue={selectedRegion}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todas las regiones</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Aplicar filtros
                </button>
                {(selectedCity || selectedRegion) && (
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    Limpiar
                  </Link>
                )}
              </div>
            </form>
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="rounded-xl border p-12 text-center">
            <p className="text-muted-foreground">
              No hay perfiles en esta categoría todavía.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Ver todos los perfiles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

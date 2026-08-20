import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import type { Metadata } from "next";
import type { Profile, Review } from "@/lib/types";
import type { ComponentType } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { ShareButton } from "@/components/share-button";
import { ProfileCard } from "@/components/profile-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { getSizedImageUrl } from "@/lib/utils";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  User,
  Building2,
  Store,
  Star,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaXTwitter,
  FaWhatsapp,
  FaTiktok,
} from "react-icons/fa6";

const typeConfig = {
  profesional: { label: "Profesional", icon: User },
  pyme: { label: "Pyme", icon: Building2 },
  vendedor: { label: "Vendedor", icon: Store },
};

const ReviewsSection = dynamicImport(
  () => import("@/components/reviews-section").then((m) => m.ReviewsSection),
  {
    loading: () => null,
  },
);

const ContactForm = dynamicImport(
  () => import("@/components/contact-form").then((m) => m.ContactForm),
  {
    loading: () => null,
  },
);

const ViewTracker = dynamicImport(
  () => import("@/components/view-tracker").then((m) => m.ViewTracker),
  {
    loading: () => null,
  },
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { getSupabaseServerClient } = await import("@/lib/supabase-server");
  const supabaseServer = getSupabaseServerClient();
  const { data } = await supabaseServer
    .from("profiles")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) {
    return { title: "Perfil no encontrado | PuduWeb" };
  }

  const profile = data as Profile;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fallbackTitle = `${profile.name} - ${profile.tagline ?? "Perfil"}`;
  const seoTitle =
    profile.seo_title && profile.seo_title.trim().length > 0
      ? profile.seo_title
      : fallbackTitle;

  const fallbackDescription =
    profile.description ??
    `${profile.name} - ${profile.tagline ?? "Profesional"} en ${profile.city ?? "Chile"}`;

  const seoDescription =
    profile.seo_description && profile.seo_description.trim().length > 0
      ? profile.seo_description
      : fallbackDescription;
  const image = profile.cover_url ?? profile.avatar_url ?? undefined;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: `${baseUrl}/${profile.slug}` },
    openGraph: {
      title: `${seoTitle} | PuduWeb`,
      description: seoDescription,
      type: "profile",
      url: `${baseUrl}/${profile.slug}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: profile.name }] : undefined,
      locale: "es_CL",
      siteName: "PuduWeb",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { getSupabaseServerClient } = await import("@/lib/supabase-server");
  const supabaseServer = getSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    console.error("Profile page error:", error.message, "slug:", slug);
  }

  if (!data) notFound();

  const profile = data as Profile;
  const typeInfo = typeConfig[profile.type];
  const TypeIcon = typeInfo.icon;
  const blurDataURL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23e5e7eb'/%3E%3C/svg%3E";

  const normalizeSocialUrl = (platform: string, raw: string): string => {
    const trimmed = raw.trim();

    if (!trimmed) return "";

    // Si ya parece una URL completa, la usamos tal cual (añadiendo https:// si falta protocolo)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    const value = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

    switch (platform) {
      case "instagram":
        return `https://instagram.com/${value}`;
      case "facebook":
        return `https://facebook.com/${value}`;
      case "linkedin":
        return `https://www.linkedin.com/in/${value}`;
      case "twitter":
        // X/Twitter
        return `https://x.com/${value}`;
      case "tiktok":
        return `https://www.tiktok.com/@${value}`;
      default:
        // Fallback genérico
        return `https://${value}`;
    }
  };

  let related: Profile[] = [];
  if (profile.category_id) {
    const { data: relatedData } = await supabaseServer
      .from("profiles")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .eq("category_id", profile.category_id)
      .neq("id", profile.id)
      .order("featured", { ascending: false })
      .limit(4);
    related = (relatedData as Profile[]) ?? [];
  }

  const socials = [
    profile.instagram && {
      url: normalizeSocialUrl("instagram", profile.instagram),
      icon: FaInstagram,
      label: "Instagram",
      color: "hover:bg-[#E4405F] hover:border-[#E4405F] hover:text-white",
    },
    profile.facebook && {
      url: normalizeSocialUrl("facebook", profile.facebook),
      icon: FaFacebookF,
      label: "Facebook",
      color: "hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white",
    },
    profile.linkedin && {
      url: normalizeSocialUrl("linkedin", profile.linkedin),
      icon: FaLinkedinIn,
      label: "LinkedIn",
      color: "hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white",
    },
    profile.twitter && {
      url: normalizeSocialUrl("twitter", profile.twitter),
      icon: FaXTwitter,
      label: "Twitter",
      color: "hover:bg-black hover:border-black hover:text-white",
    },
    profile.whatsapp && {
      url: normalizeSocialUrl("whatsapp", profile.whatsapp),
      icon: FaWhatsapp,
      label: "WhatsApp",
      color: "hover:bg-[#25D366] hover:border-[#25D366] hover:text-white",
    },
    profile.tiktok && {
      url: normalizeSocialUrl("tiktok", profile.tiktok),
      icon: FaTiktok,
      label: "TikTok",
      color: "hover:bg-black hover:border-black hover:text-white",
    },
  ].filter(Boolean) as {
    url: string;
    icon: ComponentType<{ size?: number }>;
    label: string;
    color: string;
  }[];

  const services = profile.services
    ? profile.services.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const { data: reviewsData } = await supabaseServer
    .from("reviews")
    .select("rating, comment, author_name, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as Review[]) ?? [];
  const ratings = reviews.map((r) => r.rating).filter((r) => typeof r === "number");
  const hasRatings = ratings.length > 0;
  const averageRating = hasRatings
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const profileUrl = `${baseUrl}/${profile.slug}`;

  const seoDescriptionLd =
    profile.seo_description && profile.seo_description.trim().length > 0
      ? profile.seo_description
      : profile.description ?? profile.tagline ?? "";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": profile.type === "pyme" ? "LocalBusiness" : "ProfessionalService",
    name: profile.name,
    description: seoDescriptionLd,
    url: profileUrl,
    ...(profile.avatar_url && { image: profile.avatar_url }),
    ...(profile.phone && { telephone: profile.phone }),
    ...(profile.email && { email: profile.email }),
    ...(profile.website && { sameAs: [profile.website.startsWith("http") ? profile.website : `https://${profile.website}`] }),
    ...(profile.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: profile.address,
        addressLocality: profile.city ?? "",
        addressRegion: profile.region ?? "",
        addressCountry: "CL",
      },
    }),
    ...(profile.city && {
      areaServed: profile.city,
    }),
    ...(services.length > 0 && { makesOffer: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })) }),
    ...(hasRatings && averageRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(averageRating.toFixed(1)),
        reviewCount: ratings.length,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 10).map((r) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
        },
        ...(r.author_name && {
          author: {
            "@type": "Person",
            name: r.author_name,
          },
        }),
        ...(r.created_at && { datePublished: r.created_at }),
        ...(r.comment && { reviewBody: r.comment }),
      })),
    }),
    ...(profile.hours && { openingHours: profile.hours }),
  };

  const socialLinks = socials.map((s) => s.url);
  if (socialLinks.length > 0) {
    jsonLd.sameAs = [...(jsonLd.sameAs as string[] ?? []), ...socialLinks];
  }

  const hasLocationForMap = Boolean(profile.address || profile.city || profile.region);
  const mapQuery = hasLocationForMap
    ? [profile.address, profile.city, profile.region, "Chile"].filter(Boolean).join(", ")
    : null;
  const mapUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null;

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "Categorías", href: "/categorias" },
            ...(profile.category
              ? [{ label: profile.category.name, href: `/categoria/${profile.category.slug}` }]
              : []),
            { label: profile.name },
          ]}
        />
      </div>

      {/* Cover */}
      <div className="relative h-56 w-full bg-gradient-to-br from-primary/20 to-primary/5 sm:h-72">
        {profile.cover_url && (
          <Image
            src={getSizedImageUrl(profile.cover_url, "l")}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        )}
        <div className="absolute left-4 top-4 sm:left-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-background"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="-mt-16 flex flex-col items-center gap-4 sm:-mt-20 sm:flex-row sm:items-end">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted sm:h-40 sm:w-40">
            {profile.avatar_url ? (
              <Image
                src={getSizedImageUrl(profile.avatar_url, "m")}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="160px"
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <TypeIcon size={48} />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold sm:text-3xl">{profile.name}</h1>
              {profile.featured && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-yellow-900 dark:bg-yellow-500 dark:text-yellow-950">
                  <Star size={12} fill="currentColor" />
                  Destacado
                </span>
              )}
            </div>
            {profile.tagline && (
              <p className="mt-1 text-muted-foreground">{profile.tagline}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                <TypeIcon size={12} />
                {typeInfo.label}
              </span>
              {profile.category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {profile.category.name}
                </span>
              )}
              {profile.city && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {profile.city}
                  {profile.region ? `, ${profile.region}` : ""}
                </span>
              )}
              <FavoriteButton profileId={profile.id} />
              <ShareButton profileName={profile.name} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Main column */}
          <div className="space-y-8 sm:col-span-2">
            {profile.description && (
              <section>
                <h2 className="mb-3 text-xl font-semibold">Acerca de</h2>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {profile.description}
                </p>
              </section>
            )}

            {services.length > 0 && (
              <section>
                <h2 className="mb-3 text-xl font-semibold">Servicios</h2>
                <div className="flex flex-wrap gap-2">
                  {services.map((service, i) => (
                    <span
                      key={i}
                      className="rounded-lg border bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {profile.gallery_urls && profile.gallery_urls.length > 0 && (
              <section>
                <h2 className="mb-3 text-xl font-semibold">Galería</h2>
                <GalleryLightbox
                  images={profile.gallery_urls}
                  profileName={profile.name}
                />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4 font-semibold">Contacto</h3>
              <div className="space-y-3">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-3 text-sm hover:text-primary"
                  >
                    <Phone size={16} className="text-muted-foreground" />
                    {profile.phone}
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary"
                  >
                    <Mail size={16} className="text-muted-foreground" />
                    {profile.email}
                  </a>
                )}
                {profile.website && (
                  <a
                    href={
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-primary"
                  >
                    <Globe size={16} className="text-muted-foreground" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {profile.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-muted-foreground"
                    />
                    {profile.address}
                  </div>
                )}
                {profile.hours && (
                  <div className="flex items-start gap-3 text-sm">
                    <Clock
                      size={16}
                      className="mt-0.5 shrink-0 text-muted-foreground"
                    />
                    {profile.hours}
                  </div>
                )}
              </div>

              {mapUrl && (
                <div className="mt-5">
                  <h4 className="mb-2 text-sm font-semibold">Ubicación en el mapa</h4>
                  <div className="overflow-hidden rounded-lg border">
                    <iframe
                      src={mapUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-48 w-full border-0"
                    />
                  </div>
                </div>
              )}

              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <FaWhatsapp size={16} />
                  WhatsApp
                </a>
              )}
            </div>

            {/* Social */}
            {socials.length > 0 && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-4 font-semibold">Redes sociales</h3>
                <div className="flex flex-wrap gap-3">
                  {socials.map(({ url, icon: Icon, label, color }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${color}`}
                      aria-label={label}
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Contact form */}
            <ContactForm profileId={profile.id} profileName={profile.name} />
          </div>
        </div>

        <ReviewsSection profileId={profile.id} profileName={profile.name} />

        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">
              Más en {profile.category?.name ?? "esta categoría"}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rp) => (
                <ProfileCard key={rp.id} profile={rp} />
              ))}
            </div>
          </section>
        )}

        <div className="h-12" />
      </div>

      <ViewTracker profileId={profile.id} />
    </div>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Profile } from "@/lib/types";
import { ReviewsSection } from "@/components/reviews-section";
import { FavoriteButton } from "@/components/favorite-button";
import { ViewTracker } from "@/components/view-tracker";
import { ContactForm } from "@/components/contact-form";
import { ShareButton } from "@/components/share-button";
import { ProfileCard } from "@/components/profile-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Camera,
  Users,
  Briefcase,
  Hash,
  MessageCircle,
  ArrowLeft,
  User,
  Building2,
  Store,
  Star,
} from "lucide-react";

const typeConfig = {
  profesional: { label: "Profesional", icon: User },
  pyme: { label: "Pyme", icon: Building2 },
  vendedor: { label: "Vendedor", icon: Store },
};

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const supabaseServer = getSupabaseServerClient();
    const { data } = await supabaseServer
      .from("profiles")
      .select("slug")
      .eq("is_published", true);
    return (data ?? []).map((p) => ({ slug: p.slug }));
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
  const title = `${profile.name} - ${profile.tagline ?? "Perfil"} | PuduWeb`;
  const description =
    profile.description ??
    `${profile.name} - ${profile.tagline ?? "Profesional"} en ${profile.city ?? "Chile"}`;
  const image = profile.cover_url ?? profile.avatar_url ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/perfil/${profile.slug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${baseUrl}/perfil/${profile.slug}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: profile.name }] : undefined,
      locale: "es_CL",
      siteName: "PuduWeb",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const supabaseServer = getSupabaseServerClient();
  const { data } = await supabaseServer
    .from("profiles")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) notFound();

  const profile = data as Profile;
  const typeInfo = typeConfig[profile.type];
  const TypeIcon = typeInfo.icon;

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
    { url: profile.instagram, icon: Camera, label: "Instagram" },
    { url: profile.facebook, icon: Users, label: "Facebook" },
    { url: profile.linkedin, icon: Briefcase, label: "LinkedIn" },
    { url: profile.twitter, icon: Hash, label: "Twitter" },
    { url: profile.whatsapp, icon: MessageCircle, label: "WhatsApp" },
  ].filter((s) => s.url);

  const services = profile.services
    ? profile.services.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen">
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
            src={profile.cover_url}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
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
                src={profile.avatar_url}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="160px"
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
                <span className="flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-yellow-900">
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {profile.gallery_urls.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <Image
                        src={url}
                        alt={`${profile.name} - imagen ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    </div>
                  ))}
                </div>
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

              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              )}
            </div>

            {/* Social */}
            {socials.length > 0 && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-4 font-semibold">Redes sociales</h3>
                <div className="flex flex-wrap gap-3">
                  {socials.map(({ url, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={
                        url!.startsWith("http") ? url! : `https://${url!}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border hover:border-primary hover:text-primary transition-colors"
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type":
              profile.type === "pyme"
                ? "LocalBusiness"
                : "ProfessionalService",
            name: profile.name,
            description: profile.description ?? profile.tagline ?? undefined,
            image: profile.cover_url ?? profile.avatar_url ?? undefined,
            url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/perfil/${profile.slug}`,
            telephone: profile.phone ?? undefined,
            email: profile.email ?? undefined,
            address: profile.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: profile.address,
                  addressLocality: profile.city ?? undefined,
                  addressRegion: profile.region ?? undefined,
                }
              : undefined,
            priceRange: undefined,
            openingHours: profile.hours ?? undefined,
            sameAs: [
              profile.instagram,
              profile.facebook,
              profile.linkedin,
              profile.twitter,
              profile.website,
            ].filter(Boolean),
          }),
        }}
      />
    </div>
  );
}

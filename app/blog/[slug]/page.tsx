import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { BlogPost } from "@/lib/types";
import { getSizedImageUrl, estimateReadingTimeMinutes } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const supabaseServer = getSupabaseServerClient();
    const { data } = await supabaseServer
      .from("blog_posts")
      .select("slug")
      .eq("is_published", true);

    return (data ?? []).map((p) => ({ slug: p.slug as string }));
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
    .from("blog_posts")
    .select("title, seo_title, seo_description, excerpt, slug, updated_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) {
    return { title: "Artículo no encontrado | PuduWeb" };
  }

  const post = data as BlogPost;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const fallbackTitle = post.title;
  const seoTitle = post.seo_title && post.seo_title.trim().length > 0 ? post.seo_title : fallbackTitle;

  const fallbackDescription =
    post.seo_description && post.seo_description.trim().length > 0
      ? post.seo_description
      : post.excerpt ?? "Artículo del blog de PuduWeb";

  return {
    title: seoTitle,
    description: fallbackDescription,
    alternates: { canonical: `${baseUrl}/blog/${post.slug}` },
    openGraph: {
      title: `${seoTitle} | PuduWeb`,
      description: fallbackDescription,
      type: "article",
      url: `${baseUrl}/blog/${post.slug}`,
      locale: "es_CL",
      siteName: "PuduWeb",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabaseServer = getSupabaseServerClient();
  const { data } = await supabaseServer
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) notFound();

  const post = data as BlogPost;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const readingTimeMinutes = estimateReadingTimeMinutes(post.content);

  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const wordCount = post.content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    url: `${baseUrl}/blog/${post.slug}`,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    wordCount,
    timeRequired: `PT${readingTimeMinutes}M`,
    author: post.author_name
      ? {
          "@type": "Person",
          name: post.author_name,
        }
      : undefined,
  };

  const blurDataURL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23e5e7eb'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            Inicio
          </Link>{" "}
          /{" "}
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>{" "}
          / <span className="text-foreground">{post.title}</span>
        </nav>

        {post.cover_url && (
          <div className="mb-6 overflow-hidden rounded-xl border bg-muted">
            <div className="relative h-56 w-full sm:h-72">
              <Image
                src={getSizedImageUrl(post.cover_url, "l")}
                alt={post.title}
                fill
                className="object-cover"
                sizes="100vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold sm:text-3xl">{post.title}</h1>
        {publishedLabel && (
          <p className="mt-2 text-xs text-muted-foreground">
            Publicado el {publishedLabel} · ~{readingTimeMinutes} min de lectura
          </p>
        )}
        {post.author_name && (
          <p className="mt-1 text-xs text-muted-foreground">Por {post.author_name}</p>
        )}
        {post.excerpt && (
          <p className="mt-4 text-sm text-muted-foreground">{post.excerpt}</p>
        )}

        <div className="mt-6 border-t pt-6 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </div>
  );
}

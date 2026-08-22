import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { BlogPost } from "@/lib/types";
import { getSizedImageUrl } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog de PuduWeb",
  description:
    "Consejos y guías para profesionales, pymes y vendedores en Chile. Aprende marketing local, presencia online y cómo aprovechar PuduWeb.",
};

async function getPosts(): Promise<BlogPost[]> {
  const supabaseServer = getSupabaseServerClient();
  const { data } = await supabaseServer
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_url, published_at, author_name")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(24);

  return (data as BlogPost[] | null) ?? [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog de PuduWeb",
    description:
      "Consejos y guías para profesionales, pymes y vendedores en Chile sobre marketing local y presencia online.",
    url: `${baseUrl}/blog`,
  };

  const blurDataURL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23e5e7eb'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">Blog de PuduWeb</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ideas, consejos y guías para que profesionales, pymes y vendedores en Chile mejoren su presencia
            online, destaquen en su ciudad y consigan más clientes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {posts.length === 0 ? (
          <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
            Aún no hay artículos publicados. Pronto encontrarás contenido útil sobre marketing local y presencia
            online.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => {
              const dateLabel = post.published_at
                ? new Date(post.published_at).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <article
                  key={post.id}
                  className="flex flex-col justify-between rounded-xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    {post.cover_url && (
                      <div className="mb-3 overflow-hidden rounded-lg border bg-muted">
                        <div className="relative h-36 w-full">
                          <Image
                            src={getSizedImageUrl(post.cover_url, "m")}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(min-width: 768px) 50vw, 100vw"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-xs uppercase tracking-wide text-primary/80">Artículo</p>
                    <h2 className="mt-2 text-lg font-semibold">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                        {post.title}
                      </Link>
                    </h2>
                    {(dateLabel || post.author_name) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dateLabel && <>Publicado el {dateLabel}</>}
                        {dateLabel && post.author_name && " · "}
                        {post.author_name && <>Por {post.author_name}</>}
                      </p>
                    )}
                    {post.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Leer más
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

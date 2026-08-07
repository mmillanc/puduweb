"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { ProfileCard } from "@/components/profile-card";
import type { Profile, Category } from "@/lib/types";
import { Search, Filter, Loader2, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

const typeLabels: Record<string, string> = {
  profesional: "Profesional",
  pyme: "Pyme",
  vendedor: "Vendedor",
};

const PAGE_SIZE = 12;

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const search = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "all";
  const selectedType = searchParams.get("type") ?? "all";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const selectedSort = searchParams.get("sort") ?? "featured";

  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== search) {
        updateParam("q", debouncedSearch || null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== "page") params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
    setSearchInput("");
    setDebouncedSearch("");
  }

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*, category:categories(*)", { count: "exact" })
      .eq("is_published", true);

    if (selectedSort === "name") {
      query = query.order("name", { ascending: true });
    } else if (selectedSort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else {
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,tagline.ilike.%${search}%,city.ilike.%${search}%`
      );
    }
    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }
    if (selectedType !== "all") {
      query = query.eq("type", selectedType);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count } = await query;
    setProfiles((data as Profile[]) ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [search, selectedCategory, selectedType, selectedSort, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters = search || selectedCategory !== "all" || selectedType !== "all";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Encuentra profesionales y pymes{" "}
            <span className="text-primary">cerca de ti</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
            Directorio local de profesionales, pymes y vendedores. Busca por
            categoría, ubicación o nombre.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, servicio o ciudad..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setDebouncedSearch(e.target.value);
              }}
              className="w-full rounded-full border bg-background py-3 pl-12 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter size={16} />
            Filtrar:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => updateParam("category", e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => updateParam("type", e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={selectedSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="featured">Destacados primero</option>
            <option value="name">Nombre (A-Z)</option>
            <option value="oldest">Más antiguos</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="mb-4 text-muted-foreground" size={48} />
            <p className="text-lg font-medium">No se encontraron resultados</p>
            <p className="text-sm text-muted-foreground">
              Intenta cambiar los filtros o el término de búsqueda.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "resultado" : "resultados"}
              {totalPages > 1 && ` · página ${page} de ${totalPages}`}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <button
                          onClick={() => updateParam("page", String(p))}
                          className={`h-9 w-9 rounded-lg text-sm font-medium ${
                            p === page
                              ? "bg-primary text-white"
                              : "hover:bg-muted"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                </div>
                <button
                  onClick={() => updateParam("page", String(page + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { ProfileCard } from "@/components/profile-card";
import type { Profile, Category } from "@/lib/types";
import { Search, Filter, Loader2, Inbox, ChevronLeft, ChevronRight, Store, Users, Star, MessageSquare, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2, Eye, Mail, X, BarChart3, MapPin, Heart } from "lucide-react";

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
  const [cities, setCities] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const search = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "all";
  const selectedType = searchParams.get("type") ?? "all";
  const selectedCity = searchParams.get("city") ?? "all";
  const selectedRegion = searchParams.get("region") ?? "all";
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

  // Cargar lista de ciudades y regiones disponibles para los filtros de ubicación
  useEffect(() => {
    supabase
      .from("profiles")
      .select("city, region")
      .eq("is_published", true)
      .then(({ data, error }) => {
        if (error || !data) return;

        const uniqueCities = Array.from(
          new Set(
            data
              .map((p: any) => p.city as string | null)
              .filter((c): c is string => !!c && c.trim().length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));

        const uniqueRegions = Array.from(
          new Set(
            data
              .map((p: any) => p.region as string | null)
              .filter((r): r is string => !!r && r.trim().length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));

        setCities(uniqueCities);
        setRegions(uniqueRegions);
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
    if (selectedCity !== "all") {
      query = query.eq("city", selectedCity);
    }
    if (selectedRegion !== "all") {
      query = query.eq("region", selectedRegion);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count } = await query;
    setProfiles((data as Profile[]) ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [search, selectedCategory, selectedType, selectedCity, selectedRegion, selectedSort, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters =
    search ||
    selectedCategory !== "all" ||
    selectedType !== "all" ||
    selectedCity !== "all" ||
    selectedRegion !== "all";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="flex h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                Presencia digital sencilla para pequeños negocios
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Da a tu negocio una página web "de verdad" sin complicarte
              </h1>
              <p className="mb-8 max-w-xl text-lg text-muted-foreground">
                PuduWeb crea una landing de presentación para tu pyme o emprendimiento: fotos, descripción, redes, mapa y formulario de contacto. Una sola dirección web para compartir con tus clientes.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/registro"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
                >
                  Crear página de mi negocio
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#directorio"
                  className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold hover:bg-muted transition"
                >
                  Ver negocios publicados
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> No necesitas contratar una web completa</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Página lista para compartir por WhatsApp e Instagram</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Mensajes y reseñas en un solo lugar</span>
              </div>
            </div>
            <div className="relative">
              {/* TODO: Reemplazar con screenshot real del dashboard */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&h=600&fit=crop"
                alt="Pequeño negocio atendiendo clientes con ayuda de herramientas digitales"
                className="rounded-2xl border shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 rounded-xl border bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">+24% visitas</p>
                    <p className="text-xs text-muted-foreground">este mes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Para quienes no tienen página web (aún)</h2>
            <p className="mt-3 text-muted-foreground">
              Si tu negocio vive en Instagram, WhatsApp o solo en recomendaciones, PuduWeb te da una casa propia en internet sin volverte loco con la tecnología.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-card p-8">
              <div className="mb-4 flex items-center gap-2">
                <X className="text-red-500" size={20} />
                <h3 className="font-semibold">Sin presencia digital clara</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Tus datos repartidos entre Instagram, Google Maps y tarjetas de presentación.</li>
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Clientes que te preguntan una y otra vez por horario, dirección o precios.</li>
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Sin un link único y claro que puedas compartir como "la página de tu negocio".</li>
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Difícil saber si lo que haces en redes realmente trae visitas.</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-primary/5 p-8">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={20} />
                <h3 className="font-semibold">Lo que hace PuduWeb por tu negocio</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Una landing simple con todo lo importante: quién eres, qué haces, dónde estás y cómo contactarte.</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Link fácil de recordar y compartir por WhatsApp, redes o código QR.</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Reseñas de clientes y métricas básicas para entender si te están encontrando.</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Mensajes directos desde la página, sin intermediarios ni comisiones.</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 size={24} />
              </div>
              <h3 className="mb-3 text-xl font-bold">Métricas que importan</h3>
              <p className="mb-4 text-muted-foreground">
                Mira cuántas personas visitan tu página, cuántos mensajes llegan y qué tan visible se está volviendo tu negocio.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Contador de visitas en tiempo real</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Bandeja de mensajes de contacto</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Reseñas y calificaciones</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid with bullets */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Herramientas pensadas para el día a día</h2>
            <p className="mt-3 text-muted-foreground">
              No hace falta saber de marketing digital: PuduWeb te da funciones concretas para mostrar tu trabajo y atender a tus clientes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Star size={20} />
              </div>
              <h3 className="mb-2 font-semibold">Reseñas auténticas</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Calificaciones con estrellas</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Comentarios de clientes</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Construye reputación</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare size={20} />
              </div>
              <h3 className="mb-2 font-semibold">Mensajes directos</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Bandeja de entrada</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Marcar como leído</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Sin intermediarios</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin size={20} />
              </div>
              <h3 className="mb-2 font-semibold">Cercanía local</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Filtra por ciudad</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> 12 categorías</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Profesionales, pymes y vendedores</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Heart size={20} />
              </div>
              <h3 className="mb-2 font-semibold">Favoritos</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Guarda perfiles</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Acceso rápido</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Lista personalizada</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Target audience */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Pensado para negocios reales, no solo para "startups"</h2>
          <p className="mt-3 text-muted-foreground">
            Si atiendes en tu barrio, en tu consulta, en tu taller o a domicilio, una landing clara puede marcar la diferencia.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-8 text-center transition hover:shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profesionales.jpg"
              alt="Profesional"
              className="mb-4 rounded-xl"
            />
            <h3 className="mb-2 font-semibold">Profesionales</h3>
            <p className="text-sm text-muted-foreground">
              Kinesiólogos, abogados, arquitectos, contadores. Explica qué haces, muestra reseñas y comparte tu link como tu página profesional.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 text-center transition hover:shadow-md">
            {/* TODO: Reemplazar con imagen real */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop"
              alt="Pyme"
              className="mb-4 rounded-xl"
            />
            <h3 className="mb-2 font-semibold">Pymes</h3>
            <p className="text-sm text-muted-foreground">
              Restaurantes, ferreterías, tiendas, talleres. Una ficha clara con fotos, horarios, mapa y formas de contacto.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 text-center transition hover:shadow-md">
            {/* TODO: Reemplazar con imagen real */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop"
              alt="Vendedor"
              className="mb-4 rounded-xl"
            />
            <h3 className="mb-2 font-semibold">Vendedores</h3>
            <p className="text-sm text-muted-foreground">
              Vendedores independientes y emprendedores. Ordena tu información en un solo lugar y deja de depender solo de mensajes sueltos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-blue-600 p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">¿Listo para destacar?</h2>
          <p className="mt-3 text-white/90">
            Crea la página de tu negocio y comparte un solo link para que te encuentren y te contacten.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/registro"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90 transition"
            >
              Registrarse
              <ArrowRight size={16} />
            </a>
            <a
              href="/sobre-nosotros"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Saber más
            </a>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section id="directorio" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Negocios en PuduWeb</h2>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setDebouncedSearch(e.target.value);
              }}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
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

          {cities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => updateParam("city", e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas las ciudades</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}

          {regions.length > 0 && (
            <select
              value={selectedRegion}
              onChange={(e) => updateParam("region", e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas las regiones</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          )}

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

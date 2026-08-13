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
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="flex h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                Directorio local de Chile
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                El directorio que{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">conecta</span>{" "}
                talento local con clientes
              </h1>
              <p className="mb-8 max-w-xl text-lg text-muted-foreground">
                Publica tu perfil, recibe reseñas, gestiona mensajes y mide tu alcance. Todo desde un solo panel. Sin comisiones, sin intermediarios.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/registro"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
                >
                  Crear perfil
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#directorio"
                  className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold hover:bg-muted transition"
                >
                  Explorar directorio
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Sin comisiones</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Métricas incluidas</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Contacto directo</span>
              </div>
            </div>
            <div className="relative">
              {/* TODO: Reemplazar con screenshot real del dashboard */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                alt="Dashboard de PuduWeb"
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
            <h2 className="text-3xl font-bold">Más que un directorio</h2>
            <p className="mt-3 text-muted-foreground">
              No solo listamos perfiles. Damos las herramientas para que profesionales y pymes crezcan.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-8">
              <div className="mb-4 flex items-center gap-2">
                <X className="text-red-500" size={20} />
                <h3 className="font-semibold">Lo que hacen la mayoría de los directorios</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Solo una lista de nombres</li>
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Sin reseñas ni social proof</li>
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> No puedes contactar directamente</li>
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Sin métricas ni datos</li>
                <li className="flex items-start gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-400" /> Perfiles estáticos sin vida</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-primary/5 p-8">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={20} />
                <h3 className="font-semibold">Lo que hace PuduWeb</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Perfiles con fotos, redes y servicios</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Reseñas reales de clientes</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Mensajes directos sin intermediarios</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Métricas de visitas y mensajes</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" /> Favoritos y perfil destacado</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature blocks alternating image/text */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold">De perfil básico a presencia completa</h2>
          <p className="mt-3 text-muted-foreground">
            Todo lo que necesitas para destacar y crecer.
          </p>
        </div>

        {/* Block 1: image left, text right */}
        <div className="grid grid-cols-1 items-center gap-12 py-10 lg:grid-cols-2">
          <div className="relative">
            {/* TODO: Reemplazar con screenshot real */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&h=500&fit=crop"
              alt="Panel de métricas"
              className="rounded-2xl border shadow-lg"
            />
          </div>
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 size={24} />
            </div>
            <h3 className="mb-3 text-xl font-bold">Métricas que importan</h3>
            <p className="mb-4 text-muted-foreground">
              Visualiza cuántas visitas recibe tu perfil, cuántos mensajes te han enviado y cómo crece tu presencia mes a mes.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Contador de visitas en tiempo real</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Bandeja de mensajes de contacto</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Reseñas y calificaciones</li>
            </ul>
          </div>
        </div>

        {/* Block 2: text left, image right */}
        <div className="grid grid-cols-1 items-center gap-12 py-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search size={24} />
            </div>
            <h3 className="mb-3 text-xl font-bold">Búsqueda que encuentra</h3>
            <p className="mb-4 text-muted-foreground">
              Filtra por categoría, ciudad o tipo de servicio. Tus clientes te encuentran cuando te necesitan, no por casualidad.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Filtros por categoría y ubicación</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Búsqueda por nombre o servicio</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Perfiles destacados primero</li>
            </ul>
          </div>
          <div className="order-1 lg:order-2 relative">
            {/* TODO: Reemplazar con screenshot real */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&h=500&fit=crop"
              alt="Búsqueda de perfiles"
              className="rounded-2xl border shadow-lg"
            />
          </div>
        </div>

        {/* Block 3: image left, text right */}
        <div className="grid grid-cols-1 items-center gap-12 py-10 lg:grid-cols-2">
          <div className="relative">
            {/* TODO: Reemplazar con screenshot real */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&h=500&fit=crop"
              alt="Perfil profesional"
              className="rounded-2xl border shadow-lg"
            />
          </div>
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store size={24} />
            </div>
            <h3 className="mb-3 text-xl font-bold">Tu vitrina online</h3>
            <p className="mb-4 text-muted-foreground">
              Crea un perfil completo con fotos, redes sociales, horarios, descripción de servicios y datos de contacto. Todo en un solo lugar.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Fotos y logo de tu negocio</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Instagram, WhatsApp y web</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Publica o despublica cuando quieras</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature grid with bullets */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Todo lo que necesitas en un solo lugar</h2>
            <p className="mt-3 text-muted-foreground">
              Una plataforma completa para gestionar tu presencia online.
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
          <h2 className="text-3xl font-bold">Para todos los talentos locales</h2>
          <p className="mt-3 text-muted-foreground">
            Sea cual sea tu rubro, PuduWeb te ayuda a crecer.
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
              Kinesiólogos, abogados, arquitectos, contadores. Muestra tu experiencia y atrae nuevos clientes.
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
              Restaurantes, ferreterías, tiendas, talleres. Tu vitrina online con fotos, horarios y contacto.
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
              Vendedores independientes y emprendedores. Crea tu perfil y conecta con quienes buscan tus productos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-blue-600 p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">¿Listo para destacar?</h2>
          <p className="mt-3 text-white/90">
            Crea tu perfil y empieza a recibir clientes hoy mismo.
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
          <h2 className="text-2xl font-bold">Explorar directorio</h2>
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

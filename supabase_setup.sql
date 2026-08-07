-- ============================================================
-- PuduWeb - Esquema de base de datos para Supabase
-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de categorías
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  icon text,
  created_at timestamptz default now()
);

-- Tabla de perfiles (profesionales, pymes, vendedores)
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  -- Datos básicos (tarjeta)
  name text not null,
  slug text not null unique,
  type text not null default 'profesional' check (type in ('profesional', 'pyme', 'vendedor')),
  category_id uuid references public.categories(id) on delete set null,
  tagline text,
  description text,
  city text,
  region text,
  phone text,
  email text,
  website text,
  address text,
  -- Redes sociales
  instagram text,
  facebook text,
  whatsapp text,
  linkedin text,
  twitter text,
  tiktok text,
  -- Imagen de perfil y portada
  avatar_url text,
  cover_url text,
  -- Datos extendidos (landing)
  services text,           -- lista separada por comas o texto libre
  hours text,              -- horario de atención
  gallery_urls text[],     -- array de URLs de imágenes
  -- Estado
  is_published boolean default true,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices
create index if not exists idx_profiles_category on public.profiles(category_id);
create index if not exists idx_profiles_slug on public.profiles(slug);
create index if not exists idx_profiles_published on public.profiles(is_published);
create index if not exists idx_profiles_type on public.profiles(type);
create index if not exists idx_profiles_featured on public.profiles(featured);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Categorías: lectura pública, escritura solo admin
alter table public.categories enable row level security;
create policy "Categorias lectura publica" on public.categories for select using (true);
create policy "Categorias escritura solo autenticados" on public.categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Perfiles: lectura pública solo si is_published = true, escritura solo autenticados
alter table public.profiles enable row level security;
create policy "Perfiles lectura publica" on public.profiles for select using (is_published = true);
create policy "Perfiles escritura solo autenticados" on public.profiles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Datos iniciales - Categorías
-- ============================================================
insert into public.categories (name, slug, icon) values
  ('Salud', 'salud', 'heart'),
  ('Construcción', 'construccion', 'hammer'),
  ('Tecnología', 'tecnologia', 'laptop'),
  ('Educación', 'educacion', 'graduation-cap'),
  ('Belleza y Cuidado', 'belleza', 'scissors'),
  ('Alimentación', 'alimentacion', 'utensils'),
  ('Transporte', 'transporte', 'car'),
  ('Legal', 'legal', 'scale'),
  ('Hogar y Servicios', 'hogar', 'home'),
  ('Deporte y Fitness', 'deporte', 'dumbbell'),
  ('Diseño y Marketing', 'diseno', 'palette'),
  ('Otros', 'otros', 'tag')
on conflict (slug) do nothing;

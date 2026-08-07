-- ============================================================
-- PuduWeb - Tablas adicionales: Reviews y Favoritos
-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de reseñas
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  author_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id, user_id)
);

-- Índices
create index if not exists idx_reviews_profile on public.reviews(profile_id);
create index if not exists idx_reviews_user on public.reviews(user_id);

-- RLS para reseñas
alter table public.reviews enable row level security;

-- Lectura: pública (todos pueden ver reseñas)
create policy "Reviews lectura publica" on public.reviews for select using (true);

-- Escritura: solo usuarios autenticados pueden crear/editar/eliminar sus propias reseñas
create policy "Reviews crear autenticados" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Reviews editar propias" on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Reviews eliminar propias" on public.reviews for delete using (auth.uid() = user_id);

-- ============================================================

-- Tabla de favoritos
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(profile_id, user_id)
);

-- Índices
create index if not exists idx_favorites_profile on public.favorites(profile_id);
create index if not exists idx_favorites_user on public.favorites(user_id);

-- RLS para favoritos
alter table public.favorites enable row level security;

-- Lectura: solo el propio usuario puede ver sus favoritos
create policy "Favoritos lectura propias" on public.favorites for select using (auth.uid() = user_id);

-- Escritura: solo usuarios autenticados pueden gestionar sus propios favoritos
create policy "Favoritos crear autenticados" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Favoritos eliminar propias" on public.favorites for delete using (auth.uid() = user_id);

-- ============================================================

-- Función para calcular rating promedio (opcional, para usar en queries)
create or replace function public.get_profile_rating(profile_uuid uuid)
returns table (avg_rating numeric, total_reviews bigint)
language sql
stable
as $$
  select
    avg(rating)::numeric as avg_rating,
    count(*)::bigint as total_reviews
  from public.reviews
  where profile_id = profile_uuid;
$$;

-- ============================================================
-- Storage bucket para imágenes de perfiles
-- ============================================================
-- Ejecuta también esto para crear el bucket público de imágenes

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

-- Política: lectura pública
create policy "Imagenes lectura publica" on storage.objects for select
  using (bucket_id = 'profile-images');

-- Política: escritura solo autenticados
create policy "Imagenes escritura autenticados" on storage.objects for insert
  with check (bucket_id = 'profile-images' and auth.role() = 'authenticated');

create policy "Imagenes update autenticados" on storage.objects for update
  using (bucket_id = 'profile-images' and auth.role() = 'authenticated');

create policy "Imagenes delete autenticados" on storage.objects for delete
  using (bucket_id = 'profile-images' and auth.role() = 'authenticated');

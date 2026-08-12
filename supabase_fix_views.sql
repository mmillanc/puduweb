-- ============================================================
-- PuduWeb - Crear tabla profile_views + RLS
-- ============================================================
-- PROBLEMA: La tabla profile_views no existe en Supabase,
-- por lo que el ViewTracker no puede registrar visitas.
--
-- SOLUCIÓN: Crear la tabla con RLS que permita:
-- - INSERT público (visitantes anónimos y registrados)
-- - SELECT solo para dueños del perfil o admin
-- ============================================================

-- 1. Crear la tabla si no existe
create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  viewed_at timestamptz not null default now()
);

-- 2. Índice para consultar vistas por perfil
create index if not exists idx_profile_views_profile_id on public.profile_views(profile_id);

-- 3. Índice para consultar vistas por fecha
create index if not exists idx_profile_views_viewed_at on public.profile_views(viewed_at desc);

-- 4. Habilitar RLS
alter table public.profile_views enable row level security;

-- 5. Eliminar políticas existentes (si las hay)
drop policy if exists "Views insert publico" on public.profile_views;
drop policy if exists "Views lectura propias" on public.profile_views;
drop policy if exists "Views lectura admin" on public.profile_views;

-- 6. INSERT: cualquiera puede registrar una visita (público)
-- Esto permite trackear tanto visitantes anónimos como registrados
create policy "Views insert publico" on public.profile_views for insert
  with check (true);

-- 7. SELECT: solo dueños del perfil o admin pueden ver las visitas
create policy "Views lectura propias" on public.profile_views for select
  using (
    exists (
      select 1 from public.profile_owners
      where profile_owners.profile_id = profile_views.profile_id
      and profile_owners.user_id = auth.uid()
    )
    or public.is_admin()
  );

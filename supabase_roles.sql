-- ============================================================
-- PuduWeb - Sistema de roles y propiedad de perfiles
-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de roles de usuario
create table if not exists public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'negocio', 'usuario')),
  created_at timestamptz default now(),
  unique(user_id)
);

-- Tabla de propiedad de perfiles (qué negocio puede editar qué perfil)
create table if not exists public.profile_owners (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(profile_id, user_id)
);

-- Índices
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_profile_owners_profile on public.profile_owners(profile_id);
create index if not exists idx_profile_owners_user on public.profile_owners(user_id);

-- ============================================================
-- RLS para user_roles
-- ============================================================
alter table public.user_roles enable row level security;

-- Lectura: el propio usuario puede ver su rol, admin puede ver todos
create policy "Roles lectura propias" on public.user_roles for select
  using (auth.uid() = user_id);

-- Escritura: solo admin puede asignar roles (a través de service_role)
-- No se permite insert/update/delete desde el cliente anónimo
-- El primer admin se asigna manualmente en Supabase Studio

-- ============================================================
-- RLS para profile_owners
-- ============================================================
alter table public.profile_owners enable row level security;

-- Lectura: el propio usuario o admin pueden ver
create policy "Owners lectura propias" on public.profile_owners for select
  using (auth.uid() = user_id);

-- Escritura: solo admin puede asignar owners (desde service_role o admin)
-- No se permite insert/delete desde el cliente anónimo

-- ============================================================
-- Actualizar RLS de perfiles para soportar negocios
-- ============================================================
-- Eliminar políticas anteriores de escritura
drop policy if exists "Perfiles escritura solo autenticados" on public.profiles;

-- Nueva política: admin puede editar todo, negocio puede editar sus perfiles
create policy "Perfiles escritura admin" on public.profiles for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Perfiles escritura negocio propio" on public.profiles for update
  using (
    exists (
      select 1 from public.profile_owners
      where profile_id = profiles.id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profile_owners
      where profile_id = profiles.id and user_id = auth.uid()
    )
  );

-- ============================================================
-- Función helper: obtener rol del usuario actual
-- ============================================================
create or replace function public.get_user_role(user_uuid uuid)
returns text
language sql
stable
security definer
as $$
  select role from public.user_roles where user_id = user_uuid;
$$;

-- ============================================================
-- Función helper: verificar si un usuario es owner de un perfil
-- ============================================================
create or replace function public.is_profile_owner(user_uuid uuid, profile_uuid uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists(
    select 1 from public.profile_owners
    where user_id = user_uuid and profile_id = profile_uuid
  );
$$;

-- ============================================================
-- Para asignar el primer admin:
-- 1. Crea el usuario en Authentication > Users
-- 2. Ejecuta: insert into public.user_roles (user_id, role) values ('UUID-DEL-USUARIO', 'admin');
-- ============================================================

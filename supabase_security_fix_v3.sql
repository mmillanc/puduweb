-- ============================================================
-- PuduWeb - Fix de seguridad RLS v3
-- ============================================================
-- EJECUTAR DESPUÉS de supabase_security_fix_v2.sql
-- Cambios respecto a v2:
-- 1. Negocio PUEDE publicar/despublicar su propio perfil (is_published)
-- 2. Negocio NO puede destacar (featured) — solo admin
-- 3. Negocio no puede borrar su perfil — debe solicitar permiso
-- 4. Negocio puede ver perfiles publicados de otros negocios
-- 5. Negocio puede ver datos de usuarios que lo contactan
-- 6. Usuario puede buscar negocios y leer calificaciones
-- ============================================================

-- ============================================================
-- FIX 1: Modificar trigger — negocio puede cambiar is_published
-- pero NO featured (solo admin)
-- ============================================================
create or replace function public.prevent_non_admin_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
  is_owner boolean;
begin
  select exists(
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ) into is_admin;

  -- Admin puede cambiar todo
  if is_admin then
    return new;
  end if;

  -- Verificar si es owner del perfil
  select exists(
    select 1 from public.profile_owners
    where profile_id = new.id and user_id = auth.uid()
  ) into is_owner;

  -- Owner puede cambiar is_published de su propio perfil
  -- Pero NUNCA puede cambiar featured (solo admin)
  if new.featured is distinct from old.featured then
    raise exception 'Solo el administrador puede destacar perfiles';
  end if;

  -- Si no es owner ni admin, bloquear todo cambio
  if not is_owner then
    raise exception 'No tienes permiso para modificar este perfil';
  end if;

  return new;
end;
$$;

-- El trigger ya existe de v2, solo se actualiza la función
-- (create or replace function actualiza la lógica del trigger existente)

-- ============================================================
-- FIX 2: Tabla deletion_requests — negocio solicita borrado
-- ============================================================
create table if not exists public.deletion_requests (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz default now(),
  resolved_at timestamptz,
  unique(profile_id)
);

create index if not exists idx_deletion_profile on public.deletion_requests(profile_id);
create index if not exists idx_deletion_user on public.deletion_requests(user_id);
create index if not exists idx_deletion_status on public.deletion_requests(status);

alter table public.deletion_requests enable row level security;

-- SELECT: el negocio ve sus propias solicitudes, admin ve todas
create policy "Deletion lectura propias o admin" on public.deletion_requests for select
  using (
    auth.uid() = user_id or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- INSERT: el negocio puede solicitar borrado de su propio perfil
create policy "Deletion insert propias" on public.deletion_requests for insert
  with check (
    auth.uid() = user_id and exists (
      select 1 from public.profile_owners
      where profile_id = deletion_requests.profile_id and user_id = auth.uid()
    )
  );

-- UPDATE: solo admin puede aprobar/rechazar
create policy "Deletion update admin" on public.deletion_requests for update
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

-- DELETE: solo admin
create policy "Deletion delete admin" on public.deletion_requests for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- FIX 3: Confirmar que negocio ve perfiles publicados de otros
-- ============================================================
-- La política "Perfiles lectura publica" (is_published = true) ya existe
-- y permite a cualquier usuario ver perfiles publicados.
-- La política "Perfiles lectura propias negocio" permite ver los propios
-- (incluyendo no publicados).
-- Esto ya está correcto — no requiere cambios.

-- ============================================================
-- FIX 4: Confirmar que negocio ve mensajes de contacto
-- ============================================================
-- La política "Messages lectura propias" en contact_messages ya permite
-- que el owner del perfil vea los mensajes.
-- Esto ya está correcto — no requiere cambios.

-- ============================================================
-- FIX 5: Confirmar que usuarios pueden buscar y leer reviews
-- ============================================================
-- La política "Perfiles lectura publica" permite ver perfiles publicados.
-- La política "Reviews lectura publica" permite ver todas las reseñas.
-- Esto ya está correcto — no requiere cambios.

-- ============================================================
-- RESUMEN FINAL DE PERMISOS ACTUALIZADO
-- ============================================================
-- PROFILES:
--   SELECT  is_published=true (público) OR admin (todos) OR owner (propios)
--   INSERT  admin (cualquier estado) OR negocio (solo is_published=false)
--   UPDATE  admin (cualquier campo) OR negocio owner (NO featured)
--   DELETE  solo admin (negocio debe usar deletion_requests)
--
-- DELETION_REQUESTS:
--   SELECT  propio usuario OR admin
--   INSERT  solo owner del perfil
--   UPDATE  solo admin (aprobar/rechazar)
--   DELETE  solo admin
--
-- REVIEWS:
--   SELECT  público
--   INSERT  autenticado, no puede reseñar su propio perfil
--   UPDATE  solo el autor (auth.uid() = user_id)
--   DELETE  solo el autor
--
-- FAVORITES:
--   SELECT  solo el propio usuario
--   INSERT  solo el propio usuario
--   DELETE  solo el propio usuario
--
-- CONTACT_MESSAGES:
--   INSERT  público
--   SELECT  owner del perfil OR admin
--   UPDATE  owner del perfil OR admin
--   DELETE  owner del perfil OR admin
--
-- PROFILE_VIEWS:
--   INSERT  público
--   SELECT  owner del perfil OR admin

-- ============================================================
-- PuduWeb - Fix de seguridad RLS v2
-- ============================================================
-- EJECUTAR EN ORDEN DESPUÉS de todos los scripts anteriores
-- Corrige:
-- 1. Negocio puede ver sus propios perfiles no publicados
-- 2. Negocio NO puede cambiar is_published ni featured (solo admin)
-- 3. Usuario (rol) no puede modificar perfiles de negocios
-- 4. Limpia políticas duplicadas/heredadas
-- ============================================================

-- ============================================================
-- FIX 1: Perfiles — SELECT para negocio sobre sus propios borradores
-- ============================================================
-- Sin esto, el negocio no puede ver sus perfiles no publicados
drop policy if exists "Perfiles lectura propias negocio" on public.profiles;

create policy "Perfiles lectura propias negocio" on public.profiles for select
  using (
    exists (
      select 1 from public.profile_owners
      where profile_id = profiles.id and user_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 2: Perfiles — negocio NO puede cambiar is_published ni featured
-- ============================================================
-- El UPDATE policy actual permite al negocio cambiar cualquier campo.
-- Un negocio podría hacer SET is_published=true y auto-publicarse.
-- Solución: trigger que bloquea cambios de is_published/featured por no-admin.

create or replace function public.prevent_non_admin_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  select exists(
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ) into is_admin;

  if is_admin then
    return new;
  end if;

  -- Non-admin: cannot change is_published or featured
  if new.is_published is distinct from old.is_published then
    raise exception 'Solo el administrador puede publicar/despublicar perfiles';
  end if;

  if new.featured is distinct from old.featured then
    raise exception 'Solo el administrador puede destacar perfiles';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_non_admin_publish on public.profiles;
create trigger trg_prevent_non_admin_publish
  before update on public.profiles
  for each row execute function public.prevent_non_admin_publish();

-- ============================================================
-- FIX 3: Perfiles — DELETE solo admin, negocio no puede borrar
-- ============================================================
-- No hay política DELETE explícita para negocio, pero por seguridad:
drop policy if exists "Perfiles delete admin only" on public.profiles;

create policy "Perfiles delete admin only" on public.profiles for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- FIX 4: Reviews — solo usuarios autenticados, no anónimos
-- ============================================================
-- Las políticas actuales permiten a cualquier autenticado crear reviews.
-- Un negocio no debería poder reseñar su propio perfil.
drop policy if exists "Reviews crear autenticados" on public.reviews;

create policy "Reviews crear autenticados" on public.reviews for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.profile_owners
      where profile_id = reviews.profile_id and user_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 5: profile_owners — UPDATE solo admin
-- ============================================================
-- No hay política UPDATE, pero la agregamos explícita para claridad
drop policy if exists "Owners update admin" on public.profile_owners;

create policy "Owners update admin" on public.profile_owners for update
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

-- ============================================================
-- RESUMEN FINAL DE PERMISOS
-- ============================================================
-- PROFILES:
--   SELECT  is_published=true (público) OR admin (todos) OR owner (propios)
--   INSERT  admin (cualquier estado) OR negocio (solo is_published=false)
--   UPDATE  admin (cualquier campo) OR negocio owner (NO is_published/featured)
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
-- USER_ROLES:
--   SELECT  propio usuario OR admin
--   INSERT  propio usuario (solo rol 'usuario' o 'negocio')
--   UPDATE  solo admin
--   DELETE  solo admin
--
-- PROFILE_OWNERS:
--   SELECT  propio usuario OR admin
--   INSERT  propio usuario (solo para sí mismo)
--   UPDATE  solo admin
--   DELETE  solo admin
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

-- ============================================================
-- PuduWeb - Fix recursión infinita en RLS de user_roles
-- ============================================================
-- PROBLEMA: La política SELECT de user_roles se consulta a sí misma
-- para verificar si el usuario es admin, causando recursión infinita.
--
-- SOLUCIÓN:
-- 1. Simplificar SELECT de user_roles (sin auto-referencia)
-- 2. Crear función is_admin() con security definer (bypassa RLS)
-- 3. Reemplazar todas las políticas que consultan user_roles directamente
-- ============================================================

-- ============================================================
-- FIX 1: Función is_admin() — security definer, bypassa RLS
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- FIX 2: Función is_negocio() — security definer
-- ============================================================
create or replace function public.is_negocio()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'negocio'
  );
$$;

-- ============================================================
-- FIX 3: user_roles — eliminar política recursiva
-- ============================================================
drop policy if exists "Roles lectura propias" on public.user_roles;
drop policy if exists "Roles lectura propias o admin" on public.user_roles;
drop policy if exists "Roles insert propias no admin" on public.user_roles;
drop policy if exists "Roles update admin" on public.user_roles;
drop policy if exists "Roles delete admin" on public.user_roles;

-- SELECT: solo el propio usuario puede ver su rol (sin consultar user_roles = sin recursión)
create policy "Roles lectura propia" on public.user_roles for select
  using (auth.uid() = user_id);

-- INSERT: el propio usuario puede insertar su rol pero solo usuario o negocio
create policy "Roles insert propia no admin" on public.user_roles for insert
  with check (auth.uid() = user_id and role in ('usuario', 'negocio'));

-- UPDATE: solo admin (usando función is_admin, no consulta directa)
create policy "Roles update admin" on public.user_roles for update
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE: solo admin
create policy "Roles delete admin" on public.user_roles for delete
  using (public.is_admin());

-- ============================================================
-- FIX 4: profiles — reemplazar consultas a user_roles por is_admin()
-- ============================================================
drop policy if exists "Perfiles escritura admin" on public.profiles;
drop policy if exists "Perfiles escritura solo autenticados" on public.profiles;
drop policy if exists "Perfiles insert negocio no publicado" on public.profiles;
drop policy if exists "Perfiles delete admin only" on public.profiles;

drop policy if exists "Perfiles lectura publica" on public.profiles;
drop policy if exists "Perfiles lectura propias negocio" on public.profiles;
drop policy if exists "Perfiles escritura negocio propio" on public.profiles;

-- SELECT: público (publicados) OR owner (propios) OR admin (todos)
create policy "Perfiles lectura publica" on public.profiles for select
  using (
    is_published = true
    or public.is_admin()
    or exists (
      select 1 from public.profile_owners
      where profile_id = profiles.id and user_id = auth.uid()
    )
  );

drop policy if exists "Perfiles insert admin" on public.profiles;

-- INSERT: admin (cualquier estado) OR negocio (solo no publicado)
create policy "Perfiles insert admin" on public.profiles for insert
  with check (public.is_admin());

drop policy if exists "Perfiles insert negocio no publicado" on public.profiles;
create policy "Perfiles insert negocio no publicado" on public.profiles for insert
  with check (
    is_published = false and public.is_negocio()
  );

-- UPDATE: admin (todo) OR negocio owner (sin featured)
drop policy if exists "Perfiles update admin" on public.profiles;
create policy "Perfiles update admin" on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Perfiles update negocio owner" on public.profiles;
create policy "Perfiles update negocio owner" on public.profiles for update
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

-- DELETE: solo admin
drop policy if exists "Perfiles delete admin" on public.profiles;
drop policy if exists "Perfiles delete admin only" on public.profiles;
create policy "Perfiles delete admin" on public.profiles for delete
  using (public.is_admin());

-- ============================================================
-- FIX 5: profile_owners — reemplazar consultas a user_roles
-- ============================================================
drop policy if exists "Owners lectura propias" on public.profile_owners;
drop policy if exists "Owners update admin" on public.profile_owners;

drop policy if exists "Owners lectura propias o admin" on public.profile_owners;
drop policy if exists "Owners insert propia" on public.profile_owners;
drop policy if exists "Owners delete admin" on public.profile_owners;

-- SELECT: propio usuario OR admin
create policy "Owners lectura propias o admin" on public.profile_owners for select
  using (
    auth.uid() = user_id or public.is_admin()
  );

-- INSERT: el propio usuario puede asignarse a sí mismo (para crear perfiles)
create policy "Owners insert propia" on public.profile_owners for insert
  with check (auth.uid() = user_id);

-- UPDATE: solo admin
create policy "Owners update admin" on public.profile_owners for update
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE: solo admin
create policy "Owners delete admin" on public.profile_owners for delete
  using (public.is_admin());

-- ============================================================
-- FIX 6: deletion_requests — reemplazar consultas a user_roles
-- ============================================================
drop policy if exists "Deletion lectura propias o admin" on public.deletion_requests;
drop policy if exists "Deletion update admin" on public.deletion_requests;
drop policy if exists "Deletion delete admin" on public.deletion_requests;

drop policy if exists "Deletion insert propias" on public.deletion_requests;
create policy "Deletion lectura propias o admin" on public.deletion_requests for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Deletion update admin" on public.deletion_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Deletion delete admin" on public.deletion_requests for delete
  using (public.is_admin());

-- ============================================================
-- FIX 7: Storage — reemplazar consultas a user_roles por is_admin()
-- ============================================================
drop policy if exists "Imagenes escritura autenticados" on storage.objects;
drop policy if exists "Imagenes update autenticados" on storage.objects;
drop policy if exists "Imagenes delete autenticados" on storage.objects;
drop policy if exists "Imagenes insert propias" on storage.objects;
drop policy if exists "Imagenes update propias" on storage.objects;
drop policy if exists "Imagenes delete propias" on storage.objects;
drop policy if exists "Imagenes admin all" on storage.objects;

-- Lectura pública (sin cambios)
drop policy if exists "Imagenes lectura publica" on storage.objects;
create policy "Imagenes lectura publica" on storage.objects for select
  using (bucket_id = 'profile-images');

-- INSERT: autenticados pueden subir a su propia carpeta
create policy "Imagenes insert propias" on storage.objects for insert
  with check (
    bucket_id = 'profile-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: solo archivos en su carpeta
create policy "Imagenes update propias" on storage.objects for update
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: solo archivos en su carpeta
create policy "Imagenes delete propias" on storage.objects for delete
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin puede gestionar todas las imágenes (usando función, sin recursión)
create policy "Imagenes admin all" on storage.objects for all
  using (
    bucket_id = 'profile-images' and public.is_admin()
  )
  with check (
    bucket_id = 'profile-images' and public.is_admin()
  );

-- ============================================================
-- FIX 8: categories — reemplazar consulta a user_roles
-- ============================================================
drop policy if exists "Categorias escritura solo autenticados" on public.categories;

drop policy if exists "Categorias escritura admin" on public.categories;
create policy "Categorias escritura admin" on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- FIX 9: Trigger prevent_non_admin_publish — usar is_admin()
-- ============================================================
create or replace function public.prevent_non_admin_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.featured is distinct from old.featured then
    raise exception 'Solo el administrador puede destacar perfiles';
  end if;

  if not exists (
    select 1 from public.profile_owners
    where profile_id = new.id and user_id = auth.uid()
  ) then
    raise exception 'No tienes permiso para modificar este perfil';
  end if;

  return new;
end;
$$;

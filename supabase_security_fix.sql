-- ============================================================
-- PuduWeb - Fix de seguridad crítico
-- ============================================================
-- Ejecuta este script en el SQL Editor de Supabase
-- Corrige: RLS de user_roles, storage policies, admin access
-- ============================================================

-- ============================================================
-- FIX 1: user_roles — permitir INSERT propio (solo usuario/negocio)
-- ============================================================
-- Antes no había política INSERT, el registro fallaba silenciosamente

drop policy if exists "Roles lectura propias" on public.user_roles;
drop policy if exists "Roles insert propias" on public.user_roles;
drop policy if exists "Roles update admin" on public.user_roles;

-- SELECT: el propio usuario puede ver su rol, admin puede ver todos
create policy "Roles lectura propias o admin" on public.user_roles for select
  using (
    auth.uid() = user_id or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- INSERT: el propio usuario puede insertar su rol PERO solo usuario o negocio (nunca admin)
create policy "Roles insert propias no admin" on public.user_roles for insert
  with check (
    auth.uid() = user_id and role in ('usuario', 'negocio')
  );

-- UPDATE: solo admin puede cambiar roles
create policy "Roles update admin" on public.user_roles for update
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- DELETE: solo admin
create policy "Roles delete admin" on public.user_roles for delete
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- ============================================================
-- FIX 2: Perfiles — negocio solo puede INSERT con is_published=false
-- ============================================================
drop policy if exists "Perfiles insert negocio" on public.profiles;

create policy "Perfiles insert negocio no publicado" on public.profiles for insert
  with check (
    is_published = false and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'negocio'
    )
  );

-- ============================================================
-- FIX 3: Storage — restringir escritura por carpeta de usuario
-- ============================================================
drop policy if exists "Imagenes escritura autenticados" on storage.objects;
drop policy if exists "Imagenes update autenticados" on storage.objects;
drop policy if exists "Imagenes delete autenticados" on storage.objects;

-- INSERT: autenticados pueden subir solo a su carpeta (user_id/)
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

-- Admin puede gestionar todas las imágenes
create policy "Imagenes admin all" on storage.objects for all
  using (
    bucket_id = 'profile-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'profile-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- PuduWeb - FIX FINAL UNIFICADO de RLS
-- ============================================================
-- EJECUTAR UNA SOLA VEZ en el SQL Editor de Supabase
--
-- Reemplaza TODOS los scripts anteriores de RLS:
--   supabase_roles.sql, supabase_security_fix.sql,
--   supabase_security_fix_v2.sql, supabase_self_register.sql,
--   supabase_fix_recursion.sql, supabase_security_fix_v3.sql
--
-- Reglas finales:
--   - Negocio crea su perfil (is_published=false) al registrarse (trigger)
--   - Negocio puede publicar/despublicar su propio perfil
--   - Negocio NO puede destacar (featured) — solo admin
--   - Negocio NO puede borrar su perfil — usa deletion_requests
--   - Admin tiene acceso total
--   - Sin recursión RLS (usa is_admin()/is_negocio() con security definer)
-- ============================================================

-- ============================================================
-- 0. Tablas base (por si supabase_roles.sql no se ejecutó)
-- ============================================================
create table if not exists public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'negocio', 'usuario')),
  created_at timestamptz default now(),
  unique(user_id)
);

create table if not exists public.profile_owners (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(profile_id, user_id)
);

create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_profile_owners_profile on public.profile_owners(profile_id);
create index if not exists idx_profile_owners_user on public.profile_owners(user_id);

alter table public.user_roles enable row level security;
alter table public.profile_owners enable row level security;

-- ============================================================
-- 1. Funciones helper (security definer, bypassan RLS)
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

create or replace function public.get_user_role(user_uuid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = user_uuid;
$$;

create or replace function public.is_profile_owner(user_uuid uuid, profile_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profile_owners
    where user_id = user_uuid and profile_id = profile_uuid
  );
$$;

-- ============================================================
-- 2. user_roles — políticas SIN recursión
-- ============================================================
drop policy if exists "Roles lectura propias" on public.user_roles;
drop policy if exists "Roles lectura propias o admin" on public.user_roles;
drop policy if exists "Roles lectura propia" on public.user_roles;
drop policy if exists "Roles insert propias" on public.user_roles;
drop policy if exists "Roles insert propias no admin" on public.user_roles;
drop policy if exists "Roles insert propia no admin" on public.user_roles;
drop policy if exists "Roles update admin" on public.user_roles;
drop policy if exists "Roles delete admin" on public.user_roles;

-- SELECT: solo el propio usuario puede ver su rol (sin auto-consulta)
create policy "Roles lectura propia" on public.user_roles for select
  using (auth.uid() = user_id);

-- INSERT: el propio usuario puede insertar su rol pero solo usuario/negocio
create policy "Roles insert propia no admin" on public.user_roles for insert
  with check (auth.uid() = user_id and role in ('usuario', 'negocio'));

-- UPDATE: solo admin
create policy "Roles update admin" on public.user_roles for update
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE: solo admin
create policy "Roles delete admin" on public.user_roles for delete
  using (public.is_admin());

-- ============================================================
-- 3. profiles — políticas finales
-- ============================================================
drop policy if exists "Perfiles lectura publica" on public.profiles;
drop policy if exists "Perfiles lectura propias negocio" on public.profiles;
drop policy if exists "Perfiles escritura admin" on public.profiles;
drop policy if exists "Perfiles escritura negocio propio" on public.profiles;
drop policy if exists "Perfiles admin all" on public.profiles;
drop policy if exists "Perfiles insert admin" on public.profiles;
drop policy if exists "Perfiles insert negocio" on public.profiles;
drop policy if exists "Perfiles insert negocio no publicado" on public.profiles;
drop policy if exists "Perfiles update admin" on public.profiles;
drop policy if exists "Perfiles update negocio owner" on public.profiles;
drop policy if exists "Perfiles delete admin" on public.profiles;
drop policy if exists "Perfiles delete admin only" on public.profiles;

-- SELECT: público (publicados) OR admin (todos) OR owner (propios)
create policy "Perfiles lectura publica" on public.profiles for select
  using (
    is_published = true
    or public.is_admin()
    or exists (
      select 1 from public.profile_owners
      where profile_id = profiles.id and user_id = auth.uid()
    )
  );

-- INSERT: admin (cualquier estado) OR negocio (solo no publicado)
create policy "Perfiles insert admin" on public.profiles for insert
  with check (public.is_admin());

create policy "Perfiles insert negocio no publicado" on public.profiles for insert
  with check (
    is_published = false and public.is_negocio()
  );

-- UPDATE: admin (todo) OR negocio owner (featured protegido por trigger)
create policy "Perfiles update admin" on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

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
create policy "Perfiles delete admin" on public.profiles for delete
  using (public.is_admin());

-- ============================================================
-- 4. profile_owners — políticas finales
-- ============================================================
drop policy if exists "Owners lectura propias" on public.profile_owners;
drop policy if exists "Owners lectura propias o admin" on public.profile_owners;
drop policy if exists "Owners insert propias" on public.profile_owners;
drop policy if exists "Owners insert propia" on public.profile_owners;
drop policy if exists "Owners update admin" on public.profile_owners;
drop policy if exists "Owners delete admin" on public.profile_owners;

-- SELECT: propio usuario OR admin
create policy "Owners lectura propias o admin" on public.profile_owners for select
  using (auth.uid() = user_id or public.is_admin());

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
-- 5. deletion_requests — políticas finales
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

drop policy if exists "Deletion lectura propias o admin" on public.deletion_requests;
drop policy if exists "Deletion insert propias" on public.deletion_requests;
drop policy if exists "Deletion update admin" on public.deletion_requests;
drop policy if exists "Deletion delete admin" on public.deletion_requests;

-- SELECT: el negocio ve sus propias solicitudes, admin ve todas
create policy "Deletion lectura propias o admin" on public.deletion_requests for select
  using (auth.uid() = user_id or public.is_admin());

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
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE: solo admin
create policy "Deletion delete admin" on public.deletion_requests for delete
  using (public.is_admin());

-- ============================================================
-- 6. Trigger prevent_non_admin_publish (v3: owner puede publicar)
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

  -- Owner NO puede cambiar featured (solo admin)
  if new.featured is distinct from old.featured then
    raise exception 'Solo el administrador puede destacar perfiles';
  end if;

  -- Debe ser owner del perfil
  if not exists (
    select 1 from public.profile_owners
    where profile_id = new.id and user_id = auth.uid()
  ) then
    raise exception 'No tienes permiso para modificar este perfil';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_non_admin_publish on public.profiles;
create trigger trg_prevent_non_admin_publish
  before update on public.profiles
  for each row execute function public.prevent_non_admin_publish();

-- ============================================================
-- 7. Storage — políticas finales
-- ============================================================
drop policy if exists "Imagenes lectura publica" on storage.objects;
drop policy if exists "Imagenes escritura autenticados" on storage.objects;
drop policy if exists "Imagenes update autenticados" on storage.objects;
drop policy if exists "Imagenes delete autenticados" on storage.objects;
drop policy if exists "Imagenes insert propias" on storage.objects;
drop policy if exists "Imagenes update propias" on storage.objects;
drop policy if exists "Imagenes delete propias" on storage.objects;
drop policy if exists "Imagenes admin all" on storage.objects;

-- Lectura pública
create policy "Imagenes lectura publica" on storage.objects for select
  using (bucket_id = 'profile-images');

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
  using (bucket_id = 'profile-images' and public.is_admin())
  with check (bucket_id = 'profile-images' and public.is_admin());

-- ============================================================
-- 8. categories — políticas finales
-- ============================================================
drop policy if exists "Categorias escritura solo autenticados" on public.categories;
drop policy if exists "Categorias escritura admin" on public.categories;

create policy "Categorias escritura admin" on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 9. reviews — negocio no puede reseñar su propio perfil
-- ============================================================
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
-- RESUMEN FINAL DE PERMISOS
-- ============================================================
-- PROFILES:
--   SELECT  is_published=true (público) OR admin (todos) OR owner (propios)
--   INSERT  admin (cualquier estado) OR negocio (solo is_published=false)
--   UPDATE  admin (cualquier campo) OR negocio owner (featured protegido por trigger)
--   DELETE  solo admin (negocio debe usar deletion_requests)
--
-- USER_ROLES:
--   SELECT  solo el propio usuario
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
-- DELETION_REQUESTS:
--   SELECT  propio usuario OR admin
--   INSERT  solo owner del perfil
--   UPDATE  solo admin (aprobar/rechazar)
--   DELETE  solo admin
--
-- REVIEWS:
--   SELECT  público
--   INSERT  autenticado, no puede reseñar su propio perfil
--   UPDATE  solo el autor
--   DELETE  solo el autor
--
-- STORAGE (profile-images):
--   SELECT  público
--   INSERT  autenticado en su carpeta user_id/
--   UPDATE  solo su carpeta
--   DELETE  solo su carpeta
--   ALL     admin
--
-- CATEGORIES:
--   SELECT  público (política existente)
--   ALL     admin

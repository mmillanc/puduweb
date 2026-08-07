-- ============================================================
-- PuduWeb - RLS para auto-registro de negocios
-- ============================================================
-- Permite que los negocios creen su propio perfil y ownership
-- al registrarse, sin intervención del admin.
-- El perfil queda is_published=false hasta que el admin lo apruebe.
-- ============================================================

-- Perfiles: los negocios pueden INSERT sus propios perfiles
-- (siempre en estado no publicado)
drop policy if exists "Perfiles escritura negocio propio" on public.profiles;
drop policy if exists "Perfiles escritura admin" on public.profiles;

-- Admin puede hacer todo (insert, update, delete)
create policy "Perfiles admin all" on public.profiles for all
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

-- Negocios pueden INSERT perfiles (se auto-asignan como owners después)
create policy "Perfiles insert negocio" on public.profiles for insert
  with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'negocio'
    )
  );

-- Negocios pueden UPDATE perfiles donde son owners
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

-- ============================================================
-- profile_owners: negocios pueden insertar su propio ownership
-- ============================================================
drop policy if exists "Owners lectura propias" on public.profile_owners;
alter table public.profile_owners enable row level security;

-- Lectura: el propio usuario o admin
create policy "Owners lectura propias" on public.profile_owners for select
  using (
    auth.uid() = user_id or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Inserción: el propio usuario puede insertar su ownership
-- (siempre que sea para sí mismo)
create policy "Owners insert propias" on public.profile_owners for insert
  with check (auth.uid() = user_id);

-- Delete: solo admin
create policy "Owners delete admin" on public.profile_owners for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

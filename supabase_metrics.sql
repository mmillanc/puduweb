-- ============================================================
-- PuduWeb - Métricas y mensajes de contacto
-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de vistas por perfil (una fila por visita)
create table if not exists public.profile_views (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  viewed_at timestamptz default now()
);

create index if not exists idx_views_profile on public.profile_views(profile_id);
create index if not exists idx_views_date on public.profile_views(viewed_at);

-- RLS: lectura solo para el owner del perfil o admin
alter table public.profile_views enable row level security;

create policy "Views lectura propias" on public.profile_views for select
  using (
    exists (
      select 1 from public.profile_owners
      where profile_id = profile_views.profile_id and user_id = auth.uid()
    ) or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Inserción: cualquier usuario autenticado o anónimo puede registrar una vista
-- Necesitamos permitir insert anónimo para visitas sin login
create policy "Views insert public" on public.profile_views for insert
  with check (true);

-- ============================================================

-- Tabla de mensajes de contacto
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null,
  sender_email text not null,
  sender_phone text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_messages_profile on public.contact_messages(profile_id);
create index if not exists idx_messages_read on public.contact_messages(is_read);

-- RLS para mensajes
alter table public.contact_messages enable row level security;

-- Inserción: cualquier persona puede enviar un mensaje
create policy "Messages insert public" on public.contact_messages for insert
  with check (true);

-- Lectura: solo el owner del perfil o admin pueden ver mensajes
create policy "Messages lectura propias" on public.contact_messages for select
  using (
    exists (
      select 1 from public.profile_owners
      where profile_id = contact_messages.profile_id and user_id = auth.uid()
    ) or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Update: marcar como leído (solo owner o admin)
create policy "Messages update propias" on public.contact_messages for update
  using (
    exists (
      select 1 from public.profile_owners
      where profile_id = contact_messages.profile_id and user_id = auth.uid()
    ) or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Delete: solo owner o admin
create policy "Messages delete propias" on public.contact_messages for delete
  using (
    exists (
      select 1 from public.profile_owners
      where profile_id = contact_messages.profile_id and user_id = auth.uid()
    ) or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Función: obtener métricas de un perfil
-- ============================================================
create or replace function public.get_profile_stats(profile_uuid uuid)
returns table (total_views bigint, unique_views bigint, unread_messages bigint, total_messages bigint)
language sql
stable
security definer
as $$
  select
    (select count(*) from public.profile_views where profile_id = profile_uuid)::bigint as total_views,
    (select count(distinct viewer_id) from public.profile_views where profile_id = profile_uuid and viewer_id is not null)::bigint as unique_views,
    (select count(*) from public.contact_messages where profile_id = profile_uuid and is_read = false)::bigint as unread_messages,
    (select count(*) from public.contact_messages where profile_id = profile_uuid)::bigint as total_messages;
$$;

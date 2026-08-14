-- ============================================
-- Trigger: Procesar registro de usuario
-- Se ejecuta cuando se registra un nuevo usuario
-- ============================================

-- Necesitamos la extensión unaccent para quitar acentos
create extension if not exists unaccent;

-- Función slugify en SQL (equivalente a la del frontend)
create or replace function public.slugify(input text)
returns text as $$
select lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        replace(
          unaccent(input),
          '[^a-zA-Z0-9 -]',
          ''
        ),
        '\s+',
        '-'
      ),
      '-+',
      '-'
    ),
    '^-+|-+$',
    ''
  )
);
$$ language sql immutable;

-- Función que procesa el nuevo usuario
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_profile_id uuid;
  v_slug text;
  v_existing_slug text;
  v_counter int := 0;
begin
  -- Evitar duplicados: si ya tiene rol, no procesar
  if exists (select 1 from public.user_roles where user_id = new.id) then
    return new;
  end if;

  -- Obtener rol desde metadata (por defecto 'usuario')
  v_role := coalesce(new.raw_user_meta_data->>'role', 'usuario');

  -- Insertar rol
  insert into public.user_roles (user_id, role)
  values (new.id, v_role);

  -- Si es negocio, crear perfil
  if v_role = 'negocio' then
    -- Generar slug único
    v_slug := public.slugify(coalesce(new.raw_user_meta_data->>'biz_name', 'perfil'));

    -- Verificar si el slug ya existe y agregar sufijo
    loop
      if v_counter = 0 then
        select slug into v_existing_slug from public.profiles where slug = v_slug limit 1;
      else
        select slug into v_existing_slug from public.profiles where slug = v_slug || '-' || v_counter limit 1;
      end if;

      exit when v_existing_slug is null;

      v_counter := v_counter + 1;
    end loop;

    if v_counter > 0 then
      v_slug := v_slug || '-' || v_counter;
    end if;

    -- Insertar perfil
    insert into public.profiles (
      name, slug, type, category_id, tagline, description,
      city, phone, email, website, instagram, whatsapp,
      is_published, featured
    )
    values (
      coalesce(new.raw_user_meta_data->>'biz_name', 'Sin nombre'),
      v_slug,
      coalesce(new.raw_user_meta_data->>'biz_type', 'pyme')::text,
      nullif(new.raw_user_meta_data->>'biz_category_id', '')::uuid,
      nullif(new.raw_user_meta_data->>'biz_tagline', ''),
      nullif(new.raw_user_meta_data->>'biz_description', ''),
      nullif(new.raw_user_meta_data->>'biz_city', ''),
      nullif(new.raw_user_meta_data->>'biz_phone', ''),
      new.email,
      nullif(new.raw_user_meta_data->>'biz_website', ''),
      nullif(new.raw_user_meta_data->>'biz_instagram', ''),
      nullif(new.raw_user_meta_data->>'biz_whatsapp', ''),
      false,
      false
    )
    returning id into v_profile_id;

    -- Asignar ownership
    if v_profile_id is not null then
      insert into public.profile_owners (profile_id, user_id)
      values (v_profile_id, new.id);
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger: después de insert (procesa inmediatamente al registrarse)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Eliminar trigger de update de email_confirmed_at (ya no es necesario)
drop trigger if exists on_auth_user_confirmed on auth.users;

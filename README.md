# PuduWeb

Directorio de profesionales, pymes y vendedores estilo páginas amarillas. Los usuarios pueden buscar perfiles por categoría, tipo o ubicación, ver tarjetas resumidas y al hacer clic acceder a una página de detalle tipo landing con toda la información.

## Stack

- **Next.js 16** (App Router, React Compiler)
- **React 19** + **TypeScript 5**
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL + Auth)
- **lucide-react** (iconos)

## Configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. En **Project Settings > API**, copia:
   - `Project URL` (ej: `https://xxxxx.supabase.co`)
   - `anon public key`

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa con tus datos:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Crear tablas en Supabase

Abre el **SQL Editor** en Supabase y ejecuta el archivo `supabase_setup.sql` (incluido en la raíz del proyecto). Esto crea:
- Tabla `categories` con 12 categorías iniciales
- Tabla `profiles` con todos los campos
- Políticas RLS (lectura pública, escritura solo autenticados)
- Índices para búsqueda

### 4. Crear usuario administrador

1. En Supabase, ve a **Authentication > Users**.
2. Click **Add user** y crea un usuario con email y contraseña.
3. Este usuario podrá iniciar sesión en `/admin/login`.

### 5. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

```
app/
├── layout.tsx              # Layout raíz (navbar + footer)
├── page.tsx                # Home: búsqueda, filtros y grid de tarjetas
├── globals.css             # Estilos globales (Tailwind v4 + variables)
├── categorias/page.tsx     # Listado de categorías con contador
├── perfil/[slug]/page.tsx  # Página de detalle de perfil (landing)
├── admin/
│   ├── layout.tsx          # Protección de rutas admin
│   ├── page.tsx            # Dashboard: listado + CRUD de perfiles
│   └── login/page.tsx      # Login admin
components/
├── navbar.tsx              # Navbar con menú responsive
├── footer.tsx              # Footer
├── profile-card.tsx        # Tarjeta de perfil (vista resumida)
└── profile-form.tsx        # Formulario crear/editar perfil
lib/
├── supabase-client.ts      # Cliente Supabase (browser)
├── supabase-server.ts      # Cliente Supabase (server-side)
├── types.ts                # Tipos TypeScript
└── utils.ts                # Utilidades (cn, slugify)
```

## Funcionalidades

- **Búsqueda** por nombre, tagline o ciudad (con debounce)
- **Filtros** por categoría y tipo (profesional, pyme, vendedor)
- **Tarjetas** con avatar, portada, tagline, categoría y ubicación
- **Página de detalle** con descripción, servicios, galería, contacto, redes sociales y WhatsApp
- **Panel admin** con login, listado de perfiles, crear/editar/eliminar, publicar/despublicar, destacar
- **Soporte dark mode** automático
- **Diseño responsive**

## Próximas funcionalidades sugeridas

- Sistema de reseñas y calificaciones
- Perfiles favoritos
- Carga de imágenes a Supabase Storage
- Mapa interactivo con ubicación
- Páginas de categoría individuales
- SEO con sitemap y Open Graph
- Autogestión para profesionales (registro propio)

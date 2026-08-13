# Flujo de trabajo: Staging vs Producción

## Estructura de ramas

```
main      → Producción (puduweb.cl)
staging   → Staging (staging-puduweb.vercel.app)
feature/* → Preview individual (auto-generado por Vercel)
```

## Flujo diario

### 1. Crear una nueva funcionalidad

```bash
git checkout staging
git pull origin staging
git checkout -b feature/nueva-funcion
```

### 2. Desarrollar y hacer commit

```bash
git add .
git commit -m "Agrega nueva función"
git push origin feature/nueva-funcion
```

### 3. Vercel genera un Preview automáticamente

Al hacer push, Vercel crea una URL temporal tipo:
```
https://puduweb-git-feature-nueva-funcion-mmillanc.vercel.app
```

### 4. Probar en el Preview

- Abre la URL del preview
- Prueba la funcionalidad
- Si hay errores, corrige y vuelve a hacer push

### 5. Merge a staging

Cuando el preview funciona correctamente:

```bash
git checkout staging
git pull origin staging
git merge feature/nueva-funcion
git push origin staging
```

Vercel despliega automáticamente en `staging-puduweb.vercel.app`.

### 6. Probar en staging

- Prueba todo el flujo completo en staging
- Verifica que no rompa funcionalidades existentes

### 7. Merge a producción

Cuando staging está 100% verificado:

```bash
git checkout main
git pull origin main
git merge staging
git push origin main
```

Vercel despliega automáticamente en `puduweb.cl`.

## Configuración de variables de entorno en Vercel

### Production (main)
```
NEXT_PUBLIC_SUPABASE_URL    = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = tu-anon-key-prod
NEXT_PUBLIC_SITE_URL        = https://puduweb.cl
```

### Staging (staging)
```
NEXT_PUBLIC_SUPABASE_URL    = https://tu-proyecto-staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = tu-anon-key-staging
NEXT_PUBLIC_SITE_URL        = https://staging-puduweb.vercel.app
```

### Preview (feature/*)
Usar las mismas variables de staging.

## Configuración de Supabase

### Opción A: Proyecto Supabase separado (recomendado)

1. Crear un nuevo proyecto en Supabase para staging
2. Ejecutar todos los scripts SQL en el proyecto de staging:
   - `supabase_schema.sql`
   - `supabase_roles.sql`
   - `supabase_security_fix.sql`
   - `supabase_security_fix_v2.sql`
   - `supabase_security_fix_v3.sql`
   - `supabase_fix_recursion.sql`
   - `supabase_fix_views.sql`
   - `supabase_signup_trigger.sql`
   - `supabase_extras.sql`
3. Crear usuarios de prueba
4. Configurar las variables de entorno en Vercel para staging

### Opción B: Mismo proyecto Supabase (no recomendado)

Si no quieres crear un proyecto separado, puedes usar el mismo Supabase
pero ten cuidado: los cambios en la base de datos afectarán producción.

## Configuración en Vercel

1. Ve a tu proyecto en Vercel → Settings → Git
2. Production Branch: `main`
3. En Settings → Environment Variables:
   - Crear variables para "Production" con los valores de prod
   - Crear variables para "Preview" y "Staging" con los valores de staging

## Resumen visual

```
GitHub
  │
  ├── main ──────────────→ PRODUCCIÓN (puduweb.cl)
  │                          Usuarios reales
  │
  ├── staging ───────────→ STAGING (staging-puduweb.vercel.app)
  │                          Solo pruebas
  │
  └── feature/* ─────────→ PREVIEW (URL temporal)
                             Pruebas individuales
```

Flujo: `feature/* → Preview → staging → main → Producción`

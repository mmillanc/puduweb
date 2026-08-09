import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad | PuduWeb",
  description: "Cómo PuduWeb recopila, usa y protege tu información.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Política de privacidad</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Última actualización: {new Date().getFullYear()}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">1. Datos que recopilamos</h2>
          <p>
            Al registrarte recopilamos tu email y contraseña (encriptada). Los negocios
            pueden proporcionar nombre, teléfono, ciudad, redes sociales y descripción de
            su servicio. Los usuarios pueden dejar reseñas y guardar favoritos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">2. Uso de los datos</h2>
          <p>
            Usamos tu información para: mostrar perfiles en el directorio, permitir contacto
            entre usuarios y negocios, mostrar métricas a los negocios (vistas y mensajes),
            y mejorar la plataforma. No vendemos ni alquilamos tus datos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">3. Visibilidad pública</h2>
          <p>
            La información de los perfiles de negocio (nombre, descripción, contacto, redes
            sociales) es visible públicamente en el directorio. Tu email de cuenta no se
            muestra públicamente, salvo que lo incluyas en los datos de tu perfil.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">4. Cookies y autenticación</h2>
          <p>
            Usamos cookies de autenticación de Supabase para mantener tu sesión iniciada.
            No usamos cookies de terceros para publicidad.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">5. Almacenamiento seguro</h2>
          <p>
            Los datos se almacenan en Supabase (PostgreSQL) con Row Level Security. Las
            contraseñas se encriptan automáticamente. Las imágenes se almacenan en
            Supabase Storage con políticas de acceso controlado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">6. Tus derechos</h2>
          <p>
            Puedes solicitar acceso, modificación o eliminación de tus datos en cualquier
            momento contactándonos a través del formulario de /contacto. Eliminaremos tus
            datos dentro de los 30 días siguientes a tu solicitud.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">7. Mensajes de contacto</h2>
          <p>
            Los mensajes enviados a través de los formularios de perfil son visibles para el
            negocio dueño del perfil y los administradores. No se comparten con terceros.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">8. Contacto</h2>
          <p>
            Si tienes preguntas sobre privacidad, escríbenos a través del formulario de
            /contacto.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}

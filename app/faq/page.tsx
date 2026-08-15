import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | PuduWeb",
  description: "Resuelve tus dudas sobre PuduWeb: cómo registrarse, crear perfiles, reseñas y más.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "¿Cómo me registro en PuduWeb?",
    a: "Ve a /registro, elige tipo de cuenta (Usuario o Negocio) y completa el formulario. Si eres negocio, podrás crear tu perfil inmediatamente con todos tus datos.",
  },
  {
    q: "¿Cuánto cuesta publicar mi perfil?",
    a: "PuduWeb es gratuito. Puedes crear tu perfil, recibir mensajes y reseñas sin costo. En el futuro podrían existir planes premium con beneficios adicionales.",
  },
  {
    q: "¿Por qué mi perfil aparece como borrador?",
    a: "Cuando registras tu negocio, el perfil se crea como borrador para que un administrador lo revise. Una vez aprobado, se publica y aparece en las búsquedas. Tú puedes seguir editándolo mientras tanto.",
  },
  {
    q: "¿Cómo puedo editar mi perfil?",
    a: "Inicia sesión como negocio, ve a 'Mi Negocio' en el menú y haz clic en el botón de editar. Podrás actualizar todos los campos: descripción, fotos, redes sociales, etc.",
  },
  {
    q: "¿Puedo dejar reseñas a cualquier perfil?",
    a: "Sí, necesitas tener una cuenta de usuario iniciada sesión. Cada usuario puede dejar una reseña por perfil, con calificación de 1 a 5 estrellas y un comentario.",
  },
  {
    q: "¿Cómo funcionan los favoritos?",
    a: "Haz clic en el botón de corazón en cualquier perfil para guardarlo. Puedes ver todos tus favoritos en la página /favoritos. Necesitas iniciar sesión para usar esta función.",
  },
  {
    q: "¿Cómo contacto a un profesional o pyme?",
    a: "En cada perfil encontrarás los datos de contacto (teléfono, email, WhatsApp) y un formulario de mensaje directo. El negocio recibirá tu mensaje en su panel.",
  },
  {
    q: "¿Puedo tener más de un perfil?",
    a: "Sí, un negocio puede tener múltiples perfiles. El administrador puede asignarte perfiles adicionales desde el panel de administración.",
  },
  {
    q: "¿Cómo elimino mi cuenta?",
    a: "Contáctanos a través del formulario de /contacto y procesaremos la eliminación de tu cuenta y datos asociados.",
  },
  {
    q: "¿Qué hace PuduWeb con mis datos?",
    a: "Tus datos se usan únicamente para mostrar tu perfil en el directorio y permitir el contacto con potenciales clientes. No vendemos ni compartimos tu información. Ver nuestra /privacidad.",
  },
  {
    q: "¿Por qué al iniciar sesión con Google veo una dirección .supabase.co?",
    a: "PuduWeb utiliza Supabase como proveedor seguro de autenticación. Por eso, cuando inicias sesión con Google, Google muestra que estás dando acceso a la URL de nuestro proyecto en Supabase (un dominio .supabase.co). Es normal y seguro: Supabase solo gestiona el inicio de sesión y luego te redirige de vuelta a puduweb.cl. Tus credenciales de Google nunca pasan por nuestros servidores.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Preguntas frecuentes</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Todo lo que necesitas saber sobre PuduWeb.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border bg-card p-4 [&_summary]:cursor-pointer"
          >
            <summary className="flex items-center justify-between font-medium marker:content-none">
              {faq.q}
              <span className="ml-2 text-muted-foreground transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </p>
          </details>
        ))}
      </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-8 text-center text-white">
          <p className="font-medium text-lg">¿No encuentras tu respuesta?</p>
          <p className="mt-1 text-sm text-white/80">Estamos aquí para ayudarte</p>
          <Link
            href="/contacto"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-primary hover:bg-white/90 transition"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </div>
  );
}

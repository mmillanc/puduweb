import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de uso | PuduWeb",
  description: "Términos y condiciones de uso de la plataforma PuduWeb.",
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Términos de uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: {new Date().getFullYear()}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">1. Aceptación de términos</h2>
          <p>
            Al usar PuduWeb aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">2. Descripción del servicio</h2>
          <p>
            PuduWeb es un directorio local que conecta profesionales, pymes y vendedores con
            personas que buscan sus servicios. El servicio incluye creación de perfiles,
            reseñas, favoritos y mensajería directa.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">3. Registro y cuentas</h2>
          <p>
            Debes proporcionar información veraz al registrarte. Eres responsable de mantener
            la confidencialidad de tu contraseña. Los negocios son responsables de la
            veracidad de la información en sus perfiles.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">4. Contenido de perfiles</h2>
          <p>
            Los negocios son responsables del contenido publicado en sus perfiles. PuduWeb se
            reserva el derecho de despublicar o eliminar perfiles que contengan información
            falsa, spam, contenido ofensivo o que violen estos términos.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">5. Reseñas</h2>
          <p>
            Las reseñas deben ser honestas y basadas en experiencias reales. PuduWeb puede
            eliminar reseñas falsas, ofensivas o que no cumplan con las normas de la comunidad.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">6. Propiedad intelectual</h2>
          <p>
            Mantienes los derechos sobre el contenido que publicas. Al subir contenido a
            PuduWeb, nos otorgas una licencia para mostrarlo dentro de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">7. Limitación de responsabilidad</h2>
          <p>
            PuduWeb es un directorio y no se hace responsable de la calidad de los servicios
            ofrecidos por los perfiles listados. Las transacciones entre usuarios y negocios
            son responsabilidad exclusiva de las partes involucradas.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">8. Modificaciones</h2>
          <p>
            PuduWeb puede modificar estos términos en cualquier momento. Los cambios
            entrarán en vigor al publicarse en esta página.
          </p>
        </section>
      </div>
    </div>
  );
}

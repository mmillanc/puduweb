import type { Metadata } from "next";
import Link from "next/link";
import { Target, Heart, Users, TrendingUp, Store, Search, ShieldCheck, MessageSquare, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre PuduWeb - Presencia digital sencilla para pequeños negocios",
  description:
    "PuduWeb ayuda a que pequeños negocios y profesionales tengan una página de presentación clara, con contacto y reseñas, sin necesidad de construir un sitio web completo.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/7-nosotros.png" alt="PuduWeb" className="mx-auto mb-6 h-36 w-auto rounded-2xl" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Sobre <span className="text-primary">PuduWeb</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Una plataforma pensada para dar presencia digital sencilla a quienes no tienen tiempo, presupuesto o ganas de construir una web desde cero.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8 transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target size={24} />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Nuestra misión</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Hacer visible el trabajo de pequeños negocios y profesionales. Creemos que tener una página clara, con información ordenada y un botón de contacto, no debería ser un lujo.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Heart size={24} />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Nuestros valores</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Transparencia, cercanía y utilidad real. Más que sumar perfiles, queremos que cada negocio tenga una ficha útil que sus clientes entiendan y puedan compartir.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">Cómo funciona</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Search size={24} />
              </div>
              <h3 className="mb-2 font-semibold">1. Busca</h3>
              <p className="text-sm text-muted-foreground">
                Filtra por categoría, ubicación o tipo de servicio. Encuentra negocios reales cerca de ti en segundos.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users size={24} />
              </div>
              <h3 className="mb-2 font-semibold">2. Conoce</h3>
              <p className="text-sm text-muted-foreground">
                Revisa la página del negocio, lee reseñas de otros usuarios y entiende qué ofrece antes de escribir o llamar.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store size={24} />
              </div>
              <h3 className="mb-2 font-semibold">3. Conecta</h3>
              <p className="text-sm text-muted-foreground">
                Envía un mensaje directo desde la ficha o usa los datos de contacto. Sin intermediarios, sin comisiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For businesses */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold">Pensado para profesionales y pymes</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 text-center transition hover:shadow-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp size={24} />
            </div>
            <h3 className="mb-1 font-semibold">Visibilidad</h3>
            <p className="text-sm text-muted-foreground">
              Aparece en búsquedas y categorías con una página que puedes usar como tu "sitio oficial".
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 text-center transition hover:shadow-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Star size={24} />
            </div>
            <h3 className="mb-1 font-semibold">Reseñas reales</h3>
            <p className="text-sm text-muted-foreground">
              Tus clientes pueden dejarte reseñas que construyen tu reputación y dan confianza a quienes aún no te conocen.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 text-center transition hover:shadow-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare size={24} />
            </div>
            <h3 className="mb-1 font-semibold">Mensajes directos</h3>
            <p className="text-sm text-muted-foreground">
              Recibe mensajes de clientes potenciales directamente en tu panel, sin depender sólo de mensajes perdidos en redes sociales.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-blue-600 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold">¿Listo para unirte?</h2>
          <p className="mt-2 text-white/90">
            Crea tu cuenta y empieza a gestionar tu presencia online.
          </p>
          <Link
            href="/registro"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90 transition"
          >
            Registrarse
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

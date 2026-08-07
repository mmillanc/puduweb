import type { Metadata } from "next";
import Link from "next/link";
import { Target, Heart, Users, TrendingUp, Store, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre PuduWeb - Directorio local de profesionales y pymes",
  description:
    "PuduWeb conecta profesionales, pymes y vendedores con personas que buscan sus servicios. Conoce nuestra misión y cómo funcionamos.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Sobre PuduWeb</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        El directorio local que conecta profesionales, pymes y vendedores con las
        personas que los buscan.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <Target className="mb-3 text-primary" size={28} />
          <h2 className="mb-2 font-semibold">Nuestra misión</h2>
          <p className="text-sm text-muted-foreground">
            Hacer visible el talento local. Creemos que cada profesional y pyme
            merece ser encontrado por las personas que necesitan sus servicios,
            sin barreras ni costos excesivos.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <Heart className="mb-3 text-primary" size={28} />
          <h2 className="mb-2 font-semibold">Nuestros valores</h2>
          <p className="text-sm text-muted-foreground">
            Transparencia, cercanía y utilidad real. No somos un directorio
            estático: somos una plataforma viva donde cada perfil cuenta con
            reseñas, métricas y contacto directo.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Cómo funciona</h2>
      <div className="mt-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Search size={20} />
          </div>
          <div>
            <h3 className="font-medium">1. Busca</h3>
            <p className="text-sm text-muted-foreground">
              Filtra por categoría, ubicación o tipo de servicio. Encuentra
              profesionales cerca de ti en segundos.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-medium">2. Conoce</h3>
            <p className="text-sm text-muted-foreground">
              Revisa el perfil, lee reseñas de otros usuarios, mira métricas y
              servicios ofrecidos antes de tomar contacto.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store size={20} />
          </div>
          <div>
            <h3 className="font-medium">3. Conecta</h3>
            <p className="text-sm text-muted-foreground">
              Envía un mensaje directo desde el perfil o usa los datos de
              contacto. Sin intermediarios, sin comisiones.
            </p>
          </div>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Para profesionales y pymes</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4 text-center">
          <TrendingUp className="mx-auto mb-2 text-primary" size={24} />
          <p className="text-sm font-medium">Visibilidad</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aparece en búsquedas y categorías con tu propio perfil
          </p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <Users className="mx-auto mb-2 text-primary" size={24} />
          <p className="text-sm font-medium">Reseñas reales</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tus clientes pueden dejarte reseñas que construyen tu reputación
          </p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <Target className="mx-auto mb-2 text-primary" size={24} />
          <p className="text-sm font-medium">Métricas</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ve cuántas visitas y mensajes recibes desde tu panel
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-xl bg-primary/5 p-8 text-center">
        <h2 className="text-xl font-semibold">¿Listo para unirte?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea tu cuenta y empieza a gestionar tu presencia online.
        </p>
        <Link
          href="/registro"
          className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Registrarse gratis
        </Link>
      </div>
    </div>
  );
}

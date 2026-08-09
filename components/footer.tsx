import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="PuduWeb" className="h-11 w-auto" />
            <p className="mt-2 text-sm text-muted-foreground">
              El directorio local que conecta profesionales, pymes y vendedores con las personas que los buscan.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Plataforma</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/categorias" className="hover:text-primary transition-colors">Categorías</Link></li>
              <li><Link href="/sobre-nosotros" className="hover:text-primary transition-colors">Sobre nosotros</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Cuenta</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/registro" className="hover:text-primary transition-colors">Registrarse</Link></li>
              <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terminos" className="hover:text-primary transition-colors">Términos de uso</Link></li>
              <li><Link href="/privacidad" className="hover:text-primary transition-colors">Política de privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PuduWeb. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

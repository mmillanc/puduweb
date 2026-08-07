import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">PuduWeb</span>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}
            </span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link
              href="/categorias"
              className="hover:text-primary transition-colors"
            >
              Categorías
            </Link>
            <Link
              href="/sobre-nosotros"
              className="hover:text-primary transition-colors"
            >
              Sobre nosotros
            </Link>
            <Link
              href="/contacto"
              className="hover:text-primary transition-colors"
            >
              Contacto
            </Link>
            <Link
              href="/login"
              className="hover:text-primary transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="hover:text-primary transition-colors"
            >
              Registrarse
            </Link>
            <Link
              href="/faq"
              className="hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/terminos"
              className="hover:text-primary transition-colors"
            >
              Términos
            </Link>
            <Link
              href="/privacidad"
              className="hover:text-primary transition-colors"
            >
              Privacidad
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

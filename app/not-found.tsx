import Link from "next/link";
import { Home, FolderTree, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="mb-6 text-muted-foreground" size={64} />
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Página no encontrada</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        La página que buscas no existe o fue movida. Aquí algunas opciones:
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/50"
        >
          <Home className="text-primary" size={20} />
          <div>
            <p className="text-sm font-medium">Ir al inicio</p>
            <p className="text-xs text-muted-foreground">Explora todos los perfiles</p>
          </div>
        </Link>

        <Link
          href="/categorias"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/50"
        >
          <FolderTree className="text-primary" size={20} />
          <div>
            <p className="text-sm font-medium">Ver categorías</p>
            <p className="text-xs text-muted-foreground">Busca por tipo de servicio</p>
          </div>
        </Link>

        <Link
          href="/sobre-nosotros"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/50"
        >
          <FolderTree className="text-primary" size={20} />
          <div>
            <p className="text-sm font-medium">Sobre PuduWeb</p>
            <p className="text-xs text-muted-foreground">Conoce cómo funcionamos</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

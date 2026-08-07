"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="mb-4 text-red-500" size={48} />
      <h2 className="mb-2 text-xl font-semibold">Algo salió mal</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Ocurrió un error al cargar la página. Intenta nuevamente.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Reintentar
      </button>
    </div>
  );
}

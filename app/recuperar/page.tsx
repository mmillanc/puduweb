"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        if (error.message.includes("rate limit")) {
          setError("Demasiados intentos. Espera unos minutos antes de intentar de nuevo.");
        } else {
          setError(error.message);
        }
        return;
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
          <CheckCircle2 className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Revisa tu email</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Te enviamos un enlace a <strong>{email}</strong> para restablecer tu contraseña.
          El enlace expira en 1 hora.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Volver a iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Enviar enlace de recuperación"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <a href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
          <ArrowLeft size={14} />
          Volver a iniciar sesión
        </a>
      </p>
    </div>
  );
}

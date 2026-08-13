"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogIn, Mail, Lock, ArrowRight, Store, Search, Star, Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const message = searchParams.get("message");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!data.user) {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
        return;
      }

      // Intentar obtener rol via RPC (security definer, bypassa RLS)
      let role: string | null = null;
      const { data: rpcData, error: rpcError } = await supabase
        .rpc("get_user_role", { user_uuid: data.user.id });

      if (rpcError) {
        console.error("RPC get_user_role error:", rpcError);
        // Fallback: intentar query directa
        const { data: directData, error: directError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

        if (directError) {
          console.error("Direct query error:", directError);
        }
        role = directData?.role ?? null;
      } else {
        role = rpcData as string;
      }

      console.log("Login exitoso - role:", role, "user:", data.user.id);

      // Forzar la sesión en el cliente antes de navegar
      if (data.session) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (setSessionError) {
          console.error("Error setSession:", setSessionError);
        }

        // Fallback: guardar tokens en sessionStorage por si Supabase no los persiste
        try {
          sessionStorage.setItem("puduweb_login_token", data.session.access_token);
          sessionStorage.setItem("puduweb_login_refresh", data.session.refresh_token);
          sessionStorage.setItem("puduweb_login_role", role ?? "");
        } catch {
          // ignore storage errors
        }
      }

      let session: Session | null = data.session;
      if (!session) {
        let attempts = 0;
        while (attempts < 20 && !session) {
          const { data: { session: s } } = await supabase.auth.getSession();
          session = s;
          if (!session) {
            await new Promise((r) => setTimeout(r, 100));
          }
          attempts++;
        }
      }

      if (!session) {
        setError("No se pudo iniciar sesión correctamente. Intenta de nuevo.");
        return;
      }

      if (!role) {
        window.location.href = "/";
        return;
      }

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "negocio") {
        window.location.href = "/negocio";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center px-4 py-12">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border shadow-lg lg:grid-cols-2">
        {/* Left side - Brand panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-primary to-blue-600 p-10 text-white lg:flex">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="PuduWeb" className="h-14 w-auto brightness-0 invert" />
            <h2 className="mt-8 text-3xl font-bold leading-tight">
              Accede a tu cuenta y gestiona tu presencia online
            </h2>
            <p className="mt-4 text-white/80">
              Inicia sesión para gestionar tu perfil, ver métricas y recibir mensajes de clientes.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Store size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">Gestiona tu negocio</p>
                <p className="text-xs text-white/70">Edita tu perfil y servicios</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Search size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">Recibe mensajes</p>
                <p className="text-xs text-white/70">Conecta con clientes directamente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Star size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">Mide tu impacto</p>
                <p className="text-xs text-white/70">Visualiza visitas y reseñas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex flex-col justify-center bg-card p-8 sm:p-10">
          <h1 className="mb-2 text-2xl font-bold">Iniciar sesión</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Accede a tu cuenta de PuduWeb.
          </p>

          {message && (
            <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              {message}
            </div>
          )}

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
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                <>
                  Iniciar sesión
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <a href="/registro" className="font-medium text-primary hover:underline">
              Registrarse
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

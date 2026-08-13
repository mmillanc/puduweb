"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.user) {
        setError("No se pudo iniciar sesión.");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .rpc("get_user_role", { user_uuid: data.user.id });

      if (roleError) {
        console.error("Error fetching role:", roleError);
      }

      const role = (roleData as string) ?? "usuario";
      console.log("Admin login - role:", role, "user:", data.user.id);

      // Forzar la sesión en el cliente antes de navegar
      if (data.session) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (setSessionError) {
          console.error("Admin setSession error:", setSessionError);
        }

        try {
          sessionStorage.setItem("puduweb_login_token", data.session.access_token);
          sessionStorage.setItem("puduweb_login_refresh", data.session.refresh_token);
          sessionStorage.setItem("puduweb_login_role", role);
        } catch {
          // ignore
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

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "negocio") {
        window.location.href = "/negocio";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="text-primary" size={28} />
          </div>
          <h1 className="text-2xl font-bold">Acceso Administrador</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para gestionar perfiles
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-xl border bg-card p-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@puduweb.cl"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

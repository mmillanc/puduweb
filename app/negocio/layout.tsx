"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";

export default function NegocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    let usedFallback = false;
    let resolved = false;

    async function trySession(): Promise<void> {
      if (!mounted || resolved) return;
      attempts++;
      console.log(`Negocio layout: attempt ${attempts}`);

      let { data: { session } } = await supabase.auth.getSession();

      // Fallback: si no hay sesión, intentar con tokens de sessionStorage
      if (!session && !usedFallback) {
        const token = sessionStorage.getItem("puduweb_login_token");
        const refresh = sessionStorage.getItem("puduweb_login_refresh");
        if (token && refresh) {
          console.log("Negocio layout: trying sessionStorage fallback");
          usedFallback = true;
          const { data: setData, error: setErr } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
          });
          if (setErr) {
            console.error("Negocio layout: setSession error", setErr);
          } else if (setData.session) {
            session = setData.session;
            sessionStorage.removeItem("puduweb_login_token");
            sessionStorage.removeItem("puduweb_login_refresh");
            sessionStorage.removeItem("puduweb_login_role");
          }
        }
      }

      if (session) {
        await handleSessionFound(session);
      }
    }

    async function handleSessionFound(session: { user: { id: string } }): Promise<void> {
      if (!mounted || resolved) return;
      resolved = true;
      clearInterval(interval);

      console.log("Negocio layout: session found for user", session.user.id);

      const { data: roleData, error: roleError } = await supabase
        .rpc("get_user_role", { user_uuid: session.user.id });
      if (!mounted) return;

      if (roleError) {
        console.error("Negocio layout: role error", roleError);
      }

      const role = (roleData as string) ?? "usuario";
      console.log("Negocio layout: role =", role);

      if (role === "admin") {
        router.replace("/admin");
        return;
      }
      if (role !== "negocio") {
        router.replace("/");
        return;
      }

      setChecking(false);
    }

    // Polling cada 500ms como backup
    const interval = setInterval(() => {
      if (!mounted || resolved) return;
      if (attempts >= 10) {
        console.log("Negocio layout: no session after 10 attempts, redirecting to /login");
        clearInterval(interval);
        router.replace("/login");
        return;
      }
      trySession();
    }, 500);

    // onAuthStateChange: captura INITIAL_SESSION cuando Supabase carga desde localStorage
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Negocio layout: auth event:", event, !!session);
        if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          handleSessionFound(session);
        }
      }
    );

    // Intento inmediato
    trySession();

    return () => {
      mounted = false;
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}

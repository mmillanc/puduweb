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

    const interval = setInterval(async () => {
      if (!mounted) return;
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
        console.log("Negocio layout: session found for user", session.user.id);
        clearInterval(interval);

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
        return;
      }

      if (attempts >= 10) {
        console.log("Negocio layout: no session after 10 attempts, redirecting to /login");
        clearInterval(interval);
        router.replace("/login");
      }
    }, 500);

    return () => {
      mounted = false;
      clearInterval(interval);
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

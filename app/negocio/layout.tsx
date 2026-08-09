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
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function handleSession(session: { user: { id: string } } | null) {
      if (settled) return;
      if (!session) return; // No redirigir inmediatamente si es null

      settled = true;
      clearTimeout(timeoutId);

      const { data: roleData, error: roleError } = await supabase
        .rpc("get_user_role", { user_uuid: session.user.id });

      if (roleError) {
        console.error("Negocio layout role error:", roleError);
      }

      const role = (roleData as string) ?? "usuario";
      console.log("Negocio layout - session found, role:", role);

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

    // 1. Try getSession immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // 2. Listen for session events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Negocio layout - auth event:", event, "has session:", !!session);
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          handleSession(session);
        }
      }
    );

    // 3. Only redirect to /login after 3s if no session found
    timeoutId = setTimeout(async () => {
      if (settled) return;
      // Último intento
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleSession(session);
      } else {
        console.log("Negocio layout - no session after 3s, redirecting to /login");
        settled = true;
        router.replace("/login");
      }
    }, 3000);

    return () => {
      settled = true;
      clearTimeout(timeoutId);
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

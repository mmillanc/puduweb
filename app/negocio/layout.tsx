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
      settled = true;
      clearTimeout(timeoutId);

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .rpc("get_user_role", { user_uuid: session.user.id });

      if (roleError) {
        console.error("Negocio layout role error:", roleError);
      }

      const role = (roleData as string) ?? "usuario";

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

    // 1. Try getSession immediately (works if session already in memory)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session);
      }
      // If null, wait for onAuthStateChange to fire INITIAL_SESSION
    });

    // 2. Listen for INITIAL_SESSION event (fires when session loaded from storage)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          handleSession(session);
        }
      }
    );

    // 3. Fallback: after 5s, try getSession one more time
    timeoutId = setTimeout(async () => {
      if (settled) return;
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    }, 5000);

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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
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
        console.error("Admin layout role error:", roleError);
      }

      const role = (roleData as string) ?? "usuario";

      if (role === "negocio") {
        router.replace("/negocio");
        return;
      }
      if (role !== "admin") {
        router.replace("/");
        return;
      }

      setChecking(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          handleSession(session);
        }
      }
    );

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

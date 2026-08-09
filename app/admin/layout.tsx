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
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    async function checkAccess(retries = 0) {
      const { data } = await supabase.auth.getSession();
      
      if (cancelled) return;

      if (!data.session) {
        if (retries < 2) {
          retryTimer = setTimeout(() => checkAccess(retries + 1), 800);
          return;
        }
        router.replace("/login");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .rpc("get_user_role", { user_uuid: data.session.user.id });

      if (cancelled) return;

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
    checkAccess();
    
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
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

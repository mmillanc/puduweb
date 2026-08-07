import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function NegocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: roleData } = await supabaseServer
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  const role = roleData?.role;

  if (role === "admin") {
    redirect("/admin");
  }

  if (role !== "negocio") {
    redirect("/");
  }

  return <>{children}</>;
}

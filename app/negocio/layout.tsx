import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";

export default async function NegocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseServer = await getSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: roleData } = await supabaseServer
    .rpc("get_user_role", { user_uuid: user.id });

  const role = (roleData as string) ?? "usuario";

  if (role === "admin") {
    redirect("/admin");
  }

  if (role !== "negocio") {
    redirect("/");
  }

  return <>{children}</>;
}

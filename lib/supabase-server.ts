import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getEnvOrThrow() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Faltan variables de entorno de Supabase");
  }
  return { url, key };
}

export async function getSupabaseServer(): Promise<SupabaseClient> {
  const { url, key } = getEnvOrThrow();
  const cookieStore = await cookies();
  const authCookies = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("sb-"));

  const accessToken = authCookies.find((c) =>
    c.name.includes("auth-token")
  )?.value;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    },
  });
}

let _supabaseServer: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (!_supabaseServer) {
    const { url, key } = getEnvOrThrow();
    _supabaseServer = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _supabaseServer;
}

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
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

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // El método setAll se llamó desde un Server Component.
          // Se puede ignorar si el middleware refresca la sesión.
        }
      },
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

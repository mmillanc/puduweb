import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Faltan variables de entorno de Supabase");
}

// createBrowserClient guarda la sesión en cookies (document.cookie),
// lo que permite que el middleware y los componentes de servidor
// lean la sesión del usuario.
export const supabase = createBrowserClient(url, key);

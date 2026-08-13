import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?message=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      const supabase = createClient(url, key, {
        auth: { persistSession: false },
      });

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Auth callback error:", exchangeError.message);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?message=${encodeURIComponent("Error al confirmar email. Intenta de nuevo.")}`
        );
      }
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?message=Email confirmado. Ya puedes iniciar sesión.`);
}

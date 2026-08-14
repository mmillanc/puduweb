import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const type = requestUrl.searchParams.get("type");

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?message=${encodeURIComponent(errorDescription || error)}`
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
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
            // Si no se pueden setear cookies aquí, el middleware las refresca
          }
        },
      },
    });

    if (code) {
      // Flujo PKCE: intercambiar el code por una sesión (confirma el email)
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Auth callback error:", exchangeError.message);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?message=${encodeURIComponent("Error al confirmar email. Intenta de nuevo.")}`
        );
      }

      console.log("Auth callback success - user:", data?.user?.id, "confirmed:", data?.user?.email_confirmed_at);
    } else if (tokenHash && type) {
      // Flujo sin PKCE: verificar el token_hash (confirma email o recovery)
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        type: type as
          | "signup"
          | "recovery"
          | "email"
          | "invite"
          | "magiclink"
          | "email_change"
          | "phone_change",
        token_hash: tokenHash,
      });

      if (verifyError) {
        console.error("Auth verifyOtp error:", verifyError.message);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?message=${encodeURIComponent("Error al confirmar email. Intenta de nuevo.")}`
        );
      }

      console.log("Auth verifyOtp success - user:", data?.user?.id, "confirmed:", data?.user?.email_confirmed_at);
    }
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${requestUrl.origin}/recuperar/reset`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?message=Email confirmado. Ya puedes iniciar sesión.`);
}

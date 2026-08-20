import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profileId,
      profileName,
      senderName,
      senderEmail,
      senderPhone,
      message,
    } = body as {
      profileId?: string;
      profileName?: string;
      senderName?: string;
      senderEmail?: string;
      senderPhone?: string | null;
      message?: string;
    };

    if (!profileId || !senderName || !senderEmail || !message) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const supabaseServer = getSupabaseServerClient();

    const { data: profile, error: profileError } = await supabaseServer
      .from("profiles")
      .select("email, name")
      .eq("id", profileId)
      .single();

    if (profileError || !profile?.email) {
      console.error(
        "contact-message-notify: perfil sin email o error al obtener perfil",
        profileError,
      );
      return NextResponse.json({ ok: false });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.NOTIFICATIONS_EMAIL_FROM;

    if (!apiKey || !from) {
      console.error(
        "contact-message-notify: faltan RESEND_API_KEY o NOTIFICATIONS_EMAIL_FROM",
      );
      return NextResponse.json({ ok: false });
    }

    const to = profile.email as string;
    const subject = "Nuevo mensaje desde tu perfil en PuduWeb";

    const plainText = `Hola ${profile.name || profileName || ""},\n\nHas recibido un nuevo mensaje desde tu perfil en PuduWeb.\n\nDe: ${senderName} <${senderEmail}>${senderPhone ? ` Tel: ${senderPhone}` : ""}\n\nMensaje:\n${message}\n\n— PuduWeb`;

    const html = `
      <p>Hola ${profile.name || profileName || ""},</p>
      <p>Has recibido un nuevo mensaje desde tu perfil en <strong>PuduWeb</strong>.</p>
      <p><strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;${
      senderPhone ? ` · Tel: ${senderPhone}` : ""
    }</p>
      <p><strong>Mensaje:</strong></p>
      <p>${(message as string).replace(/\n/g, "<br/>")}</p>
      <p style="margin-top:16px;font-size:12px;color:#64748b;">Este correo fue enviado autom&aacute;ticamente por PuduWeb.</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: plainText,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        "contact-message-notify: error al enviar email con Resend",
        res.status,
        errorText,
      );
      return NextResponse.json({ ok: false });
    }

    console.log("contact-message-notify: email enviado a", to);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("contact-message-notify: error inesperado", error);
    return NextResponse.json({ ok: false });
  }
}

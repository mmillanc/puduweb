"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        profile_id: "00000000-0000-0000-0000-000000000000",
        sender_name: name,
        sender_email: email,
        message: `[${subject}] ${message}`,
      });

    if (insertError) {
      setError("No se pudo enviar el mensaje. Intenta nuevamente.");
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 text-green-500" size={48} />
        <h1 className="text-xl font-semibold">¡Mensaje enviado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gracias por contactarnos. Te responderemos pronto.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-primary hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Contáctanos</h1>
      <p className="mt-2 text-muted-foreground">
        ¿Tienes preguntas, sugerencias o quieres colaborar? Escríbenos.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="sm:col-span-2">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nombre</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Asunto</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Mensaje</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Enviar mensaje
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <Mail className="mb-2 text-primary" size={20} />
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-muted-foreground">contacto@puduweb.cl</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <MessageSquare className="mb-2 text-primary" size={20} />
            <p className="text-sm font-medium">Soporte</p>
            <p className="text-xs text-muted-foreground">
              Respondemos en menos de 24 horas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

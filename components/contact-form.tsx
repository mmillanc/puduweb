"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { isValidEmail } from "@/lib/validations";
import { Loader2, Send, Mail, CheckCircle2 } from "lucide-react";

interface ContactFormProps {
  profileId: string;
  profileName: string;
}

export function ContactForm({ profileId, profileName }: ContactFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Ingresa un email válido");
      return;
    }
    if (message.trim().length < 10) {
      setError("El mensaje debe tener al menos 10 caracteres");
      return;
    }

    setSending(true);

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        profile_id: profileId,
        sender_name: name,
        sender_email: email,
        sender_phone: phone || null,
        message,
      });

    if (insertError) {
      setError(insertError.message);
      setSending(false);
    } else {
      setSent(true);
      setSending(false);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="mb-3 text-green-500" size={32} />
          <p className="font-medium">¡Mensaje enviado!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profileName} recibirá tu mensaje pronto.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setShowForm(false);
            }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
      >
        <Mail size={16} />
        Enviar mensaje
      </button>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 font-semibold">Contactar a {profileName}</h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tu nombre *"
          />
        </div>
        <div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tu email *"
          />
        </div>
        <div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tu teléfono (opcional)"
          />
        </div>
        <div>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Escribe tu mensaje... *"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={sending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Enviar
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import type { ContactMessage } from "@/lib/types";
import {
  Eye,
  Mail,
  MailOpen,
  Trash2,
  TrendingUp,
  MessageSquare,
  Clock,
  X,
} from "lucide-react";

interface BusinessStatsProps {
  profileIds: string[];
}

interface Stats {
  totalViews: number;
  totalMessages: number;
  unreadMessages: number;
}

export function BusinessStats({ profileIds }: BusinessStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (profileIds.length === 0) {
        setLoading(false);
        return;
      }

      const [{ count: views }, { count: msgs }, { count: unread }, { data: msgData }] =
        await Promise.all([
          supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .in("profile_id", profileIds),
          supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
            .in("profile_id", profileIds),
          supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
            .in("profile_id", profileIds)
            .eq("is_read", false),
          supabase
            .from("contact_messages")
            .select("*")
            .in("profile_id", profileIds)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

      setStats({
        totalViews: views ?? 0,
        totalMessages: msgs ?? 0,
        unreadMessages: unread ?? 0,
      });
      setMessages((msgData as ContactMessage[]) ?? []);
      setLoading(false);
    }
    fetchStats();
  }, [profileIds]);

  async function markAsRead(id: string) {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
    );
    setStats((prev) => ({
      ...prev,
      unreadMessages: Math.max(0, prev.unreadMessages - 1),
    }));
  }

  async function deleteMessage(id: string) {
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setStats((prev) => ({
      ...prev,
      totalMessages: Math.max(0, prev.totalMessages - 1),
    }));
  }

  if (loading) return null;

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
              <p className="text-xs text-muted-foreground">Vistas totales</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalMessages}</p>
              <p className="text-xs text-muted-foreground">Mensajes recibidos</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowMessages(true)}
          className="rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stats.unreadMessages > 0 ? "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400" : "bg-muted text-muted-foreground"}`}>
              <Mail size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.unreadMessages}</p>
              <p className="text-xs text-muted-foreground">Sin leer</p>
            </div>
          </div>
        </button>
      </div>

      {/* Messages modal */}
      {showMessages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Mail size={18} />
                Mensajes recibidos
              </h2>
              <button
                onClick={() => setShowMessages(false)}
                className="rounded p-1 hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay mensajes todavía.
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg border p-4 ${
                        !msg.is_read ? "border-primary/30 bg-primary/5" : ""
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{msg.sender_name}</span>
                            {!msg.is_read && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                                Nuevo
                              </span>
                            )}
                          </div>
                          <a
                            href={`mailto:${msg.sender_email}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {msg.sender_email}
                          </a>
                          {msg.sender_phone && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              · {msg.sender_phone}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!msg.is_read && (
                            <button
                              onClick={() => markAsRead(msg.id)}
                              className="rounded p-1 hover:bg-muted"
                              title="Marcar como leído"
                            >
                              <MailOpen size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={10} />
                        {new Date(msg.created_at).toLocaleString("es-CL", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

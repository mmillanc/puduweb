"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import type { Profile, Category } from "@/lib/types";
import { ProfileForm } from "@/components/profile-form";
import { useToast, ToastContainer } from "@/components/toast";
import { BusinessStats } from "@/components/business-stats";
import { CompletionIndicator } from "@/components/completion-indicator";
import {
  Pencil,
  LogOut,
  Search,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Store,
  Inbox,
  AlertCircle,
  Trash2,
  Mail,
  X,
} from "lucide-react";

export default function NegocioDashboard() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [ownedProfileIds, setOwnedProfileIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender_name: string;
    sender_email: string;
    sender_phone: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
    profile_id: string;
  }>>([]);
  const [showMessages, setShowMessages] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [requestingDelete, setRequestingDelete] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: ownerData } = await supabase
      .from("profile_owners")
      .select("profile_id")
      .eq("user_id", userData.user.id);

    const profileIds = (ownerData ?? []).map((o) => o.profile_id);
    setOwnedProfileIds(profileIds);

    if (profileIds.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("profiles")
      .select("*, category:categories(*)")
      .in("id", profileIds)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { data } = await query;
    setProfiles((data as Profile[]) ?? []);
    setLoading(false);

    if (profileIds.length > 0) {
      fetchMessages();
    }
  }, [search]);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  async function fetchMessages() {
    if (ownedProfileIds.length === 0) return;
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .in("profile_id", ownedProfileIds)
      .order("created_at", { ascending: false });
    setMessages((data as typeof messages) ?? []);
  }

  async function togglePublished(profile: Profile) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_published: !profile.is_published })
      .eq("id", profile.id);
    if (error) {
      showToast(`Error: ${error.message}`, "error");
    } else {
      showToast(profile.is_published ? "Perfil despublicado" : "Perfil publicado");
    }
    fetchProfiles();
  }

  async function markMessageRead(msgId: string) {
    await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", msgId);
    fetchMessages();
  }

  async function requestDeletion() {
    if (!deleteTarget) return;
    setRequestingDelete(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      showToast("Error: no hay sesión", "error");
      setRequestingDelete(false);
      return;
    }
    const { error } = await supabase
      .from("deletion_requests")
      .insert({
        profile_id: deleteTarget.id,
        user_id: userData.user.id,
        reason: deleteReason || null,
      });
    setRequestingDelete(false);
    if (error) {
      if (error.code === "23505") {
        showToast("Ya tienes una solicitud de eliminación pendiente para este perfil", "error");
      } else {
        showToast(`Error: ${error.message}`, "error");
      }
    } else {
      showToast("Solicitud de eliminación enviada. Un administrador la revisará.");
      setDeleteTarget(null);
      setDeleteReason("");
    }
  }

  function handleLogout() {
    supabase.auth.signOut().then(() => {
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mi Negocio</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus perfiles profesionales
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      {showForm ? (
        <ProfileForm
          categories={categories}
          profile={editingProfile}
          onClose={() => {
            setShowForm(false);
            setEditingProfile(null);
            fetchProfiles();
          }}
        />
      ) : (
        <>
          <BusinessStats profileIds={ownedProfileIds} />

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar tu perfil..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-xl border p-12 text-center">
              <Inbox className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">
                Aún no tienes un perfil creado.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Crea tu perfil para que los clientes puedan encontrarte.
              </p>
              <button
                onClick={() => {
                  setEditingProfile(null);
                  setShowForm(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
              >
                <Store size={16} />
                Crear perfil
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {profiles.filter((p) => !p.is_published).length > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-400">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Perfil sin publicar</p>
                      <p className="mt-1 text-xs">
                        Publica tu perfil para que los usuarios puedan encontrarte.
                      </p>
                    </div>
                  </div>
                )}
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setShowMessages(true);
                      fetchMessages();
                    }}
                    className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400"
                  >
                    <Mail size={18} />
                    <span className="font-medium">Mensajes ({messages.filter(m => !m.is_read).length} sin leer)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.avatar_url && (
                        <img
                          src={p.avatar_url}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.category?.name ?? "Sin categoría"}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-3">
                    <CompletionIndicator profile={p} />
                  </div>

                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <button
                      onClick={() => togglePublished(p)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80 ${
                        p.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                      }`}
                    >
                      {p.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {p.is_published ? "Publicado" : "No publicado"}
                    </button>

                    <div className="flex gap-1">
                      <a
                        href={`/perfil/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 hover:bg-muted"
                        title="Ver perfil"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => {
                          setEditingProfile(p);
                          setShowForm(true);
                        }}
                        className="rounded p-1.5 hover:bg-muted"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                        title="Solicitar eliminación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de mensajes */}
      {showMessages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Mail size={20} /> Mensajes de contacto
              </h2>
              <button
                onClick={() => setShowMessages(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No tienes mensajes aún.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg border p-3 ${
                      m.is_read ? "bg-muted/30" : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm">{m.sender_name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{m.sender_email}</span>
                        {m.sender_phone && (
                          <span className="ml-2 text-xs text-muted-foreground">{m.sender_phone}</span>
                        )}
                      </div>
                      {!m.is_read && (
                        <button
                          onClick={() => markMessageRead(m.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Marcar leído
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{m.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString("es-CL")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de solicitud de eliminación */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Trash2 size={20} className="text-red-500" />
              Solicitar eliminación
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vas a solicitar la eliminación de <strong>{deleteTarget.name}</strong>.
              Un administrador revisará tu solicitud. No podrás eliminar el perfil directamente.
            </p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="mt-4 min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Motivo de la eliminación (opcional)"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteReason("");
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={requestDeletion}
                disabled={requestingDelete}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {requestingDelete ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

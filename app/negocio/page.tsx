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
  }, [search]);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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
                Si te registraste como negocio, tu perfil debería aparecer aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.filter((p) => !p.is_published).length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-400">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Perfil pendiente de aprobación</p>
                    <p className="mt-1 text-xs">
                      Tu perfil está en revisión. Un administrador lo publicará pronto.
                      Mientras tanto, puedes seguir editándolo.
                    </p>
                  </div>
                </div>
              )}

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
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {p.is_published ? "Publicado" : "Borrador"}
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
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

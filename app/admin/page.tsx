"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import type { Profile, Category } from "@/lib/types";
import { ProfileForm } from "@/components/profile-form";
import { useToast, ToastContainer } from "@/components/toast";
import { AssignModal } from "@/components/assign-modal";
import { CategoryModal } from "@/components/category-modal";
import { UsersModal } from "@/components/users-modal";
import { AdminStats } from "@/components/admin-stats";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Search,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  UserPlus,
  FolderTree,
  Users,
  AlertCircle,
  Download,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningProfile, setAssigningProfile] = useState<Profile | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*, category:categories(*)")
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

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este perfil permanentemente?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      showToast(`Error al eliminar: ${error.message}`, "error");
    } else {
      showToast("Perfil eliminado correctamente");
    }
    fetchProfiles();
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

  async function toggleFeatured(profile: Profile) {
    const { error } = await supabase
      .from("profiles")
      .update({ featured: !profile.featured })
      .eq("id", profile.id);
    if (error) {
      showToast(`Error: ${error.message}`, "error");
    } else {
      showToast(profile.featured ? "Quitado de destacados" : "Marcado como destacado");
    }
    fetchProfiles();
  }

  function handleLogout() {
    supabase.auth.signOut().then(() => {
      router.push("/");
      router.refresh();
    });
  }

  function exportCSV() {
    const headers = ["Nombre", "Slug", "Tipo", "Categoria", "Ciudad", "Telefono", "Email", "Website", "Publicado", "Destacado", "Creado"];
    const rows = profiles.map((p) => [
      p.name,
      p.slug,
      p.type,
      p.category?.name ?? "",
      p.city ?? "",
      p.phone ?? "",
      p.email ?? "",
      p.website ?? "",
      p.is_published ? "Si" : "No",
      p.featured ? "Si" : "No",
      new Date(p.created_at).toLocaleDateString("es-CL"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `puduweb-perfiles-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exportado correctamente");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <FolderTree size={16} />
            Categorías
          </button>
          <button
            onClick={() => setShowUsers(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Users size={16} />
            Usuarios
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
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
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar perfil..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => {
                setEditingProfile(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <Plus size={16} />
              Nuevo perfil
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-xl border p-12 text-center">
              <p className="text-muted-foreground">
                No hay perfiles creados todavía.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white mx-auto hover:bg-primary-dark"
              >
                <Plus size={16} />
                Crear primer perfil
              </button>
            </div>
          ) : (
        <>
          <AdminStats />

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profiles.filter((p) => !p.is_published).length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2.5 text-sm text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                  <AlertCircle size={16} />
                  <span>
                    <strong>{profiles.filter((p) => !p.is_published).length}</strong> pendiente(s)
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>

            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Nombre</th>
                    <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                      Tipo
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                      Categoría
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                      Ciudad
                    </th>
                    <th className="px-4 py-3 text-center font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className={`border-t hover:bg-muted/30 ${!p.is_published ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          /{p.slug}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 capitalize sm:table-cell">
                        {p.type}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {p.category?.name ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {p.city ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => togglePublished(p)}
                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                              p.is_published
                                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                            title="Publicar/Despublicar"
                          >
                            {p.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                            {p.is_published ? "Publicado" : "Borrador"}
                          </button>
                          {p.featured && (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                              ★
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
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
                            onClick={() => toggleFeatured(p)}
                            className={`rounded p-1.5 hover:bg-muted ${p.featured ? "text-yellow-500" : "text-muted-foreground"}`}
                            title="Destacar"
                          >
                            ★
                          </button>
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
                            onClick={() => setAssigningProfile(p)}
                            className="rounded p-1.5 hover:bg-muted"
                            title="Asignar a negocio"
                          >
                            <UserPlus size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Eliminar"
                          >
                            {deletingId === p.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {assigningProfile && (
        <AssignModal
          profile={assigningProfile}
          onClose={() => setAssigningProfile(null)}
          onAssigned={() => showToast("Asignación actualizada")}
        />
      )}

      {showCategories && (
        <CategoryModal
          onClose={() => setShowCategories(false)}
          onSaved={() => {
            fetchProfiles();
            showToast("Categorías actualizadas");
          }}
        />
      )}

      {showUsers && <UsersModal onClose={() => setShowUsers(false)} />}
    </div>
  );
}

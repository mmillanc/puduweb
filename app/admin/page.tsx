"use client";

import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import type { Profile, Category, BlogPost } from "@/lib/types";
import { slugify, estimateReadingTimeMinutes } from "@/lib/utils";
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
  Mail,
  MessageSquare,
  X,
  Check,
  Clock,
  FileText,
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
  const [showDeletionRequests, setShowDeletionRequests] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [allMessages, setAllMessages] = useState<Array<{
    id: string;
    profile_id: string;
    sender_name: string;
    sender_email: string;
    sender_phone: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
    profile_name?: string;
  }>>([]);
  const [showBlog, setShowBlog] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_url: "",
    seo_title: "",
    seo_description: "",
    author_name: "",
    is_published: false,
    published_at: "",
  });
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "pending" | "incomplete">("all");
  const [deletionRequests, setDeletionRequests] = useState<Array<{
    id: string;
    profile_id: string;
    user_id: string;
    reason: string | null;
    status: string;
    created_at: string;
    profile_name?: string;
  }>>([]);

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

  async function fetchDeletionRequests() {
    const { data } = await supabase
      .from("deletion_requests")
      .select("*")
    .order("created_at", { ascending: false });
    if (data) {
      const profileIds = data.map((r: { profile_id: string }) => r.profile_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", profileIds);
      const nameMap = new Map((profilesData ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));
      setDeletionRequests(data.map((r: typeof deletionRequests[0]) => ({
        ...r,
        profile_name: nameMap.get(r.profile_id) ?? "Desconocido",
      })));
    }
  }

  async function fetchAllMessages() {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      const profileIds = [...new Set(data.map((m: { profile_id: string }) => m.profile_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", profileIds);
      const nameMap = new Map((profilesData ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));
      setAllMessages(data.map((m: typeof allMessages[0]) => ({
        ...m,
        profile_name: nameMap.get(m.profile_id) ?? "Desconocido",
      })));
    }
  }

  async function fetchBlogPosts() {
    setBlogLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);
    setBlogPosts((data as BlogPost[] | null) ?? []);
    setBlogLoading(false);
  }

  function startNewPost() {
    setEditingPost(null);
    setBlogForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_url: "",
      seo_title: "",
      seo_description: "",
      author_name: "",
      is_published: false,
      published_at: new Date().toISOString().slice(0, 16),
    });
  }

  function loadPost(post: BlogPost) {
    setEditingPost(post);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      cover_url: post.cover_url ?? "",
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
      author_name: post.author_name ?? "",
      is_published: post.is_published,
      published_at: post.published_at
        ? new Date(post.published_at).toISOString().slice(0, 16)
        : "",
    });
  }

  async function handleSavePost(e: FormEvent) {
    e.preventDefault();
    if (!blogForm.title.trim()) {
      showToast("El título es obligatorio", "error");
      return;
    }
    if (!blogForm.slug.trim()) {
      showToast("El slug es obligatorio", "error");
      return;
    }

    setBlogSaving(true);

    const payload: Partial<BlogPost> = {
      title: blogForm.title.trim(),
      slug: blogForm.slug.trim(),
      excerpt: blogForm.excerpt.trim() || null,
      content: blogForm.content,
      cover_url: blogForm.cover_url.trim() || null,
      seo_title: blogForm.seo_title.trim() || null,
      seo_description: blogForm.seo_description.trim() || null,
      author_name: blogForm.author_name.trim() || null,
      is_published: blogForm.is_published,
      published_at: blogForm.is_published
        ? (blogForm.published_at
            ? new Date(blogForm.published_at).toISOString()
            : new Date().toISOString())
        : null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingPost) {
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", editingPost.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("blog_posts")
        .insert(payload);
      error = insertError;
    }

    setBlogSaving(false);

    if (error) {
      showToast(`Error al guardar artículo: ${error.message}`, "error");
    } else {
      showToast(editingPost ? "Artículo actualizado" : "Artículo creado", "success");
      fetchBlogPosts();
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm("¿Eliminar este artículo del blog?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      showToast(`Error al eliminar artículo: ${error.message}`, "error");
    } else {
      showToast("Artículo eliminado", "success");
      fetchBlogPosts();
      if (editingPost?.id === id) {
        setEditingPost(null);
      }
    }
  }

  async function resolveDeletionRequest(requestId: string, profileId: string, approve: boolean) {
    if (approve) {
      if (!confirm("¿Aprobar eliminación? El perfil se eliminará permanentemente.")) return;
      await supabase
        .from("deletion_requests")
        .update({ status: "approved", resolved_at: new Date().toISOString() })
        .eq("id", requestId);
      await supabase.from("profiles").delete().eq("id", profileId);
      showToast("Perfil eliminado y solicitud aprobada");
    } else {
      await supabase
        .from("deletion_requests")
        .update({ status: "rejected", resolved_at: new Date().toISOString() })
        .eq("id", requestId);
      showToast("Solicitud rechazada");
    }
    fetchDeletionRequests();
    fetchProfiles();
  }

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

  const filteredProfiles = profiles.filter((p) => {
    if (statusFilter === "published") return p.is_published;
    if (statusFilter === "pending") return !p.is_published;
    if (statusFilter === "incomplete") {
      return !p.description || !p.avatar_url || !p.city || !p.category_id;
    }
    return true;
  });

  const incompleteCount = profiles.filter((p) => !p.description || !p.avatar_url || !p.city || !p.category_id).length;

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
            onClick={() => {
              fetchBlogPosts();
              startNewPost();
              setShowBlog(true);
            }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <FileText size={16} />
            Blog
          </button>
          <button
            onClick={() => {
              fetchAllMessages();
              setShowMessages(true);
            }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <MessageSquare size={16} />
            Mensajes
          </button>
          <button
            onClick={() => {
              fetchDeletionRequests();
              setShowDeletionRequests(true);
            }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Mail size={16} />
            Eliminación
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
          isAdmin
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

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${statusFilter === "all" ? "bg-primary text-white" : "border hover:bg-muted"}`}
            >
              Todos ({profiles.length})
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${statusFilter === "published" ? "bg-primary text-white" : "border hover:bg-muted"}`}
            >
              Publicados ({profiles.filter((p) => p.is_published).length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${statusFilter === "pending" ? "bg-primary text-white" : "border hover:bg-muted"}`}
            >
              Pendientes ({profiles.filter((p) => !p.is_published).length})
            </button>
            <button
              onClick={() => setStatusFilter("incomplete")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${statusFilter === "incomplete" ? "bg-primary text-white" : "border hover:bg-muted"}`}
            >
              Incompletos ({incompleteCount})
            </button>
          </div>

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
              {incompleteCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2.5 text-sm text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400">
                  <AlertCircle size={16} />
                  <span>
                    <strong>{incompleteCount}</strong> incompleto(s)
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
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className={`border-t hover:bg-muted/30 ${!p.is_published ? "bg-orange-50/50 dark:bg-orange-950/20" : ""} ${statusFilter === "incomplete" && (!p.description || !p.avatar_url || !p.city || !p.category_id) ? "bg-yellow-50/50 dark:bg-yellow-950/20" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          /{p.slug}
                        </div>
                        {statusFilter === "incomplete" && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {!p.description && <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">Sin descripción</span>}
                            {!p.avatar_url && <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">Sin foto</span>}
                            {!p.city && <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">Sin ciudad</span>}
                            {!p.category_id && <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">Sin categoría</span>}
                          </div>
                        )}
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
                            href={`/${p.slug}`}
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

      {showDeletionRequests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Mail size={20} /> Solicitudes de eliminación
              </h2>
              <button
                onClick={() => setShowDeletionRequests(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {deletionRequests.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No hay solicitudes de eliminación.
                </p>
              ) : (
                deletionRequests.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-lg border p-3 ${
                      r.status === "pending"
                        ? "border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm">{r.profile_name}</span>
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === "pending"
                            ? "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                            : r.status === "approved"
                            ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {r.status === "pending" ? "Pendiente" : r.status === "approved" ? "Aprobada" : "Rechazada"}
                        </span>
                      </div>
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => resolveDeletionRequest(r.id, r.profile_id, true)}
                            className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                          >
                            <Check size={14} /> Aprobar
                          </button>
                          <button
                            onClick={() => resolveDeletionRequest(r.id, r.profile_id, false)}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                    {r.reason && (
                      <p className="mt-2 text-sm text-muted-foreground">Motivo: {r.reason}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("es-CL")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showMessages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MessageSquare size={20} /> Mensajes de clientes
              </h2>
              <button
                onClick={() => setShowMessages(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {allMessages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No hay mensajes recibidos.
                </p>
              ) : (
                allMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${!msg.is_read ? "border-primary/30 bg-primary/5" : ""}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
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
                        <div className="mt-1 text-xs text-muted-foreground">
                          Para: <span className="font-medium text-foreground">{msg.profile_name}</span>
                        </div>
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
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FileText size={20} /> Blog
              </h2>
              <button
                onClick={() => setShowBlog(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid max-h-[80vh] grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="space-y-3 border-b pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Artículos recientes</h3>
                  <button
                    type="button"
                    onClick={startNewPost}
                    className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium hover:bg-muted"
                  >
                    <Plus size={12} />
                    Nuevo
                  </button>
                </div>
                {blogLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-muted-foreground" size={20} />
                  </div>
                ) : blogPosts.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground">
                    Aún no hay artículos. Crea el primero con el botón "Nuevo".
                  </p>
                ) : (
                  <div className="space-y-2">
                    {blogPosts.map((post) => {
                      const dateLabel = post.published_at
                        ? new Date(post.published_at).toLocaleDateString("es-CL", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : null;
                      return (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => loadPost(post)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted ${
                            editingPost?.id === post.id ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-medium line-clamp-1">{post.title}</p>
                              {dateLabel && (
                                <p className="text-xs text-muted-foreground">{dateLabel}</p>
                              )}
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                post.is_published
                                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {post.is_published ? "Publicado" : "Borrador"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {post.excerpt || "Sin resumen"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  {editingPost ? "Editar artículo" : "Nuevo artículo"}
                </h3>
                <form onSubmit={handleSavePost} className="space-y-3 text-sm">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Título</label>
                    <input
                      value={blogForm.title}
                      onChange={(e) =>
                        setBlogForm((f) => {
                          const newTitle = e.target.value;
                          const autoSlugFromOldTitle = slugify(f.title || "");
                          const shouldUpdateSlug = !f.slug || f.slug === autoSlugFromOldTitle;
                          return {
                            ...f,
                            title: newTitle,
                            slug: shouldUpdateSlug ? slugify(newTitle) : f.slug,
                          };
                        })
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Título del artículo"
                      required
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Slug</label>
                      <div className="flex gap-2">
                        <input
                          value={blogForm.slug}
                          onChange={(e) => setBlogForm((f) => ({ ...f, slug: e.target.value }))}
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                          placeholder="ej: como-mejorar-tu-presencia-online"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setBlogForm((f) => ({
                              ...f,
                              slug: slugify(f.title || ""),
                            }))
                          }
                          className="shrink-0 rounded-lg border px-2 py-1 text-xs font-medium hover:bg-muted"
                        >
                          Usar título
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        URL: /blog/{blogForm.slug || "tu-slug"}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Autor</label>
                      <input
                        value={blogForm.author_name}
                        onChange={(e) => setBlogForm((f) => ({ ...f, author_name: e.target.value }))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nombre visible del autor"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Publicado el</label>
                      <input
                        type="datetime-local"
                        value={blogForm.published_at}
                        onChange={(e) => setBlogForm((f) => ({ ...f, published_at: e.target.value }))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        id="blog-published"
                        type="checkbox"
                        checked={blogForm.is_published}
                        onChange={(e) => setBlogForm((f) => ({ ...f, is_published: e.target.checked }))}
                        className="h-4 w-4 rounded border"
                      />
                      <label htmlFor="blog-published" className="text-xs font-medium">
                        Publicado
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Resumen corto</label>
                    <textarea
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm((f) => ({ ...f, excerpt: e.target.value }))}
                      className="w-full min-h-[60px] rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Texto introductorio que se verá en el listado y en Google"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Contenido</label>
                    <textarea
                      value={blogForm.content}
                      onChange={(e) => setBlogForm((f) => ({ ...f, content: e.target.value }))}
                      className="w-full min-h-[140px] rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Contenido del artículo (acepta saltos de línea)"
                    />
                    {blogForm.content && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Aproximadamente {estimateReadingTimeMinutes(blogForm.content)} min de lectura
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">URL de portada (opcional)</label>
                    <input
                      value={blogForm.cover_url}
                      onChange={(e) => setBlogForm((f) => ({ ...f, cover_url: e.target.value }))}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">SEO title (opcional)</label>
                      <input
                        value={blogForm.seo_title}
                        onChange={(e) => setBlogForm((f) => ({ ...f, seo_title: e.target.value }))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Título para Google"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">SEO description (opcional)</label>
                      <input
                        value={blogForm.seo_description}
                        onChange={(e) => setBlogForm((f) => ({ ...f, seo_description: e.target.value }))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Descripción para Google"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={blogSaving}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                      >
                        {blogSaving && <Loader2 size={14} className="animate-spin" />}
                        Guardar
                      </button>
                      {editingPost && (
                        <button
                          type="button"
                          onClick={() => handleDeletePost(editingPost.id)}
                          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      )}
                    </div>
                    {editingPost && (
                      <a
                        href={`/blog/${editingPost.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        <ExternalLink size={14} /> Ver artículo
                      </a>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

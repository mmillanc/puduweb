"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Profile, Category, ProfileType } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { X, Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

interface ProfileFormProps {
  categories: Category[];
  profile: Profile | null;
  onClose: () => void;
}

const emptyForm = {
  name: "",
  slug: "",
  type: "profesional" as ProfileType,
  category_id: "" as string,
  tagline: "",
  description: "",
  city: "",
  region: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
  linkedin: "",
  twitter: "",
  tiktok: "",
  avatar_url: "",
  cover_url: "",
  services: "",
  hours: "",
  gallery_urls: "",
  is_published: true,
  featured: false,
};

export function ProfileForm({ categories, profile, onClose }: ProfileFormProps) {
  const [form, setForm] = useState(
    profile
      ? {
          name: profile.name,
          slug: profile.slug,
          type: profile.type,
          category_id: profile.category_id ?? "",
          tagline: profile.tagline ?? "",
          description: profile.description ?? "",
          city: profile.city ?? "",
          region: profile.region ?? "",
          phone: profile.phone ?? "",
          email: profile.email ?? "",
          website: profile.website ?? "",
          address: profile.address ?? "",
          instagram: profile.instagram ?? "",
          facebook: profile.facebook ?? "",
          whatsapp: profile.whatsapp ?? "",
          linkedin: profile.linkedin ?? "",
          twitter: profile.twitter ?? "",
          tiktok: profile.tiktok ?? "",
          avatar_url: profile.avatar_url ?? "",
          cover_url: profile.cover_url ?? "",
          services: profile.services ?? "",
          hours: profile.hours ?? "",
          gallery_urls: profile.gallery_urls?.join("\n") ?? "",
          is_published: profile.is_published,
          featured: profile.featured,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const slug = form.slug || slugify(form.name);
    const galleryArray = form.gallery_urls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      slug,
      type: form.type,
      category_id: form.category_id || null,
      tagline: form.tagline || null,
      description: form.description || null,
      city: form.city || null,
      region: form.region || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      address: form.address || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      whatsapp: form.whatsapp || null,
      linkedin: form.linkedin || null,
      twitter: form.twitter || null,
      tiktok: form.tiktok || null,
      avatar_url: form.avatar_url || null,
      cover_url: form.cover_url || null,
      services: form.services || null,
      hours: form.hours || null,
      gallery_urls: galleryArray.length > 0 ? galleryArray : null,
      is_published: form.is_published,
      featured: form.featured,
    };

    let result;
    if (profile) {
      result = await supabase
        .from("profiles")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
    } else {
      result = await supabase.from("profiles").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
    } else {
      onClose();
    }
  }

  const inputClass =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "mb-1 block text-sm font-medium";

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {profile ? "Editar perfil" : "Nuevo perfil"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-muted"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            Datos básicos
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  update("name", e.target.value);
                  if (!profile) update("slug", slugify(e.target.value));
                }}
                className={inputClass}
                placeholder="Ej: Kinesiología San Juan"
              />
            </div>
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                className={inputClass}
                placeholder="kinesiologia-san-juan"
              />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value as ProfileType)}
                className={inputClass}
              >
                <option value="profesional">Profesional</option>
                <option value="pyme">Pyme</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                className={inputClass}
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Eslogan / Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className={inputClass}
                placeholder="Breve descripción para la tarjeta"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={`${inputClass} min-h-[100px]`}
                placeholder="Descripción detallada del profesional o negocio"
              />
            </div>
          </div>
        </fieldset>

        {/* Ubicación */}
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            Ubicación
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Ciudad</label>
              <input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Región</label>
              <input
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Contacto */}
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            Contacto
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sitio web</label>
              <input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className={inputClass}
                placeholder="www.misitio.cl"
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                className={inputClass}
                placeholder="+56912345678"
              />
            </div>
            <div>
              <label className={labelClass}>Horario</label>
              <input
                value={form.hours}
                onChange={(e) => update("hours", e.target.value)}
                className={inputClass}
                placeholder="Lun-Vie 9:00-18:00"
              />
            </div>
          </div>
        </fieldset>

        {/* Redes sociales */}
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            Redes sociales
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Instagram</label>
              <input
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                className={inputClass}
                placeholder="@usuario o URL"
              />
            </div>
            <div>
              <label className={labelClass}>Facebook</label>
              <input
                value={form.facebook}
                onChange={(e) => update("facebook", e.target.value)}
                className={inputClass}
                placeholder="URL o @pagina"
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                value={form.linkedin}
                onChange={(e) => update("linkedin", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Twitter / X</label>
              <input
                value={form.twitter}
                onChange={(e) => update("twitter", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>TikTok</label>
              <input
                value={form.tiktok}
                onChange={(e) => update("tiktok", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Imágenes y servicios */}
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            Imágenes y servicios
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageUpload
              label="Avatar"
              value={form.avatar_url}
              onChange={(url) => update("avatar_url", url)}
              folder="avatars"
              aspectRatio="square"
            />
            <ImageUpload
              label="Portada"
              value={form.cover_url}
              onChange={(url) => update("cover_url", url)}
              folder="covers"
              aspectRatio="wide"
            />
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Servicios (separados por comas)
              </label>
              <input
                value={form.services}
                onChange={(e) => update("services", e.target.value)}
                className={inputClass}
                placeholder="Masaje, Rehabilitación, Deportivo"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Galería (una URL por línea)
              </label>
              <textarea
                value={form.gallery_urls}
                onChange={(e) => update("gallery_urls", e.target.value)}
                className={`${inputClass} min-h-[80px]`}
                placeholder={"https://...imagen1.jpg\nhttps://...imagen2.jpg"}
              />
            </div>
          </div>
        </fieldset>

        {/* Estado */}
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            Estado
          </legend>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Publicado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Destacado
            </label>
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex gap-3 border-t pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {profile ? "Guardar cambios" : "Crear perfil"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

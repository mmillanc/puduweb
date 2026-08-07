"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";
import {
  X,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Tag,
  FolderTree,
} from "lucide-react";

interface CategoryModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const iconOptions = [
  { value: "heart", label: "Salud" },
  { value: "hammer", label: "Construcción" },
  { value: "laptop", label: "Tecnología" },
  { value: "graduation-cap", label: "Educación" },
  { value: "scissors", label: "Belleza" },
  { value: "utensils", label: "Gastronomía" },
  { value: "car", label: "Vehículos" },
  { value: "scale", label: "Legal" },
  { value: "home", label: "Hogar" },
  { value: "dumbbell", label: "Fitness" },
  { value: "palette", label: "Arte" },
  { value: "tag", label: "General" },
];

export function CategoryModal({ onClose, onSaved }: CategoryModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("tag");
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function startCreate() {
    setEditing(null);
    setName("");
    setIcon("tag");
    setShowForm(true);
    setError(null);
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setIcon(cat.icon ?? "tag");
    setShowForm(true);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const slug = slugify(name);
    if (!slug) {
      setError("El nombre debe generar un slug válido");
      setSaving(false);
      return;
    }

    if (editing) {
      const { error: updateError } = await supabase
        .from("categories")
        .update({ name, slug, icon })
        .eq("id", editing.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("categories")
        .insert({ name, slug, icon });
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setName("");
    setIcon("tag");
    fetchCategories();
    onSaved();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría? Los perfiles quedaran sin categoría.")) return;
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      fetchCategories();
      onSaved();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <FolderTree size={18} />
            Gestionar categorías
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleSave}
              className="mb-4 space-y-3 rounded-lg border bg-card p-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Kinesiología"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Icono</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Actualizar" : "Crear"}
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
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <div className="space-y-2">
              {!showForm && (
                <button
                  onClick={startCreate}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
                >
                  <Plus size={16} />
                  Nueva categoría
                </button>
              )}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Tag size={16} />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        /{cat.slug}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded p-1.5 hover:bg-muted"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border py-2 text-sm font-medium hover:bg-muted"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, FolderTree, AlertCircle, Search } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import type { Profile } from "@/lib/types";
import { ProfileCard } from "@/components/profile-card";

export default function ProfileNotFound() {
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*, category:categories(*)")
          .eq("is_published", true)
          .order("featured", { ascending: false })
          .limit(4);
        setSuggestions((data as Profile[]) ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="mb-6 text-muted-foreground" size={64} />
        <h1 className="text-5xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Perfil no encontrado</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Este perfil no existe, fue eliminado o no está publicado.
          Mientras tanto, aquí hay algunos perfiles que podrían interesarte:
        </p>
      </div>

      {!loading && suggestions.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Search size={16} />
            Perfiles destacados
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/50"
        >
          <Home className="text-primary" size={20} />
          <div>
            <p className="text-sm font-medium">Ir al inicio</p>
            <p className="text-xs text-muted-foreground">Explora todos los perfiles</p>
          </div>
        </Link>

        <Link
          href="/categorias"
          className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/50"
        >
          <FolderTree className="text-primary" size={20} />
          <div>
            <p className="text-sm font-medium">Ver categorías</p>
            <p className="text-xs text-muted-foreground">Busca por tipo de servicio</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

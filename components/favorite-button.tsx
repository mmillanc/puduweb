"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  profileId: string;
}

export function FavoriteButton({ profileId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    supabase
      .from("favorites")
      .select("id")
      .eq("profile_id", profileId)
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        setIsFavorite(!!data);
        setLoading(false);
      });
  }, [profileId, userId]);

  async function toggle() {
    if (!userId) return;
    setToggling(true);

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("profile_id", profileId)
        .eq("user_id", userId);
      setIsFavorite(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ profile_id: profileId, user_id: userId });
      setIsFavorite(true);
    }
    setToggling(false);
  }

  if (!userId) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading || toggling}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        isFavorite
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
          : "hover:bg-muted"
      }`}
      title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      {loading || toggling ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart
          size={16}
          fill={isFavorite ? "currentColor" : "none"}
        />
      )}
      {isFavorite ? "Guardado" : "Guardar"}
    </button>
  );
}

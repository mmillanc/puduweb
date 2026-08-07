"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import { ProfileCard } from "@/components/profile-card";
import type { Profile } from "@/lib/types";
import { Loader2, Heart, LogIn } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchFavorites = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    const { data: favData } = await supabase
      .from("favorites")
      .select("profile_id")
      .eq("user_id", userData.user.id);

    const profileIds = (favData ?? []).map((f) => f.profile_id);
    if (profileIds.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*, category:categories(*)")
      .in("id", profileIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    setProfiles((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Heart className="mx-auto mb-4 text-muted-foreground" size={48} />
        <h1 className="mb-2 text-xl font-semibold">Tus favoritos</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Inicia sesión para ver los perfiles que has guardado.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <LogIn size={16} />
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Tus favoritos</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {profiles.length} {profiles.length === 1 ? "perfil guardado" : "perfiles guardados"}
      </p>

      {profiles.length === 0 ? (
        <div className="rounded-xl border p-12 text-center">
          <Heart className="mx-auto mb-4 text-muted-foreground" size={48} />
          <p className="text-muted-foreground">
            Aún no has guardado perfiles como favoritos.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Explorar perfiles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}

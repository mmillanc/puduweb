"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase-client";

interface ViewTrackerProps {
  profileId: string;
}

export function ViewTracker({ profileId }: ViewTrackerProps) {
  useEffect(() => {
    async function trackView() {
      try {
        const { data: userData } = await supabase.auth.getUser();

        // Evitar contar la misma visita múltiples veces en una sesión
        const sessionKey = `puduweb_viewed_${profileId}`;
        if (typeof window !== "undefined" && sessionStorage.getItem(sessionKey)) {
          return;
        }

        const { error } = await supabase.from("profile_views").insert({
          profile_id: profileId,
          viewer_id: userData.user?.id ?? null,
        });

        if (error) {
          console.error("ViewTracker error:", error.message);
          return;
        }

        if (typeof window !== "undefined") {
          sessionStorage.setItem(sessionKey, "1");
        }
      } catch (err) {
        console.error("ViewTracker failed:", err);
      }
    }
    trackView();
  }, [profileId]);

  return null;
}

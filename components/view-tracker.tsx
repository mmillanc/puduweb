"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase-client";

interface ViewTrackerProps {
  profileId: string;
}

export function ViewTracker({ profileId }: ViewTrackerProps) {
  useEffect(() => {
    async function trackView() {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("profile_views").insert({
        profile_id: profileId,
        viewer_id: userData.user?.id ?? null,
      });
    }
    trackView();
  }, [profileId]);

  return null;
}

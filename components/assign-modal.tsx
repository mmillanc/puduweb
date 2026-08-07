"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Profile } from "@/lib/types";
import { X, Loader2, UserPlus, Check, Trash2 } from "lucide-react";

interface AssignModalProps {
  profile: Profile;
  onClose: () => void;
  onAssigned: () => void;
}

interface BusinessUser {
  id: string;
  email: string;
  isOwner: boolean;
}

export function AssignModal({ profile, onClose, onAssigned }: AssignModalProps) {
  const [businesses, setBusinesses] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [{ data: rolesData }, { data: ownersData }] = await Promise.all([
        supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "negocio"),
        supabase
          .from("profile_owners")
          .select("user_id")
          .eq("profile_id", profile.id),
      ]);

      const ownerIds = new Set((ownersData ?? []).map((o) => o.user_id));

      const businessUsers: BusinessUser[] = [];
      for (const role of rolesData ?? []) {
        const { data: authData } = await supabase.auth.admin.getUserById(
          role.user_id
        );
        businessUsers.push({
          id: role.user_id,
          email: authData?.user?.email ?? "Email no disponible",
          isOwner: ownerIds.has(role.user_id),
        });
      }

      setBusinesses(businessUsers);
      setLoading(false);
    }
    fetchData();
  }, [profile.id]);

  async function assign(userId: string) {
    setAssigning(userId);
    const { error } = await supabase
      .from("profile_owners")
      .insert({ profile_id: profile.id, user_id: userId });

    if (error) {
      console.error(error);
    } else {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === userId ? { ...b, isOwner: true } : b))
      );
      onAssigned();
    }
    setAssigning(null);
  }

  async function unassign(userId: string) {
    setAssigning(userId);
    const { error } = await supabase
      .from("profile_owners")
      .delete()
      .eq("profile_id", profile.id)
      .eq("user_id", userId);

    if (error) {
      console.error(error);
    } else {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === userId ? { ...b, isOwner: false } : b))
      );
      onAssigned();
    }
    setAssigning(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <UserPlus size={18} />
            Asignar &quot;{profile.name}&quot;
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : businesses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay cuentas de negocio registradas.
              <br />
              Los negocios deben registrarse primero en /registro.
            </p>
          ) : (
            <div className="space-y-2">
              {businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {biz.email[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm">{biz.email}</span>
                  </div>
                  {biz.isOwner ? (
                    <button
                      onClick={() => unassign(biz.id)}
                      disabled={assigning === biz.id}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      {assigning === biz.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      Quitar
                    </button>
                  ) : (
                    <button
                      onClick={() => assign(biz.id)}
                      disabled={assigning === biz.id}
                      className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-dark"
                    >
                      {assigning === biz.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Asignar
                    </button>
                  )}
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

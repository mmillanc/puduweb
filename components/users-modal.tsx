"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import type { RoleType } from "@/lib/types";
import { X, Users, Loader2, Shield, Store, User } from "lucide-react";

interface UserModalProps {
  onClose: () => void;
}

interface UserRow {
  user_id: string;
  role: RoleType;
  email: string;
}

export function UsersModal({ onClose }: UserModalProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .order("created_at", { ascending: false });

      const userRows: UserRow[] = (rolesData ?? []).map((r: { user_id: string; role: RoleType }) => ({
        user_id: r.user_id,
        role: r.role,
        email: "Cargando...",
      }));

      setUsers(userRows);
      setLoading(false);

      for (const u of userRows) {
        const { data: authData } = await supabase.auth.admin.getUserById(u.user_id);
        if (authData?.user?.email) {
          setUsers((prev) =>
            prev.map((p) =>
              p.user_id === u.user_id
                ? { ...p, email: authData.user!.email ?? "N/A" }
                : p
            )
          );
        }
      }
    }
    fetchUsers();
  }, []);

  async function changeRole(userId: string, newRole: RoleType) {
    setUpdating(userId);
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
    }
    setUpdating(null);
  }

  const roleIcon = (role: RoleType) => {
    if (role === "admin") return <Shield size={14} className="text-purple-500" />;
    if (role === "negocio") return <Store size={14} className="text-blue-500" />;
    return <User size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Users size={18} />
            Usuarios y roles
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
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay usuarios registrados.
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.user_id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {u.email[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{u.email}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {roleIcon(u.role)}
                        {u.role}
                      </div>
                    </div>
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.user_id, e.target.value as RoleType)}
                    disabled={updating === u.user_id}
                    className="rounded-lg border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="admin">Admin</option>
                    <option value="negocio">Negocio</option>
                    <option value="usuario">Usuario</option>
                  </select>
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

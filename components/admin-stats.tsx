"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import {
  Users,
  FileText,
  Eye,
  MessageSquare,
  Clock,
  TrendingUp,
  Store,
  CheckCircle2,
} from "lucide-react";

interface AdminStats {
  totalProfiles: number;
  publishedProfiles: number;
  pendingProfiles: number;
  totalUsers: number;
  totalBusiness: number;
  totalViews: number;
  totalMessages: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalProfiles: 0,
    publishedProfiles: 0,
    pendingProfiles: 0,
    totalUsers: 0,
    totalBusiness: 0,
    totalViews: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: totalProfiles },
        { count: publishedProfiles },
        { count: pendingProfiles },
        { count: totalUsers },
        { count: totalBusiness },
        { count: totalViews },
        { count: totalMessages },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_published", false),
        supabase.from("user_roles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "negocio"),
        supabase.from("profile_views").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalProfiles: totalProfiles ?? 0,
        publishedProfiles: publishedProfiles ?? 0,
        pendingProfiles: pendingProfiles ?? 0,
        totalUsers: totalUsers ?? 0,
        totalBusiness: totalBusiness ?? 0,
        totalViews: totalViews ?? 0,
        totalMessages: totalMessages ?? 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return null;

  const cards = [
    {
      label: "Perfiles totales",
      value: stats.totalProfiles,
      icon: FileText,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      label: "Publicados",
      value: stats.publishedProfiles,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
    },
    {
      label: "Pendientes",
      value: stats.pendingProfiles,
      icon: Clock,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    },
    {
      label: "Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    },
    {
      label: "Negocios",
      value: stats.totalBusiness,
      icon: Store,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
      label: "Vistas totales",
      value: stats.totalViews,
      icon: Eye,
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
    },
    {
      label: "Mensajes",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
    },
    {
      label: "Tasa publicación",
      value: stats.totalProfiles > 0 ? `${Math.round((stats.publishedProfiles / stats.totalProfiles) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-tight">{card.value}</p>
                <p className="truncate text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

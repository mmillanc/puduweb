"use client";

import type { Profile } from "@/lib/types";

interface CompletionIndicatorProps {
  profile: Profile;
}

export function CompletionIndicator({ profile }: CompletionIndicatorProps) {
  const fields = [
    { key: "avatar_url", label: "Avatar" },
    { key: "cover_url", label: "Portada" },
    { key: "description", label: "Descripción" },
    { key: "city", label: "Ciudad" },
    { key: "phone", label: "Teléfono" },
    { key: "website", label: "Sitio web" },
    { key: "services", label: "Servicios" },
    { key: "hours", label: "Horarios" },
    { key: "instagram", label: "Instagram" },
    { key: "whatsapp", label: "WhatsApp" },
  ];

  const completed = fields.filter((f) => {
    const val = profile[f.key as keyof Profile];
    return val !== null && val !== undefined && val !== "";
  }).length;

  const percentage = Math.round((completed / fields.length) * 100);
  const missing = fields.filter((f) => {
    const val = profile[f.key as keyof Profile];
    return val === null || val === undefined || val === "";
  });

  const color =
    percentage >= 80 ? "text-green-500" : percentage >= 50 ? "text-yellow-500" : "text-orange-500";

  const barColor =
    percentage >= 80 ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-orange-500";

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Completitud del perfil</span>
        <span className={`text-sm font-bold ${color}`}>{percentage}%</span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {missing.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Falta completar:</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((f) => (
              <span
                key={f.key}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {missing.length === 0 && (
        <p className="text-xs font-medium text-green-500">
          ¡Perfil completo! Mayor visibilidad en búsquedas.
        </p>
      )}
    </div>
  );
}

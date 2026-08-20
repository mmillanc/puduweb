import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, User, Building2, Store } from "lucide-react";
import type { Profile } from "@/lib/types";
import { cn, getSizedImageUrl } from "@/lib/utils";

const typeConfig = {
  profesional: { label: "Profesional", icon: User },
  pyme: { label: "Pyme", icon: Building2 },
  vendedor: { label: "Vendedor", icon: Store },
};

export function ProfileCard({ profile }: { profile: Profile }) {
  const typeInfo = typeConfig[profile.type];
  const TypeIcon = typeInfo.icon;
  const blurDataURL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23e5e7eb'/%3E%3C/svg%3E";

  return (
    <Link
      href={`/${profile.slug}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50"
    >
      <div className="relative h-32 w-full bg-gradient-to-br from-primary/10 to-primary/5">
        {profile.cover_url ? (
          <Image
            src={getSizedImageUrl(profile.cover_url, "m")}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="400px"
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        ) : null}
        {profile.featured && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-yellow-900 dark:bg-yellow-500 dark:text-yellow-950">
            <Star size={12} fill="currentColor" />
            Destacado
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="-mt-12 mb-3 flex items-end justify-between">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-card bg-muted">
            {profile.avatar_url ? (
              <Image
                src={getSizedImageUrl(profile.avatar_url, "s")}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="64px"
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <TypeIcon size={28} />
              </div>
            )}
          </div>
          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            <TypeIcon size={12} />
            {typeInfo.label}
          </span>
        </div>

        <h3 className="mb-1 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          {profile.name}
        </h3>

        {profile.tagline && (
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {profile.tagline}
          </p>
        )}

        {profile.category && (
          <span className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {profile.category.name}
          </span>
        )}

        {profile.city && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} />
            {profile.city}
            {profile.region ? `, ${profile.region}` : ""}
          </div>
        )}
      </div>
    </Link>
  );
}

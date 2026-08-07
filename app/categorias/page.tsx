import { supabaseServer } from "@/lib/supabase-server";
import type { Category } from "@/lib/types";
import Link from "next/link";
import {
  Heart,
  Hammer,
  Laptop,
  GraduationCap,
  Scissors,
  Utensils,
  Car,
  Scale,
  Home,
  Dumbbell,
  Palette,
  Tag,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  hammer: Hammer,
  laptop: Laptop,
  "graduation-cap": GraduationCap,
  scissors: Scissors,
  utensils: Utensils,
  car: Car,
  scale: Scale,
  home: Home,
  dumbbell: Dumbbell,
  palette: Palette,
  tag: Tag,
};

export default async function CategoriesPage() {
  const { data: categories } = await supabaseServer
    .from("categories")
    .select("*")
    .order("name");

  const { data: counts } = await supabaseServer
    .from("profiles")
    .select("category_id")
    .eq("is_published", true);

  const countMap: Record<string, number> = {};
  (counts ?? []).forEach((row: { category_id: string | null }) => {
    if (row.category_id) {
      countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1;
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Categorías</h1>
      <p className="mb-8 text-muted-foreground">
        Explora profesionales y pymes por categoría.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(categories as Category[] | null)?.map((cat) => {
          const Icon = iconMap[cat.icon ?? "tag"] ?? Tag;
          const count = countMap[cat.id] ?? 0;
          return (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "perfil" : "perfiles"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

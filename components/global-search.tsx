"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import type { Category } from "@/lib/types";
import { Search, Loader2, ChevronRight } from "lucide-react";

interface SearchResult {
  type: "profile" | "category";
  id: string;
  name: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      const [profileRes, categoryRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, name, slug, city, tagline, category:categories(name)")
          .eq("is_published", true)
          .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,city.ilike.%${query}%`)
          .limit(5),
        supabase
          .from("categories")
          .select("id, name, slug")
          .or(`name.ilike.%${query}%`)
          .limit(3),
      ]);

      const profileResults: SearchResult[] = ((profileRes.data as unknown as { id: string; name: string; slug: string; city: string | null; tagline: string | null }[]) ?? []).map(
        (p) => ({
          type: "profile" as const,
          id: p.id,
          name: p.name,
          subtitle: [p.tagline, p.city].filter(Boolean).join(" · ") || "Perfil",
          href: `/${p.slug}`,
        })
      );

      const categoryResults: SearchResult[] = ((categoryRes.data as Category[]) ?? []).map(
        (c) => ({
          type: "category" as const,
          id: c.id,
          name: c.name,
          subtitle: "Categoría",
          href: `/categoria/${c.slug}`,
        })
      );

      setResults([...profileResults, ...categoryResults]);
      setShowResults(true);
      setLoading(false);
      setHighlightIndex(-1);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      const r = results[highlightIndex];
      router.push(r.href);
      setShowResults(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  }

  function goToResult(r: SearchResult) {
    router.push(r.href);
    setShowResults(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Buscar perfiles, categorías..."
          className="w-56 rounded-lg border bg-background py-1.5 pl-9 pr-3 text-sm outline-none transition-all focus:w-72 focus:ring-2 focus:ring-primary"
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            size={14}
          />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-background shadow-lg">
          {results.map((r, i) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => goToResult(r)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                i === highlightIndex ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.name}</div>
                <div className="truncate text-xs text-muted-foreground">{r.subtitle}</div>
              </div>
              <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
            </button>
          ))}
          <div className="border-t px-4 py-2 text-center text-xs text-muted-foreground">
            {results.length} resultados · Enter para ir
          </div>
        </div>
      )}

      {showResults && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-background p-4 text-center text-sm text-muted-foreground shadow-lg">
          No se encontraron resultados para &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

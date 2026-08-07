"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Menu, X } from "lucide-react";
import type { RoleType } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<RoleType | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      if (data.session?.user) {
        fetchRole(data.session.user.id);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
        if (session?.user) {
          fetchRole(session.user.id);
        } else {
          setRole(null);
        }
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    setRole((data?.role as RoleType) ?? "usuario");
  }

  function getDashboardLink() {
    if (role === "admin") return { href: "/admin", label: "Panel Admin" };
    if (role === "negocio") return { href: "/negocio", label: "Mi Negocio" };
    return null;
  }

  const dashboard = getDashboardLink();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">PuduWeb</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/categorias"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Categorías
          </Link>
          {dashboard ? (
            <Link
              href={dashboard.href}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {dashboard.label}
            </Link>
          ) : isLoggedIn ? (
            <Link
              href="/favoritos"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Favoritos
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <GlobalSearch />
          <ThemeToggle />
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t md:hidden">
          <div className="flex flex-col gap-4 px-4 py-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/categorias"
              className="text-sm font-medium hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              Categorías
            </Link>
            {dashboard ? (
              <Link
                href={dashboard.href}
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {dashboard.label}
              </Link>
            ) : isLoggedIn ? (
              <Link
                href="/favoritos"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                Favoritos
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

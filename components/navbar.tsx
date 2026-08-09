"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { RoleType } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";

export function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<RoleType | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      if (data.session?.user) {
        fetchRole(data.session.user.id);
      }
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
        if (session?.user) {
          fetchRole(session.user.id);
        } else {
          setRole(null);
        }
        setAuthChecked(true);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchRole(userId: string) {
    const { data } = await supabase
      .rpc("get_user_role", { user_uuid: userId });
    setRole((data as RoleType) ?? "usuario");
  }

  function handleLogout() {
    supabase.auth.signOut().then(() => {
      setUserMenuOpen(false);
      router.push("/");
      router.refresh();
    });
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PuduWeb" className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
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
          <Link
            href="/sobre-nosotros"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Sobre nosotros
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/contacto"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Contacto
          </Link>
          {dashboard && (
            <Link
              href={dashboard.href}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {dashboard.label}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <GlobalSearch />
          <ThemeToggle />
          <div className="relative hidden lg:block" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <User size={16} />
              {isLoggedIn ? "Mi cuenta" : "Usuario"}
              <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {userMenuOpen && !isLoggedIn && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border bg-card shadow-lg">
                <Link
                  href="/login"
                  className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
            {userMenuOpen && isLoggedIn && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-card shadow-lg">
                {dashboard && (
                  <Link
                    href={dashboard.href}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={14} />
                    {dashboard.label}
                  </Link>
                )}
                {!dashboard && (
                  <Link
                    href="/favoritos"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Heart size={14} />
                    Favoritos
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t lg:hidden">
          <div className="flex flex-col gap-3 px-4 py-4">
            <Link href="/" className="text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
              Inicio
            </Link>
            <Link href="/categorias" className="text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
              Categorías
            </Link>
            <Link href="/sobre-nosotros" className="text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
              Sobre nosotros
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
              FAQ
            </Link>
            <Link href="/contacto" className="text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
              Contacto
            </Link>
            <Link href="/terminos" className="text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
              Términos
            </Link>
            <Link href="/privacidad" className="text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
              Privacidad
            </Link>

            <div className="my-1 border-t" />

            <div className="flex items-center gap-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <User size={14} />
              {isLoggedIn ? "Mi cuenta" : "Usuario"}
            </div>

            {dashboard && (
              <Link href={dashboard.href} className="flex items-center gap-2 text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={16} />
                {dashboard.label}
              </Link>
            )}
            {isLoggedIn && !dashboard && (
              <Link href="/favoritos" className="flex items-center gap-2 text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
                <Heart size={16} />
                Favoritos
              </Link>
            )}
            {!isLoggedIn && (
              <>
                <Link href="/login" className="flex items-center gap-2 text-sm font-medium hover:text-primary" onClick={() => setMenuOpen(false)}>
                  <User size={16} />
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>
                  <User size={16} />
                  Registrarse
                </Link>
              </>
            )}
            {isLoggedIn && (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="flex items-center gap-2 text-left text-sm font-medium text-red-500"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

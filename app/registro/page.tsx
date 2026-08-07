"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { Loader2, User, Store, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"negocio" | "usuario">("usuario");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState<"profesional" | "pyme" | "vendedor">("pyme");
  const [bizCategoryId, setBizCategoryId] = useState("");
  const [bizTagline, setBizTagline] = useState("");
  const [bizCity, setBizCity] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [bizInstagram, setBizInstagram] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");
  const [bizDescription, setBizDescription] = useState("");

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data as Category[]);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (role === "negocio" && (!bizName || !bizCategoryId)) {
      setError("Completa el nombre y categoría del negocio");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("No se pudo crear la cuenta");
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (roleError) {
      console.error("Error asignando rol:", roleError.message);
    }

    if (role === "negocio") {
      const slug = slugify(bizName);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          name: bizName,
          slug,
          type: bizType,
          category_id: bizCategoryId,
          tagline: bizTagline || null,
          description: bizDescription || null,
          city: bizCity || null,
          phone: bizPhone || null,
          email: email,
          website: bizWebsite || null,
          instagram: bizInstagram || null,
          whatsapp: bizWhatsapp || null,
          is_published: false,
          featured: false,
        })
        .select("id")
        .single();

      if (profileError) {
        console.error("Error creando perfil:", profileError.message);
        setError(
          "Cuenta creada pero hubo un error al crear el perfil. Puedes completarlo desde tu panel."
        );
        setLoading(false);
        return;
      }

      if (profileData) {
        const { error: ownerError } = await supabase
          .from("profile_owners")
          .insert({
            profile_id: profileData.id,
            user_id: userId,
          });

        if (ownerError) {
          console.error("Error asignando ownership:", ownerError.message);
        }
      }
    }

    setLoading(false);

    if (data.session) {
      router.push(role === "negocio" ? "/negocio" : "/");
      router.refresh();
    } else {
      router.push("/login?message=Revisa tu email para confirmar tu cuenta");
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Crear cuenta</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Únete a PuduWeb como usuario o negocio.
      </p>

      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium">Tipo de cuenta</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("usuario")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              role === "usuario"
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "hover:border-muted-foreground/50"
            }`}
          >
            <User size={28} className={role === "usuario" ? "text-primary" : "text-muted-foreground"} />
            <span className="text-sm font-medium">Usuario</span>
            <span className="text-xs text-muted-foreground">Buscar y reseñas</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("negocio")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              role === "negocio"
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "hover:border-muted-foreground/50"
            }`}
          >
            <Store size={28} className={role === "negocio" ? "text-primary" : "text-muted-foreground"} />
            <span className="text-sm font-medium">Negocio</span>
            <span className="text-xs text-muted-foreground">Crear mi perfil</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="tu@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Mín. 6 caracteres"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Confirmar</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {role === "negocio" && (
          <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Store size={16} />
              Datos de tu negocio
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Nombre del negocio *</label>
              <input
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Kinesiología San Juan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tipo</label>
                <select
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value as typeof bizType)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pyme">Pyme</option>
                  <option value="profesional">Profesional</option>
                  <option value="vendedor">Vendedor</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Categoría *</label>
                <select
                  required
                  value={bizCategoryId}
                  onChange={(e) => setBizCategoryId(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Eslogan / subtítulo</label>
              <input
                value={bizTagline}
                onChange={(e) => setBizTagline(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Fisioterapia deportiva y rehabilitación"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Ciudad</label>
                <input
                  value={bizCity}
                  onChange={(e) => setBizCity(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Temuco"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Teléfono</label>
                <input
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Sitio web</label>
              <input
                value={bizWebsite}
                onChange={(e) => setBizWebsite(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://mi-tienda.cl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Instagram</label>
                <input
                  value={bizInstagram}
                  onChange={(e) => setBizInstagram(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="@mi_negocio"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">WhatsApp</label>
                <input
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+56912345678"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Descripción</label>
              <textarea
                value={bizDescription}
                onChange={(e) => setBizDescription(e.target.value)}
                className="min-h-[80px] w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Cuenta sobre tu negocio, servicios que ofreces, experiencia..."
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              <span>
                Tu perfil se creará como <strong>borrador</strong>. Un administrador lo
                revisará y lo publicará. Mientras tanto, puedes seguir editándolo desde tu panel.
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Crear cuenta
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </a>
      </p>
    </div>
  );
}

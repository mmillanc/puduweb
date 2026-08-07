"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { slugify } from "@/lib/utils";
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidInstagram,
  isValidWhatsApp,
  passwordStrength,
  isDisposableEmail,
} from "@/lib/validations";
import type { Category } from "@/lib/types";
import { Loader2, User, Store, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"negocio" | "usuario">("usuario");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setFieldErrors({});

    const errors: Record<string, string> = {};

    // Validar email
    if (!isValidEmail(email)) {
      errors.email = "Ingresa un email válido";
    } else if (isDisposableEmail(email)) {
      errors.email = "No se permiten emails temporales o desechables";
    }

    // Validar contraseña
    const pwCheck = passwordStrength(password);
    if (pwCheck.score < 3) {
      errors.password = "La contraseña es muy débil. Usa mínimo 8 caracteres, mayúsculas, números y símbolos.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validar campos de negocio
    if (role === "negocio") {
      if (!bizName.trim()) {
        errors.bizName = "El nombre del negocio es obligatorio";
      }
      if (!bizCategoryId) {
        errors.bizCategoryId = "Selecciona una categoría";
      }
      if (bizPhone && !isValidPhone(bizPhone)) {
        errors.bizPhone = "Teléfono inválido. Ej: +56 9 1234 5678";
      }
      if (bizWebsite && !isValidUrl(bizWebsite)) {
        errors.bizWebsite = "URL inválida. Debe incluir http:// o https://";
      }
      if (bizInstagram && !isValidInstagram(bizInstagram)) {
        errors.bizInstagram = "Usuario de Instagram inválido";
      }
      if (bizWhatsapp && !isValidWhatsApp(bizWhatsapp)) {
        errors.bizWhatsapp = "Número de WhatsApp inválido";
      }
      if (!bizDescription.trim() || bizDescription.trim().length < 20) {
        errors.bizDescription = "Describe tu negocio (mínimo 20 caracteres)";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailTouched && fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              onBlur={() => {
                setEmailTouched(true);
                if (email && !isValidEmail(email)) {
                  setFieldErrors((prev) => ({ ...prev, email: "Email inválido" }));
                } else if (email && isDisposableEmail(email)) {
                  setFieldErrors((prev) => ({ ...prev, email: "No se permiten emails temporales" }));
                }
              }}
              className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.email ? "border-red-500" : ""
              }`}
              placeholder="tu@email.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                className={`w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary ${
                  fieldErrors.password ? "border-red-500" : ""
                }`}
                placeholder="Mín. 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i < passwordStrength(password).score
                          ? passwordStrength(password).color
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {passwordStrength(password).label}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  {passwordStrength(password).checks.map((c, i) => (
                    <span
                      key={i}
                      className={`text-xs ${c.passed ? "text-green-500" : "text-muted-foreground"}`}
                    >
                      {c.passed ? "✓" : "○"} {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirmar contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }
              }}
              className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
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
                onChange={(e) => {
                  setBizName(e.target.value);
                  if (fieldErrors.bizName) setFieldErrors((prev) => ({ ...prev, bizName: "" }));
                }}
                className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                  fieldErrors.bizName ? "border-red-500" : ""
                }`}
                placeholder="Ej: Kinesiología San Juan"
              />
              {fieldErrors.bizName && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.bizName}</p>
              )}
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
                  onChange={(e) => {
                    setBizCategoryId(e.target.value);
                    if (fieldErrors.bizCategoryId) setFieldErrors((prev) => ({ ...prev, bizCategoryId: "" }));
                  }}
                  className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.bizCategoryId ? "border-red-500" : ""
                  }`}
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
                  onChange={(e) => {
                    setBizPhone(e.target.value);
                    if (fieldErrors.bizPhone) setFieldErrors((prev) => ({ ...prev, bizPhone: "" }));
                  }}
                  className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.bizPhone ? "border-red-500" : ""
                  }`}
                  placeholder="+56 9 1234 5678"
                />
                {fieldErrors.bizPhone && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.bizPhone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Sitio web</label>
              <input
                value={bizWebsite}
                onChange={(e) => {
                  setBizWebsite(e.target.value);
                  if (fieldErrors.bizWebsite) setFieldErrors((prev) => ({ ...prev, bizWebsite: "" }));
                }}
                className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                  fieldErrors.bizWebsite ? "border-red-500" : ""
                }`}
                placeholder="https://mi-tienda.cl"
              />
              {fieldErrors.bizWebsite && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.bizWebsite}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Instagram</label>
                <input
                  value={bizInstagram}
                  onChange={(e) => {
                    setBizInstagram(e.target.value);
                    if (fieldErrors.bizInstagram) setFieldErrors((prev) => ({ ...prev, bizInstagram: "" }));
                  }}
                  className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.bizInstagram ? "border-red-500" : ""
                  }`}
                  placeholder="@mi_negocio"
                />
                {fieldErrors.bizInstagram && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.bizInstagram}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">WhatsApp</label>
                <input
                  value={bizWhatsapp}
                  onChange={(e) => {
                    setBizWhatsapp(e.target.value);
                    if (fieldErrors.bizWhatsapp) setFieldErrors((prev) => ({ ...prev, bizWhatsapp: "" }));
                  }}
                  className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                    fieldErrors.bizWhatsapp ? "border-red-500" : ""
                  }`}
                  placeholder="+56912345678"
                />
                {fieldErrors.bizWhatsapp && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.bizWhatsapp}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Descripción</label>
              <textarea
                value={bizDescription}
                onChange={(e) => {
                  setBizDescription(e.target.value);
                  if (fieldErrors.bizDescription) setFieldErrors((prev) => ({ ...prev, bizDescription: "" }));
                }}
                className={`min-h-[80px] w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary ${
                  fieldErrors.bizDescription ? "border-red-500" : ""
                }`}
                placeholder="Cuenta sobre tu negocio, servicios que ofreces, experiencia..."
              />
              {fieldErrors.bizDescription && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.bizDescription}</p>
              )}
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

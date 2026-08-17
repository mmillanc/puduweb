"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Upload, Loader2, X, ImagePlus } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  aspectRatio?: "square" | "wide";
}

export function ImageUpload({
  label,
  value,
  onChange,
  folder = "misc",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  async function resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality = 0.8
  ): Promise<Blob> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("No se pudo leer la imagen"));
        }
      };
      reader.onerror = () => reject(reader.error || new Error("Error al leer la imagen"));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      image.src = dataUrl;
    });

    const { width, height } = img;

    if (width <= maxWidth && height <= maxHeight) {
      return file;
    }

    const ratio = Math.min(maxWidth / width, maxHeight / height);
    const targetWidth = Math.round(width * ratio);
    const targetHeight = Math.round(height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo crear el contexto del canvas");
    }
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("No se pudo generar la imagen optimizada"));
        },
        file.type || "image/jpeg",
        quality
      );
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB");
      return;
    }

    if (!userId) {
      setError("Debes iniciar sesión para subir imágenes");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG, WebP o GIF");
      return;
    }

    setUploading(true);
    setError(null);

    let fileToUpload: Blob | File = file;

    try {
      fileToUpload = await resizeImage(file, 1600, 1600, 0.8);
    } catch (err) {
      console.error("Error al optimizar la imagen", err);
    }

    const ext = file.name.split(".").pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(fileName, fileToUpload, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    onChange(data.publicUrl);
    setUploading(false);
  }

  function handleRemove() {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div
            className={`relative overflow-hidden rounded-lg border bg-muted ${
              aspectRatio === "square" ? "h-16 w-16" : "h-16 w-28"
            }`}
          >
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex items-center justify-center rounded-lg border border-dashed bg-muted/50 text-muted-foreground ${
              aspectRatio === "square" ? "h-16 w-16" : "h-16 w-28"
            }`}
          >
            <ImagePlus size={20} />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              Subir
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
            placeholder="O pega una URL..."
          />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

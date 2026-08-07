"use client";

import { useState, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

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

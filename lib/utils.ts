import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type ImageSize = "s" | "m" | "l";

export function getSizedImageUrl(url: string, size: ImageSize): string {
  if (!url) return url;

  const [base, existingQuery] = url.split("?");
  const params = new URLSearchParams(existingQuery || "");

  if (size === "s") {
    params.set("width", "160");
  } else if (size === "m") {
    params.set("width", "400");
  } else {
    params.set("width", "800");
  }

  if (!params.has("quality")) {
    params.set("quality", "80");
  }

  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}

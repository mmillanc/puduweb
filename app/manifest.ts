import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PuduWeb - Directorio de profesionales y pymes",
    short_name: "PuduWeb",
    description:
      "Directorio local de profesionales, pymes y vendedores. Busca por categoría, ubicación o nombre.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: ["business", "directory", "local"],
    lang: "es-CL",
  };
}

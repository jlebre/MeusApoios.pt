import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

// Manifesto PWA: permite "Adicionar ao ecrã principal" no Android/iOS,
// com aparência de app (cor, nome, ícone).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: BRAND.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#f5f9fc",
    theme_color: "#0a6cff",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

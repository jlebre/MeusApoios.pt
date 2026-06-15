import type { MetadataRoute } from "next";

// Manifesto PWA: permite "Adicionar ao ecrã principal" no Android/iOS,
// com aparência de app (cor, nome, ícone).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeusApoios",
    short_name: "MeusApoios",
    description:
      "Descobre a que apoios tens direito em Portugal.",
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

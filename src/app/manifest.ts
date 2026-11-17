import type { MetadataRoute } from "next";

// Manifeste de l'application installable (PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ActeFacile — Vos actes juridiques",
    short_name: "ActeFacile",
    description: "Rédigez vos actes juridiques en droit ivoirien : bail, reconnaissance de dette, mise en demeure…",
    lang: "fr-CI",
    dir: "ltr",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f1f3a",
    theme_color: "#0f1f3a",
    categories: ["productivity", "business", "utilities"],
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Mes documents", url: "/mes-documents", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
      { name: "Trouver mon acte", url: "/orientation", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
    ],
  };
}

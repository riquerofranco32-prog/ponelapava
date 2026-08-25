import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Poné La Pava — Tienda Matera",
    short_name: "Poné La Pava",
    description:
      "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos, bombillas y combos exclusivos en Catriel y envíos a todo el país.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#26402e",
    orientation: "portrait",
    categories: ["shopping", "lifestyle"],
    lang: "es-AR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

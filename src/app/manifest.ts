import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quitandas da Dila",
    short_name: "Quitandas da Dila",
    description: "Encomendas de pão de queijo, biscoito de queijo e quitandas – Pompéu – MG",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF1E6",
    theme_color: "#FBF1E6",
    lang: "pt-BR",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}

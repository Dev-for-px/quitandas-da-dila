import type { Metadata, Viewport } from "next";
import "@fontsource/great-vibes/400.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import { NEGOCIO, SITE_URL } from "@/lib/site";
import "./globals.css";

const descricao =
  "Pão de queijo e biscoito de queijo artesanais em Pompéu – MG: congelados para pronta entrega todos os dias ou assados por encomenda. Bolos caseiros, tarecos e pudim. Monte sua encomenda e envie pelo WhatsApp: (37) 99826-2611.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Quitandas da Dila | Pão de Queijo e Biscoito de Queijo em Pompéu – MG",
    template: "%s | Quitandas da Dila – Pompéu – MG",
  },
  description: descricao,
  applicationName: NEGOCIO.nome,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "pt_BR", siteName: NEGOCIO.nome, url: SITE_URL,
    title: "Quitandas da Dila — Da cozinha da Dila para sua família.", description: descricao,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#FBF1E6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

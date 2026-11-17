// Fatos oficiais da marca (NAP) — iguais ao MANUAL_DESIGN_SYSTEM.md e ao Google Meu Negócio.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://quitandas-da-dila.vercel.app")
).replace(/\/$/, "");

export const NEGOCIO = {
  nome: "Quitandas da Dila",
  artesa: "Dirlene (Dila)",
  endereco: {
    rua: "Rua Professora Pequenina, 361",
    bairro: "Bairro Cristos",
    cidade: "Pompéu",
    uf: "MG",
    cep: "35640-000",
  },
  telefone: "5537998262611",
  whatsapp: "5537998262611",
  instagram: "https://www.instagram.com/quitandasdadila/",
  instagramArroba: "@quitandasdadila",
  mapsBusca: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Rua Professora Pequenina, 361, Cristos, Pompéu - MG"),
  slogans: {
    principal: "Da cozinha da Dila para sua família.",
    secundario: "Feito com carinho, do jeitinho mineiro.",
    terciario: "O verdadeiro sabor de Minas.",
  },
} as const;

export const ENDERECO_LINHA = `${NEGOCIO.endereco.rua} – ${NEGOCIO.endereco.bairro}, ${NEGOCIO.endereco.cidade} – ${NEGOCIO.endereco.uf}`;

/** 5537998262611 -> (37) 99826-2611 */
export function formatarTelefone(digitos: string) {
  const d = digitos.replace(/\D/g, "").replace(/^55/, "");
  const ddd = d.slice(0, 2);
  const num = d.slice(2);
  return num.length === 9 ? `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}` : `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
}

export const MSG_PADRAO = "Olá, Dila! Vim pelo site e gostaria de fazer uma encomenda.";

export function linkWhatsApp(mensagem: string = MSG_PADRAO, numero: string = NEGOCIO.whatsapp) {
  return `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}

export function linkLigar(numero: string = NEGOCIO.telefone) {
  return `tel:+${numero.replace(/\D/g, "")}`;
}

export function formatarPreco(valor: number | null | undefined) {
  if (valor == null) return null;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

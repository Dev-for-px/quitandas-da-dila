// JSON-LD (schema.org) — ajuda Google e IAs a entenderem a Quitandas da Dila.
import { ENDERECO_LINHA, NEGOCIO, SITE_URL } from "./site";
import type { Categoria, Faq, Post, Produto } from "./dados";
import { redesAtivas, type Redes } from "./redes";

const ID = `${SITE_URL}/#quitandas-da-dila`;

export function negocioJsonLd(redes: Redes = {}, entrega = true) {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": ID,
    name: NEGOCIO.nome,
    slogan: NEGOCIO.slogans.principal,
    description: "Quitandas mineiras artesanais em Pompéu – MG: pão de queijo e biscoito de queijo congelados para pronta entrega ou assados por encomenda, bolos caseiros, tarecos e pudim.",
    founder: { "@type": "Person", name: "Dirlene", alternateName: "Dila" },
    url: SITE_URL,
    telephone: `+${NEGOCIO.telefone}`,
    image: `${SITE_URL}/opengraph-image.jpg`,
    logo: `${SITE_URL}/img/logo-480.webp`,
    servesCuisine: "Mineira",
    hasMap: NEGOCIO.mapsBusca,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${NEGOCIO.endereco.rua} – ${NEGOCIO.endereco.bairro}`,
      addressLocality: NEGOCIO.endereco.cidade,
      addressRegion: NEGOCIO.endereco.uf,
      postalCode: NEGOCIO.endereco.cep,
      addressCountry: "BR",
    },
    areaServed: { "@type": "City", name: "Pompéu", containedInPlace: { "@type": "State", name: "Minas Gerais" } },
    ...(entrega ? { potentialAction: { "@type": "OrderAction", deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModePickUp", "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"] } } : {}),
    sameAs: [...new Set([NEGOCIO.instagram, ...redesAtivas(redes).map((r) => r.url)])],
    disambiguatingDescription: ENDERECO_LINHA,
  };
}

export function catalogoJsonLd(secoes: (Categoria & { produtos: Produto[] })[], mostrarPreco: boolean) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Quitandas da Dila",
    url: `${SITE_URL}/`,
    itemListElement: secoes.filter((s) => s.produtos.length).map((s) => ({
      "@type": "OfferCatalog",
      name: s.nome,
      itemListElement: s.produtos.filter((p) => p.disponivel).flatMap((p) => {
        const base = { "@type": "Product", name: p.nome, ...(p.descricao ? { description: p.descricao } : {}), ...(p.foto_url ? { image: p.foto_url.startsWith("http") ? p.foto_url : `${SITE_URL}${p.foto_url}` } : {}) };
        const opcoes = p.variacoes.length ? p.variacoes : [{ nome: "", preco: p.preco }];
        return opcoes.map((v) => ({
          "@type": "Offer",
          itemOffered: { ...base, name: v.nome ? `${p.nome} ${v.nome.toLowerCase()}` : p.nome },
          seller: { "@id": ID },
          ...(mostrarPreco && v.preco != null ? { price: v.preco.toFixed(2), priceCurrency: "BRL" } : {}),
        }));
      }),
    })),
  };
}

export function faqJsonLd(faq: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.pergunta, acceptedAnswer: { "@type": "Answer", text: f.resposta } })),
  };
}

export function breadcrumbJsonLd(itens: { nome: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.nome, item: `${SITE_URL}${i.url}` })),
  };
}

export function comoAssarJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Como assar o pão de queijo congelado da Dila na Air Fryer",
    totalTime: "PT28M",
    step: [
      "Pré-aqueça a Air Fryer a 200 °C por 10 minutos.",
      "Coloque os pães ou biscoitos direto do freezer no cesto, sem amontoar. Não descongele.",
      "Asse a 200 °C por 15 a 18 minutos.",
      "Aos 7 minutos, dê uma leve sacudida no cesto para assar por igual.",
      "Sirva logo, para aproveitar a casquinha crocante.",
    ].map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
  };
}

export function artigoJsonLd(p: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.titulo,
    description: p.resumo ?? undefined,
    image: p.capa_url ?? `${SITE_URL}/opengraph-image.jpg`,
    datePublished: p.publicado_em,
    dateModified: p.atualizado_em,
    url: `${SITE_URL}/novidades/${p.slug}`,
    author: { "@id": ID },
    publisher: { "@id": ID },
    inLanguage: "pt-BR",
  };
}

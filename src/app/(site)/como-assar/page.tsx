import type { Metadata } from "next";
import { BotaoLigar, BotaoWhatsApp } from "@/components/Botoes";
import { Icone, TituloSecao } from "@/components/Icone";
import { JsonLd } from "@/components/JsonLd";
import { getConfig } from "@/lib/dados";
import { breadcrumbJsonLd, comoAssarJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Como assar pão de queijo congelado no forno e na Air Fryer",
  description: "Passo a passo da Dila para assar o pão de queijo e o biscoito de queijo congelados: direto do freezer, no forno ou na Air Fryer a 200 °C. Quitandas da Dila, Pompéu – MG.",
  alternates: { canonical: "/como-assar" },
};

// Instruções canônicas (estrategia-seo-geo/03_GEO_AEO_ANSWER_BLOCKS.md)
const FORNO = [
  "Pré-aqueça o forno a 300 °C (chave no máximo) por 10 minutos.",
  "Distribua os pães ou biscoitos na assadeira com espaço entre eles. Não precisa untar.",
  "Quando começarem a crescer, abaixe para 250 °C (chave no médio).",
  "Asse por 20 a 25 minutos, até dourarem levemente por cima.",
];
const AIR = [
  "Pré-aqueça a Air Fryer a 200 °C por 10 minutos.",
  "Coloque os pães ou biscoitos no cesto, sem amontoar.",
  "Asse a 200 °C por 15 a 18 minutos.",
  "Aos 7 minutos, dê uma leve sacudida no cesto para assar por igual.",
  "Sirva logo, para aproveitar a casquinha crocante e o miolo macio.",
];

export default async function ComoAssar() {
  const config = await getConfig();
  const bloco = (titulo: string, icone: "forno" | "air-fryer", passos: string[]) => (
    <section className="qd-cartao p-5 md:p-6" aria-label={titulo}>
      <h2 className="flex items-center gap-3 text-2xl font-bold"><span className="modo__icone"><Icone nome={icone} tamanho={26} /></span>{titulo}</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-6 marker:font-bold marker:text-terra">{passos.map((p) => <li key={p}>{p}</li>)}</ol>
    </section>
  );
  return (
    <div className="envelope max-w-3xl py-8">
      <JsonLd data={comoAssarJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Como assar", url: "/como-assar" }])} />
      <TituloSecao>Como assar</TituloSecao>
      <h1 className="mt-6 text-center text-3xl font-bold md:text-4xl">Pão de queijo e biscoito de queijo congelados da Dila</h1>
      <p className="mx-auto mt-4 max-w-[640px] rounded-md border-2 border-dashed border-borda p-4 text-center">
        <b>Regra de ouro: não descongele.</b> Leve direto do freezer para o forno ou a Air Fryer. Fora da geladeira por mais de 5 minutos antes de assar, eles perdem o crescimento e a crocância.
      </p>
      <div className="mt-8 grid gap-6">
        {bloco("Na Air Fryer", "air-fryer", AIR)}
        {bloco("No forno elétrico ou a gás", "forno", FORNO)}
      </div>
      <div className="mt-10 text-center">
        <p className="qd-slogan">Acabou? Peça mais uma bandeja.</p>
        <div className="acoes acoes--centro">
          <BotaoLigar grande numero={config.telefone} />
          <BotaoWhatsApp grande numero={config.whatsapp} mensagem="Olá, Dila! Quero mais uma bandeja de pão de queijo." />
        </div>
      </div>
    </div>
  );
}

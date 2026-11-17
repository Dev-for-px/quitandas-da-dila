import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ListaFaq } from "@/components/ListaFaq";
import { getFaq } from "@/lib/dados";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Perguntas frequentes – encomendas, entrega e como assar",
  description: "Como encomendar, entrega e retirada, pão de queijo congelado ou assado e como assar. Quitandas da Dila, Pompéu – MG.",
  alternates: { canonical: "/perguntas-frequentes" },
};

export default async function Perguntas() {
  const faq = await getFaq();
  return (
    <div className="envelope max-w-3xl py-10">
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Perguntas frequentes", url: "/perguntas-frequentes" }])} />
      <h1 className="text-4xl font-bold">Perguntas frequentes sobre a Quitandas da Dila</h1>
      <div className="mt-8"><ListaFaq faq={faq} nivel={2} /></div>
    </div>
  );
}

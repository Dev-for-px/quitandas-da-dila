import { Topo } from "@/components/Topo";
import { Rodape } from "@/components/Rodape";
import { BarraFixa } from "@/components/BarraFixa";
import { BarraCarrinho } from "@/components/BarraCarrinho";
import { JsonLd } from "@/components/JsonLd";
import { AvisoSaida } from "@/components/AvisoSaida";
import { Rastreio } from "@/components/Rastreio";
import { CarrinhoProvider } from "@/lib/carrinho";
import { getConfig } from "@/lib/dados";
import { negocioJsonLd } from "@/lib/schema";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const config = await getConfig();
  const pedido = {
    mostrarPrecos: config.mostrar_precos,
    pausado: config.pedidos_pausados,
    whatsapp: config.whatsapp,
    telefone: config.telefone,
    aceitaEntrega: config.aceita_entrega,
    taxaEntrega: config.taxa_entrega,
    pedidoMinimo: config.pedido_minimo,
  };
  return (
    <CarrinhoProvider config={pedido}>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <JsonLd data={negocioJsonLd(config.redes, config.aceita_entrega)} />
      <Topo telefone={config.telefone} />
      <main id="conteudo" className="flex-1">{children}</main>
      <Rodape redes={config.redes} telefone={config.telefone} horario={config.horario} />
      <BarraCarrinho />
      <BarraFixa telefone={config.telefone} whatsapp={config.whatsapp} />
      <AvisoSaida config={config.saida} whatsapp={config.whatsapp} telefone={config.telefone} />
      <Rastreio />
    </CarrinhoProvider>
  );
}

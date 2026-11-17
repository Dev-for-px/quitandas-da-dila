// Monta o texto do pedido que vai pronto para o WhatsApp da Dila.
import { precoItem, type ItemCarrinho } from "./carrinho";
import { formatarPreco } from "./site";

export type DadosCliente = {
  nome: string;
  tipo: "retirada" | "entrega";
  data: string;       // AAAA-MM-DD (opcional para congelado na retirada)
  hora: string;       // HH:MM
  endereco: string;
  referencia: string;
  pagamento: string;
  troco: string;
  obs: string;
};

export function dataBonita(iso: string) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d, 12));
  return dt.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

export function quando(c: Pick<DadosCliente, "data" | "hora">) {
  if (!c.data && !c.hora) return "";
  return [c.data ? dataBonita(c.data) : "", c.hora ? `às ${c.hora.replace(":", "h")}` : ""].filter(Boolean).join(" ");
}

export function montarMensagem(itens: ItemCarrinho[], cliente: DadosCliente, mostrarPrecos: boolean, taxaEntrega: number | null) {
  const linhas: string[] = ["Olá, Dila! Quero fazer uma encomenda pelo site 🧀", ""];
  const grupos = [...new Set(itens.map((i) => i.grupo))];
  let soma = 0;
  let aConfirmar = false;
  for (const g of grupos) {
    linhas.push(`*${g}*`);
    for (const i of itens.filter((x) => x.grupo === g)) {
      const valor = mostrarPrecos ? precoItem(i) : null;
      if (valor == null) aConfirmar = true;
      else soma += valor;
      linhas.push(`• ${i.qtd}x ${i.nome}${valor != null ? ` — ${formatarPreco(valor)}` : ""}`);
      if (i.obs.trim()) linhas.push(`   Obs.: ${i.obs.trim()}`);
    }
    linhas.push("");
  }

  const entrega = cliente.tipo === "entrega";
  if (mostrarPrecos && soma > 0) {
    linhas.push(`Subtotal: ${formatarPreco(soma)}${aConfirmar ? " + itens a confirmar" : ""}`);
    if (entrega) linhas.push(taxaEntrega != null ? `Taxa de entrega: ${formatarPreco(taxaEntrega)}` : "Taxa de entrega: a confirmar");
    if (entrega && taxaEntrega != null && !aConfirmar) linhas.push(`*Total: ${formatarPreco(soma + taxaEntrega)}*`);
  } else {
    linhas.push("Valor: a confirmar");
  }
  linhas.push("");

  linhas.push(`*Nome:* ${cliente.nome.trim()}`);
  const q = quando(cliente);
  if (entrega) {
    linhas.push(`*Entrega* (encomenda)${q ? `: ${q}` : ""}`);
    linhas.push(`Endereço: ${cliente.endereco.trim()}`);
    if (cliente.referencia.trim()) linhas.push(`Referência: ${cliente.referencia.trim()}`);
  } else {
    linhas.push(`*Retirada*${q ? `: ${q}` : ""}`);
  }
  if (cliente.pagamento) linhas.push(`*Pagamento:* ${cliente.pagamento}${cliente.pagamento === "Dinheiro" && cliente.troco.trim() ? ` (troco para ${cliente.troco.trim()})` : ""}`);
  if (cliente.obs.trim()) linhas.push(`*Observação:* ${cliente.obs.trim()}`);
  return linhas.join("\n");
}

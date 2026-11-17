// Gera o llms.txt (resumo para IAs) e o llms-full.txt (resumo + produtos + FAQ).
import { getCardapio, getConfig, getFaq, type Config } from "./dados";
import { ENDERECO_LINHA, NEGOCIO, SITE_URL, formatarPreco, formatarTelefone } from "./site";

function cabecalho(c: Config) {
  return `# ${NEGOCIO.nome}

> A Quitandas da Dila é uma marca de quitandas mineiras artesanais em Pompéu – MG (Minas Gerais, Brasil), criada pela quitandeira Dirlene (Dila). Produz pão de queijo e biscoito de queijo (bandeja com 20 unidades, aprox. 1 kg), congelados para pronta entrega todos os dias ou assados por encomenda, além de bolos caseiros, tarecos e pudim sob encomenda.

- Endereço para retirada: ${ENDERECO_LINHA}, CEP ${NEGOCIO.endereco.cep}
- Telefone e WhatsApp: ${formatarTelefone(c.telefone)} (para atendimento mais rápido, a Dila prefere ligação)
- Instagram: ${NEGOCIO.instagramArroba}
- Retirada no endereço${c.aceita_entrega ? "; entrega em Pompéu mediante encomenda, com taxa de entrega" : ""}
${c.horario ? `- Horário: ${c.horario}\n` : ""}${c.formas_pagamento.length ? `- Pagamento: ${c.formas_pagamento.join(", ")}\n` : ""}`;
}

export async function llmsTxt() {
  const config = await getConfig();
  return `${cabecalho(config)}
## Páginas
- [Início e encomendas](${SITE_URL}/): produtos, assado ou congelado, monte o pedido e envie pelo WhatsApp
- [Como assar](${SITE_URL}/como-assar): forno e Air Fryer, direto do freezer
- [Perguntas frequentes](${SITE_URL}/perguntas-frequentes): encomendas, entrega, retirada e preparo
- [Novidades](${SITE_URL}/novidades): avisos e novidades da Dila

## Opcional
- [Versão completa para IAs](${SITE_URL}/llms-full.txt): produtos e perguntas em texto
`;
}

export async function llmsFullTxt() {
  const [config, cardapio, faq] = await Promise.all([getConfig(), getCardapio(), getFaq()]);
  let txt = cabecalho(config);
  txt += `\n## Produtos\n`;
  for (const c of cardapio.filter((c) => c.produtos.length)) {
    txt += `\n### ${c.nome}\n`;
    for (const p of c.produtos.filter((x) => x.disponivel)) {
      const opcoes = p.variacoes.length
        ? p.variacoes.map((v) => `${v.nome}${config.mostrar_precos && v.preco != null ? ` ${formatarPreco(v.preco)}` : ""}${v.nota ? ` (${v.nota})` : ""}`).join(" · ")
        : config.mostrar_precos ? formatarPreco(p.preco) : null;
      txt += `- ${p.nome}${p.descricao ? `: ${p.descricao}` : ""}${p.medida ? ` — ${p.medida}` : ""}${opcoes ? ` [${opcoes}]` : ""}${p.encomenda ? " — sob encomenda" : ""}\n`;
    }
  }
  txt += `\n## Perguntas frequentes\n`;
  for (const f of faq) txt += `\n### ${f.pergunta}\n${f.resposta}\n`;
  return txt;
}

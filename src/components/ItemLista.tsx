"use client";
import { useCarrinho } from "@/lib/carrinho";
import type { Produto } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";
import { Icone } from "./Icone";
import { Quantidade } from "./Quantidade";

/** Linha de produto sob encomenda (bolos, tarecos, pudim): um toque adiciona; depois vira + / −. */
export function ItemLista({ p, grupo, mostrarPreco }: { p: Produto; grupo: string; mostrarPreco: boolean }) {
  const { itens, adicionar, alterarQtd } = useCarrinho();
  const opcoes = p.variacoes.length ? p.variacoes : [{ nome: "", preco: p.preco, encomenda: p.encomenda }];
  return (
    <>
      {opcoes.map((o) => {
        const nome = o.nome ? `${p.nome} – ${o.nome}` : p.nome;
        const noPedido = itens.find((i) => i.produtoId === p.id && i.nome === nome && !i.obs);
        const preco = mostrarPreco ? o.preco : null;
        return (
          <li key={nome} className={`flex items-center gap-3 py-3 ${p.disponivel ? "" : "opacity-60"}`}>
            <span aria-hidden className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-terracota" />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold leading-snug text-cafe">{nome}</span>
              {(p.descricao || p.medida) && <span className="block text-sm text-muted">{[p.descricao, p.medida].filter(Boolean).join(" · ")}</span>}
              {preco != null && <span className="block text-sm font-bold text-terra">{formatarPreco(preco)}</span>}
            </span>
            {!p.disponivel ? (
              <span className="text-sm font-semibold text-muted">Indisponível</span>
            ) : noPedido ? (
              <Quantidade valor={noPedido.qtd} min={0} onChange={(n) => alterarQtd(noPedido.chave, n)} />
            ) : (
              <button type="button" onClick={() => adicionar({ produtoId: p.id, nome, grupo, encomenda: o.encomenda ?? p.encomenda, qtd: 1, precoUnit: o.preco, adicionais: [], obs: "" })}
                aria-label={`Adicionar ${nome} à encomenda`}
                className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-pill border-2 border-borda px-4 text-sm font-bold text-cafe hover:bg-creme">
                <Icone nome="encomenda" tamanho={18} />Adicionar
              </button>
            )}
          </li>
        );
      })}
    </>
  );
}

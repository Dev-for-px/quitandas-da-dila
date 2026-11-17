"use client";
import { useState } from "react";
import { useCarrinho } from "@/lib/carrinho";
import type { Produto } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";
import { fonteFoto } from "@/lib/foto";
import { Icone } from "./Icone";
import { Quantidade } from "./Quantidade";

const ehAssado = (nome: string) => /assad/i.test(nome);


/**
 * Cartão da Linha Mineira: a pessoa escolhe Congelado ou Assado (cada um com seu preço),
 * a foto troca, escolhe a quantidade e adiciona à encomenda.
 */
export function CartaoMineiro({ p, grupo, mostrarPreco }: { p: Produto; grupo: string; mostrarPreco: boolean }) {
  const { adicionar } = useCarrinho();
  const opcoes = p.variacoes.length ? p.variacoes : [{ nome: "", preco: p.preco, foto_url: p.foto_url, encomenda: p.encomenda }];
  const [escolha, setEscolha] = useState(0);
  const [qtd, setQtd] = useState(1);
  const atual = opcoes[escolha];
  const preco = mostrarPreco ? atual.preco : null;

  function confirmar() {
    adicionar({
      produtoId: p.id,
      nome: atual.nome ? `${p.nome} – ${atual.nome}` : p.nome,
      grupo,
      encomenda: atual.encomenda ?? p.encomenda,
      qtd,
      precoUnit: atual.preco,
      adicionais: [],
      obs: "",
    });
    setQtd(1);
  }

  return (
    <article className={`qd-cartao produto ${p.disponivel ? "" : "opacity-70"}`}>
      <div className="qd-cartao__foto">
        {opcoes.map((o, i) => {
          const url = o.foto_url || p.foto_url;
          if (!url) return null;
          const f = fonteFoto(url);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={f.src} srcSet={f.srcSet} sizes="(min-width: 760px) 520px, 100vw" width={480} height={360}
              alt={`${p.nome}${o.nome ? ` ${o.nome.toLowerCase()}` : ""} – Quitandas da Dila, Pompéu – MG`}
              loading="lazy" decoding="async" className={i === escolha ? "ativa" : undefined} aria-hidden={i !== escolha} />
          );
        })}
        {atual.nome && (ehAssado(atual.nome) ? (
          <span className="qd-selo qd-selo--pilula qd-selo--terracota"><Icone nome="forno" tamanho={16} />Assado por encomenda</span>
        ) : (
          <span className="qd-selo qd-selo--pilula qd-selo--cafe"><Icone nome="congelado" tamanho={16} />Pronta entrega</span>
        ))}
      </div>

      <div className="qd-cartao__corpo">
        <h3 className="qd-cartao__nome">{p.nome}</h3>
        {p.descricao && <p className="qd-cartao__descricao">{p.descricao}</p>}

        {opcoes.length > 1 && (
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-cafe">Como você quer?</legend>
            <div className="grid grid-cols-2 gap-2">
              {opcoes.map((o, i) => (
                <label key={o.nome} className="flex min-h-[64px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-linha bg-papel px-2 py-2 text-center has-[:checked]:border-cafe has-[:checked]:bg-cafe has-[:checked]:text-leite has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-terra">
                  <input type="radio" name={`opcao-${p.id}`} className="sr-only" checked={i === escolha} onChange={() => setEscolha(i)} />
                  <span className="flex items-center gap-1.5 text-[15px] font-bold">
                    <Icone nome={ehAssado(o.nome) ? "forno" : "congelado"} tamanho={18} />{o.nome}
                  </span>
                  {mostrarPreco && o.preco != null && <span className="text-sm font-semibold">{formatarPreco(o.preco)}</span>}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {atual.nota && (
          <p className="flex items-center gap-2 text-sm font-semibold text-cafe">
            <Icone nome={ehAssado(atual.nome) ? "encomenda" : "air-fryer"} tamanho={18} className="text-terra" />{atual.nota}
          </p>
        )}
        {p.medida && <p className="qd-cartao__detalhe">{p.medida}</p>}

        {p.disponivel ? (
          <div className="mt-auto flex items-center gap-3 pt-1">
            <Quantidade valor={qtd} onChange={setQtd} />
            <button type="button" onClick={confirmar} className="qd-botao qd-botao--primario flex-1 px-3">
              <span>Adicionar{preco != null ? ` · ${formatarPreco(preco * qtd)}` : ""}</span>
            </button>
          </div>
        ) : (
          <p className="mt-auto rounded-pill bg-papel px-4 py-3 text-center font-semibold text-muted">Indisponível no momento</p>
        )}
      </div>
    </article>
  );
}

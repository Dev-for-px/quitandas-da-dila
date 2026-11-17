"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import { precoItem, useCarrinho } from "@/lib/carrinho";
import { montarMensagem, quando, type DadosCliente } from "@/lib/mensagem";
import { ENDERECO_LINHA, formatarPreco, linkLigar, linkWhatsApp } from "@/lib/site";
import { registrar } from "@/lib/rastreio";
import { Icone } from "./Icone";
import { Quantidade } from "./Quantidade";

const CHAVE_CLIENTE = "dila:cliente";
const VAZIO: DadosCliente = { nome: "", tipo: "retirada", data: "", hora: "", endereco: "", referencia: "", pagamento: "", troco: "", obs: "" };

function hojeSP() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function Checkout({ formasPagamento }: { formasPagamento: string[] }) {
  const c = useCarrinho();
  const [dados, setDados] = useState<DadosCliente>(VAZIO);
  const [tentou, setTentou] = useState(false);
  const [hoje, setHoje] = useState("");

  useEffect(() => {
    // Lembra nome e endereço do cliente neste aparelho.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHoje(hojeSP());
    try {
      const salvo = localStorage.getItem(CHAVE_CLIENTE);
      if (salvo) {
        const s = JSON.parse(salvo);
        setDados({ ...VAZIO, nome: s.nome ?? "", endereco: s.endereco ?? "", referencia: s.referencia ?? "", pagamento: s.pagamento ?? "" });
      }
    } catch {}
  }, []);

  const set = <K extends keyof DadosCliente>(k: K, v: DadosCliente[K]) => setDados((d) => ({ ...d, [k]: v }));
  const entrega = c.config.aceitaEntrega && dados.tipo === "entrega";
  // Assado, bolos e entrega são sempre por encomenda: precisa do dia e do horário.
  const precisaHorario = c.temEncomenda || entrega;
  const faltaNome = !dados.nome.trim();
  const faltaEndereco = entrega && !dados.endereco.trim();
  const faltaData = precisaHorario && !dados.data;
  const faltaHora = precisaHorario && !dados.hora;
  const taxa = entrega ? c.config.taxaEntrega : null;
  const total = c.subtotal != null ? c.subtotal + (taxa ?? 0) : null;
  const abaixoMinimo = entrega && c.config.mostrarPrecos && c.config.pedidoMinimo != null && c.subtotal != null && c.subtotal < c.config.pedidoMinimo;

  function enviar() {
    setTentou(true);
    if (faltaNome || faltaEndereco || faltaData || faltaHora || c.config.pausado) {
      setTimeout(() => document.querySelector("[data-erro]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    const texto = montarMensagem(c.itens, { ...dados, tipo: entrega ? "entrega" : "retirada" }, c.config.mostrarPrecos, c.config.taxaEntrega);
    try {
      localStorage.setItem(CHAVE_CLIENTE, JSON.stringify({ nome: dados.nome, endereco: dados.endereco, referencia: dados.referencia, pagamento: dados.pagamento }));
    } catch {}
    registrar("enviar_pedido", `${c.totalItens} itens · ${entrega ? "entrega" : "retirada"}`);
    c.salvarUltimo();
    const url = linkWhatsApp(texto, c.config.whatsapp);
    const aba = window.open(url, "_blank");
    if (aba) aba.opener = null;
    else window.location.assign(url);
  }

  if (c.itens.length === 0) {
    return (
      <div className="rounded-md border border-linha bg-creme p-6 text-center">
        <p className="font-serif text-2xl font-bold text-cafe">Sua encomenda está vazia</p>
        <p className="mt-2 text-muted">Escolha o pão de queijo, o biscoito ou um bolo e toque em Adicionar.</p>
        <div className="mt-5 flex flex-col items-center gap-3">
          <Link href="/#linha-mineira" className="qd-botao qd-botao--primario">Ver as quitandas</Link>
          {c.ultimoPedido.length > 0 && (
            <button type="button" onClick={c.repetirUltimo} className="qd-botao qd-botao--secundario">
              <History size={20} aria-hidden />Repetir a última encomenda
            </button>
          )}
          <p className="mt-2 text-sm text-muted">Prefere falar direto? <a href={linkLigar(c.config.telefone)} className="font-bold text-terra underline">Ligue para a Dila</a>.</p>
        </div>
      </div>
    );
  }

  const campo = "mt-1 w-full rounded-md border border-linha bg-papel p-3 text-base text-ink outline-none focus:border-terra";
  const erro = (msg: string) => <span data-erro className="mt-1 block text-sm font-bold text-alerta">{msg}</span>;
  const pilula = (ativo: boolean) => `min-h-12 rounded-pill border-2 px-3 py-2.5 font-bold ${ativo ? "border-cafe bg-cafe text-leite" : "border-linha bg-papel text-cafe"}`;

  return (
    <div className="space-y-8 pb-48">
      {/* Itens */}
      <section aria-labelledby="t-itens">
        <h2 id="t-itens" className="text-2xl font-bold">Itens</h2>
        <ul className="mt-3 divide-y divide-linha rounded-md border border-linha bg-papel">
          {c.itens.map((i) => {
            const valor = c.config.mostrarPrecos ? precoItem(i) : null;
            return (
              <li key={i.chave} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-cafe">{i.nome}</p>
                    <p className="text-xs text-muted">{i.grupo}{i.encomenda ? " · por encomenda" : " · pronta entrega"}</p>
                  </div>
                  <button type="button" onClick={() => c.remover(i.chave)} aria-label={`Remover ${i.nome}`} className="rounded-pill p-2 text-muted hover:text-alerta"><Trash2 size={20} /></button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Quantidade valor={i.qtd} onChange={(n) => c.alterarQtd(i.chave, n)} />
                  <span className="font-bold text-terra">{valor != null ? formatarPreco(valor) : "a confirmar"}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center justify-between">
          <Link href="/#linha-mineira" className="font-bold text-terra underline">+ Adicionar mais</Link>
          <button type="button" onClick={c.limpar} className="text-sm text-muted underline">Limpar</button>
        </div>
      </section>

      {/* Como receber */}
      <section aria-labelledby="t-receber" className="space-y-4">
        <h2 id="t-receber" className="text-2xl font-bold">Como você quer receber?</h2>
        {c.config.aceitaEntrega ? (
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Retirada ou entrega">
            <button type="button" aria-pressed={!entrega} onClick={() => set("tipo", "retirada")} className={pilula(!entrega)}>
              <span className="flex items-center justify-center gap-2"><Icone nome="retirada" />Retirar</span>
            </button>
            <button type="button" aria-pressed={entrega} onClick={() => set("tipo", "entrega")} className={pilula(entrega)}>
              <span className="flex items-center justify-center gap-2"><Icone nome="local" />Entrega</span>
            </button>
          </div>
        ) : null}
        {entrega ? (
          <>
            <p className="rounded-md bg-creme p-3 text-sm text-cafe">
              Entrega em Pompéu <b>por encomenda</b>.{" "}
              {c.config.mostrarPrecos && c.config.taxaEntrega != null ? <>Taxa de entrega: <b>{formatarPreco(c.config.taxaEntrega)}</b>.</> : <>A taxa de entrega é confirmada pela Dila.</>}
            </p>
            <label className="block">
              <span className="font-bold">Endereço (rua, número e bairro)</span>
              <input value={dados.endereco} onChange={(e) => set("endereco", e.target.value)} autoComplete="street-address" className={campo} />
              {tentou && faltaEndereco && erro("Digite o endereço da entrega")}
            </label>
            <label className="block">
              <span className="font-bold">Ponto de referência <span className="font-normal text-muted">(opcional)</span></span>
              <input value={dados.referencia} onChange={(e) => set("referencia", e.target.value)} className={campo} />
            </label>
          </>
        ) : (
          <p className="flex gap-2 rounded-md bg-creme p-3 text-sm text-cafe"><Icone nome="local" className="mt-0.5 text-terra" /><span>Retirada na <b>{ENDERECO_LINHA}</b>.</span></p>
        )}

        <fieldset>
          <legend className="font-bold">
            {precisaHorario ? (entrega ? "Para quando é a entrega?" : "Para quando é a encomenda?") : <>Quando você vem buscar? <span className="font-normal text-muted">(opcional)</span></>}
          </legend>
          {precisaHorario && <p className="text-sm text-muted">{c.temEncomenda ? "Assado e bolos são feitos por encomenda: marque o dia e o horário." : "Entrega é por encomenda: marque o dia e o horário."}</p>}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold">Dia</span>
              <input type="date" min={hoje || undefined} value={dados.data} onChange={(e) => set("data", e.target.value)} className={campo} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Horário</span>
              <input type="time" value={dados.hora} onChange={(e) => set("hora", e.target.value)} className={campo} />
            </label>
          </div>
          {tentou && (faltaData || faltaHora) && erro("Escolha o dia e o horário")}
        </fieldset>
      </section>

      {/* Seus dados */}
      <section aria-labelledby="t-dados" className="space-y-4">
        <h2 id="t-dados" className="text-2xl font-bold">Seus dados</h2>
        <label className="block">
          <span className="font-bold">Seu nome</span>
          <input value={dados.nome} onChange={(e) => set("nome", e.target.value)} autoComplete="name" className={campo} />
          {tentou && faltaNome && erro("Digite seu nome")}
        </label>
        {formasPagamento.length > 0 && (
          <fieldset>
            <legend className="font-bold">Forma de pagamento <span className="font-normal text-muted">(opcional)</span></legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {formasPagamento.map((f) => (
                <button key={f} type="button" aria-pressed={dados.pagamento === f} onClick={() => set("pagamento", dados.pagamento === f ? "" : f)} className={`${pilula(dados.pagamento === f)} px-4 text-sm`}>{f}</button>
              ))}
            </div>
          </fieldset>
        )}
        {dados.pagamento === "Dinheiro" && (
          <label className="block">
            <span className="font-bold">Troco para quanto? <span className="font-normal text-muted">(opcional)</span></span>
            <input value={dados.troco} onChange={(e) => set("troco", e.target.value)} inputMode="decimal" placeholder="Ex.: 100" className={campo} />
          </label>
        )}
        <label className="block">
          <span className="font-bold">Observação <span className="font-normal text-muted">(opcional)</span></span>
          <textarea value={dados.obs} onChange={(e) => set("obs", e.target.value)} rows={2} placeholder="Ex.: quero bem douradinho" className={campo} />
        </label>
      </section>

      {/* Envio fixo no rodapé */}
      <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-linha bg-papel px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(90,56,37,0.08)]">
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted">
              {c.totalItens} {c.totalItens === 1 ? "item" : "itens"}
              {entrega ? ` · entrega${c.config.mostrarPrecos && taxa != null ? ` ${formatarPreco(taxa)}` : " (taxa a confirmar)"}` : " · retirada"}
              {quando(dados) ? ` · ${quando(dados)}` : ""}
            </span>
            <span className="shrink-0 text-base font-bold text-cafe">
              {c.config.mostrarPrecos && total != null ? `${formatarPreco(total)}${c.temSemPreco || (entrega && taxa == null) ? " + a confirmar" : ""}` : "Valor a confirmar"}
            </span>
          </div>
          {c.config.pausado ? (
            <p className="rounded-pill bg-cafe px-5 py-3.5 text-center font-bold text-leite">Encomendas pausadas no momento</p>
          ) : (
            <div className="grid gap-1">
              <button type="button" onClick={enviar} className="qd-botao qd-botao--whatsapp qd-botao--lg w-full">
                <Icone nome="whatsapp" tamanho={22} /><span>Enviar no WhatsApp</span>
              </button>
              <a href={linkLigar(c.config.telefone)} className="inline-flex min-h-11 items-center justify-center gap-2 text-[15px] font-bold text-terra underline underline-offset-4" data-evento="ligar" data-rotulo="Pedido: prefiro ligar">
                <Icone nome="telefone" tamanho={18} /><span>Prefiro ligar para a Dila</span>
              </a>
            </div>
          )}
          {abaixoMinimo && <p className="mt-2 text-center text-xs text-muted">Pedido mínimo para entrega: {formatarPreco(c.config.pedidoMinimo)}</p>}
        </div>
      </div>
    </div>
  );
}

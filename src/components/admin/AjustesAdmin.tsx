"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { useSessao } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { SAIDA_PADRAO, type Saida } from "@/lib/saida";
import { REDES, type Redes } from "@/lib/redes";
import { Ajuda, AreaTexto, Aviso, Botao, Campo, campoCls, Chave, Explica, Titulo, traduzirErro } from "./ui";

type Faq = { id?: string; pergunta: string; resposta: string; ordem: number; ativo: boolean };
const real = (n: number | null) => (n == null ? "" : Number(n).toFixed(2).replace(".", ","));
const numero = (s: string) => {
  const v = Number(s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
};
const SUGESTOES_PAGAMENTO = ["Pix", "Dinheiro", "Cartão de débito", "Cartão de crédito"];

export function AjustesAdmin() {
  const { pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [f, setF] = useState({ whatsapp: "", telefone: "", taxa: "", minimo: "", horario: "", historia: "", mostrar_precos: true, pedidos_pausados: false, aceita_entrega: true });
  const [pagamentos, setPagamentos] = useState<string[]>([]);
  const [novoPag, setNovoPag] = useState("");
  const [faq, setFaq] = useState<Faq[]>([]);
  const [redes, setRedes] = useState<Redes>({});
  const [saida, setSaida] = useState<Saida>(SAIDA_PADRAO);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; txt: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const [{ data: c }, { data: q }] = await Promise.all([
      supabase.from("configuracoes").select("*").eq("id", 1).single(),
      supabase.from("faq").select("id,pergunta,resposta,ordem,ativo").order("ordem"),
    ]);
    if (c) {
      setRedes(c.redes ?? {});
      setSaida({ ...SAIDA_PADRAO, ...(c.saida ?? {}) });
      setPagamentos(c.formas_pagamento ?? []);
      setF({ whatsapp: c.whatsapp, telefone: c.telefone, taxa: real(c.taxa_entrega), minimo: real(c.pedido_minimo), horario: c.horario ?? "", historia: c.historia ?? "", mostrar_precos: c.mostrar_precos, pedidos_pausados: c.pedidos_pausados, aceita_entrega: c.aceita_entrega });
    }
    setFaq((q as Faq[]) ?? []);
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  if (!pode("dono", "gerente")) return <p className="text-muted">Sem acesso a esta página.</p>;

  async function salvar() {
    setSalvando(true);
    setMsg(null);
    const { error } = await supabase.from("configuracoes").update({
      whatsapp: f.whatsapp.replace(/\D/g, "").replace(/^(?!55)/, "55"),
      telefone: f.telefone.replace(/\D/g, "").replace(/^(?!55)/, "55"),
      aceita_entrega: f.aceita_entrega,
      taxa_entrega: numero(f.taxa),
      pedido_minimo: numero(f.minimo),
      horario: f.horario.trim() || null,
      formas_pagamento: pagamentos,
      historia: f.historia.trim() || null,
      redes: Object.fromEntries(Object.entries(redes).map(([k, v]) => [k, (v ?? "").trim()]).filter(([, v]) => v)),
      saida,
      mostrar_precos: f.mostrar_precos,
      pedidos_pausados: f.pedidos_pausados,
      atualizado_em: new Date().toISOString(),
    }).eq("id", 1);
    if (error) { setSalvando(false); return setMsg({ tipo: "erro", txt: traduzirErro(error.message) }); }

    for (const [i, q] of faq.entries()) {
      if (!q.pergunta.trim()) continue;
      const linha = { pergunta: q.pergunta.trim(), resposta: q.resposta.trim(), ordem: (i + 1) * 10, ativo: q.ativo };
      const r = q.id ? await supabase.from("faq").update(linha).eq("id", q.id) : await supabase.from("faq").insert(linha);
      if (r.error) { setSalvando(false); return setMsg({ tipo: "erro", txt: traduzirErro(r.error.message) }); }
    }
    await atualizarSite(["config", "faq"]);
    setSalvando(false);
    setMsg({ tipo: "ok", txt: "Tudo salvo e já atualizado no site." });
    carregar();
  }

  async function apagarFaq(i: number) {
    const q = faq[i];
    if (q.id && !window.confirm("Apagar esta pergunta?")) return;
    if (q.id) await supabase.from("faq").delete().eq("id", q.id);
    setFaq((x) => x.filter((_, j) => j !== i));
    await atualizarSite(["faq"]);
  }

  const addPag = (nome: string) => { const n = nome.trim(); if (n && !pagamentos.includes(n)) setPagamentos((x) => [...x, n]); setNovoPag(""); };
  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));
  return (
    <>
      <Titulo sub="Informações que aparecem no site e na encomenda.">Ajustes</Titulo>
      <Ajuda passos={[
        <>Mude o que precisar nas seções abaixo: entrega, contato, horário, pagamento, redes, aviso “Já vai?”, história e perguntas.</>,
        <>No final, toque em <b>Salvar ajustes</b>. Só salva depois desse botão.</>,
      ]} dicas={[
        <><b>Taxa de entrega</b>: aparece na encomenda e soma no total. Em branco, o cliente vê “taxa a confirmar”.</>,
        <><b>Horário</b>: escreva do jeito que fala. Ex.: “Segunda a sábado, das 7h às 18h”. Em branco, não aparece no site.</>,
        <><b>Perguntas frequentes</b>: responda completo, com “Quitandas da Dila” e “Pompéu”. É assim que o Google e o ChatGPT indicam a Dila.</>,
      ]} />
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Encomendas e entrega</h2>
          <Chave ligado={!f.pedidos_pausados} onChange={(v) => set("pedidos_pausados", !v)} rotulo={f.pedidos_pausados ? "Encomendas pausadas" : "Recebendo encomendas"} />
          <Chave ligado={f.mostrar_precos} onChange={(v) => set("mostrar_precos", v)} rotulo={f.mostrar_precos ? "Preços aparecendo no site" : "Todos os preços escondidos"} descricao="Os preços de cada produto ficam em Produtos e preços." />
          <Chave ligado={f.aceita_entrega} onChange={(v) => set("aceita_entrega", v)} rotulo={f.aceita_entrega ? "Fazendo entrega (por encomenda)" : "Só retirada"} />
          {f.aceita_entrega && (
            <>
              <Campo rotulo="Taxa de entrega (R$)" dica="Soma no total da encomenda. Em branco = “taxa a confirmar”." inputMode="decimal" value={f.taxa} onChange={(e) => set("taxa", e.target.value)} placeholder="Ex.: 5,00" />
              <Campo rotulo="Pedido mínimo para entrega (R$)" dica="Opcional." inputMode="decimal" value={f.minimo} onChange={(e) => set("minimo", e.target.value)} />
            </>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Contato e horário</h2>
          <Campo rotulo="WhatsApp que recebe as encomendas" inputMode="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          <Campo rotulo="Telefone para ligação" dica="A Dila prefere ligação: é o botão principal do site." inputMode="tel" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} />
          <Campo rotulo="Horário de atendimento" dica="Opcional. Em branco, não aparece no site." value={f.horario} onChange={(e) => set("horario", e.target.value)} placeholder="Ex.: Segunda a sábado, das 7h às 18h" />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Formas de pagamento</h2>
          <Explica>Aparecem como opção na encomenda. Sem nenhuma, o site não pergunta.</Explica>
          <ul className="flex flex-wrap gap-2">
            {pagamentos.map((p) => (
              <li key={p} className="inline-flex items-center gap-1 rounded-pill bg-cafe py-2 pl-4 pr-2 text-sm font-semibold text-leite">
                {p}<button type="button" aria-label={`Tirar ${p}`} onClick={() => setPagamentos((x) => x.filter((y) => y !== p))} className="rounded-pill p-1"><X size={16} /></button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES_PAGAMENTO.filter((s) => !pagamentos.includes(s)).map((s) => (
              <button key={s} type="button" onClick={() => addPag(s)} className="rounded-pill border border-linha px-3 py-2 text-sm font-semibold text-cafe">+ {s}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={novoPag} onChange={(e) => setNovoPag(e.target.value)} placeholder="Outra forma" aria-label="Outra forma de pagamento" className={`${campoCls} mt-0 flex-1`} />
            <Botao variante="secundario" onClick={() => addPag(novoPag)}>Adicionar</Botao>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Redes sociais</h2>
          <p className="text-sm text-muted">Cole o link completo (começando com https://). Só aparecem no rodapé as que tiverem link.</p>
          {REDES.map((r) => (
            <Campo key={r.chave} rotulo={r.nome} value={redes[r.chave] ?? ""} onChange={(e) => setRedes((x) => ({ ...x, [r.chave]: e.target.value }))} placeholder="https://…" inputMode="url" autoCapitalize="none" />
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Aviso “Já vai?”</h2>
          <p className="text-sm text-muted">Aparece uma vez por visita quando a pessoa está saindo do site.</p>
          <Chave ligado={saida.ativo} onChange={(v) => setSaida((x) => ({ ...x, ativo: v }))} rotulo={saida.ativo ? "Aviso ligado" : "Aviso desligado"} />
          <Campo rotulo="Título" value={saida.titulo} onChange={(e) => setSaida((x) => ({ ...x, titulo: e.target.value }))} />
          <AreaTexto rotulo="Texto" rows={2} value={saida.texto} onChange={(e) => setSaida((x) => ({ ...x, texto: e.target.value }))} />
          <label className="block">
            <span className="font-semibold">O botão leva para</span>
            <select value={saida.botao} onChange={(e) => setSaida((x) => ({ ...x, botao: e.target.value as Saida["botao"] }))} className={campoCls}>
              <option value="ligar">Ligação</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="produtos">Produtos do site</option>
            </select>
          </label>
          <Campo rotulo="Texto do botão" value={saida.textoBotao} onChange={(e) => setSaida((x) => ({ ...x, textoBotao: e.target.value }))} />
        </section>

        <section>
          <h2 className="text-xl font-semibold">História da Dila</h2>
          <AreaTexto rotulo="Texto curto que aparece na página inicial" dica="Opcional." rows={4} value={f.historia} onChange={(e) => set("historia", e.target.value)} />
        </section>

        <section>
          <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
          <p className="text-sm text-muted">Ajudam o Google e o ChatGPT a responder sobre a Dila. Escreva como o cliente pergunta.</p>
          <ul className="mt-3 space-y-3">
            {faq.map((q, i) => (
              <li key={q.id ?? `novo-${i}`} className="space-y-2 rounded-md border border-linha bg-papel p-3">
                <Campo rotulo="Pergunta" value={q.pergunta} onChange={(e) => setFaq((x) => x.map((y, j) => (j === i ? { ...y, pergunta: e.target.value } : y)))} />
                <AreaTexto rotulo="Resposta" rows={3} value={q.resposta} onChange={(e) => setFaq((x) => x.map((y, j) => (j === i ? { ...y, resposta: e.target.value } : y)))} />
                <button type="button" onClick={() => apagarFaq(i)} className="inline-flex items-center gap-1 text-sm text-alerta"><Trash2 size={16} />Apagar</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setFaq((x) => [...x, { pergunta: "", resposta: "", ordem: 999, ativo: true }])} className="mt-3 inline-flex items-center gap-1 font-semibold text-terra"><Plus size={18} />Nova pergunta</button>
        </section>
      </div>

      <div className="sticky bottom-20 mt-8 space-y-3 md:bottom-4">
        {msg && <Aviso tipo={msg.tipo}>{msg.txt}</Aviso>}
        <Botao className="w-full" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar ajustes"}</Botao>
      </div>
    </>
  );
}

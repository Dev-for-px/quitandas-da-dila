"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { Sheet } from "@/components/Sheet";
import { prepararFoto, slugificar } from "@/lib/admin/fotos";
import { useSessao } from "@/lib/admin/sessao";
import type { Categoria, Produto, Variacao } from "@/lib/dados";
import { formatarPreco } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { Ajuda, AreaTexto, Aviso, Botao, Campo, campoCls, Chave, Explica, Titulo, traduzirErro } from "./ui";

type Editavel = Pick<Produto, "nome" | "descricao" | "medida" | "preco" | "variacoes" | "foto_url" | "encomenda" | "disponivel"> & { id?: string; categoria_id: string };
type Opcao = { nome: string; preco: string; nota: string; foto_url: string | null; encomenda: boolean };

const real = (n: number | null | undefined) => (n == null ? "" : Number(n).toFixed(2).replace(".", ","));
const numero = (s: string) => {
  const v = Number(s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? null : v;
};
const resumoPreco = (p: Produto) =>
  p.variacoes.length
    ? p.variacoes.map((v) => `${v.nome}: ${formatarPreco(v.preco) ?? "a confirmar"}`).join(" · ")
    : formatarPreco(p.preco) ?? "Preço a confirmar";

async function subirFoto(supabase: ReturnType<typeof createClient>, arquivo: File, nome: string) {
  const blob = await prepararFoto(arquivo, 1200, false);
  const caminho = `produtos/${slugificar(nome || "produto")}-${Date.now()}.webp`;
  const { error } = await supabase.storage.from("fotos").upload(caminho, blob, { contentType: "image/webp", upsert: false });
  if (error) throw error;
  return supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

export function ProdutosAdmin() {
  const { pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [prods, setProds] = useState<Produto[]>([]);
  const [aberta, setAberta] = useState<string | null>(null);
  const [editando, setEditando] = useState<Editavel | null>(null);
  const [novaCat, setNovaCat] = useState("");
  const podeEditar = pode("dono", "gerente");

  const carregar = useCallback(async () => {
    const [c, p] = await Promise.all([
      supabase.from("categorias").select("id,nome,slug,descricao,estilo,ordem").eq("ativo", true).order("ordem"),
      supabase.from("produtos").select("*").order("ordem"),
    ]);
    const lista = (c.data as Categoria[]) ?? [];
    setCats(lista);
    setAberta((a) => a ?? lista[0]?.id ?? null);
    setProds(((p.data as Produto[]) ?? []).map((x) => ({ ...x, variacoes: x.variacoes ?? [] })));
  }, [supabase]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function alternar(p: Produto) {
    setProds((x) => x.map((i) => (i.id === p.id ? { ...i, disponivel: !p.disponivel } : i)));
    await supabase.from("produtos").update({ disponivel: !p.disponivel }).eq("id", p.id);
    await atualizarSite(["cardapio"]);
  }

  async function criarCategoria() {
    const nome = novaCat.trim();
    if (!nome) return;
    await supabase.from("categorias").insert({ nome, slug: `${slugificar(nome)}-${Date.now().toString(36).slice(-4)}`, descricao: "Sob encomenda.", estilo: "lista", ordem: (cats.at(-1)?.ordem ?? 0) + 10 });
    setNovaCat("");
    await atualizarSite(["cardapio"]);
    carregar();
  }

  const novo = (categoria_id: string, destaque: boolean): Editavel => ({
    categoria_id, nome: "", descricao: "", medida: destaque ? "Bandeja com 20 unidades · aprox. 1 kg" : "", preco: null, foto_url: null, disponivel: true,
    encomenda: !destaque,
    variacoes: destaque ? [
      { nome: "Congelado", preco: null, nota: "Pronta entrega todo dia · forno ou Air Fryer", foto_url: null, encomenda: false },
      { nome: "Assado", preco: null, nota: "Por encomenda · é só marcar o horário", foto_url: null, encomenda: true },
    ] : [],
  });

  return (
    <>
      <Titulo sub={podeEditar ? "Toque no lápis para mudar preço, foto e descrição. O interruptor tira o produto do site na hora." : "Acabou algum produto? Desligue aqui que ele aparece como indisponível."}>Produtos e preços</Titulo>
      <Ajuda passos={podeEditar ? [
        <>Toque no nome do grupo (ex.: <b>Linha Mineira</b>) para ver os produtos.</>,
        <>Toque no <b>lápis</b> do produto. No pão de queijo e no biscoito você coloca <b>um preço para o Congelado</b> e <b>outro para o Assado</b>. No site, quando o cliente escolhe Assado, o valor muda sozinho.</>,
        <>Toque em <b>Salvar</b>. Pronto: já está no site.</>,
        <>O <b>interruptor verde</b> mostra o produto. Desligado, ele aparece como “Indisponível”.</>,
      ] : [
        <>Acabou algum produto? <b>Desligue o interruptor</b>. Voltou a ter? Ligue de novo.</>,
      ]} dicas={podeEditar ? [
        "Preço em branco aparece para o cliente como “a confirmar”: você combina na hora.",
        "Só por hoje? Use o interruptor. A lixeira apaga o produto para sempre.",
      ] : undefined} aberta />
      <div className="space-y-3">
        {cats.map((c) => {
          const lista = prods.filter((p) => p.categoria_id === c.id);
          const expandida = aberta === c.id;
          const desligados = lista.filter((p) => !p.disponivel).length;
          return (
            <section key={c.id} className="rounded-md border border-linha bg-papel">
              <button type="button" onClick={() => setAberta(expandida ? null : c.id)} aria-expanded={expandida} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                <span>
                  <span className="font-serif text-lg font-semibold">{c.nome}</span>
                  <span className="block text-sm text-muted">{lista.length} produto(s){desligados ? ` · ${desligados} desligado(s)` : ""}{c.estilo === "destaque" ? " · cartão grande com foto" : " · lista sob encomenda"}</span>
                </span>
                <ChevronDown size={22} className={`text-muted transition ${expandida ? "rotate-180" : ""}`} />
              </button>
              {expandida && (
                <ul className="divide-y divide-linha border-t border-linha">
                  {lista.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <span className={`min-w-0 flex-1 ${p.disponivel ? "" : "text-muted"}`}>
                        <span className={`block font-semibold ${p.disponivel ? "" : "line-through"}`}>{p.nome}</span>
                        <span className="block text-sm text-muted">{resumoPreco(p)}</span>
                      </span>
                      {podeEditar && (
                        <button type="button" aria-label={`Editar ${p.nome}`} onClick={() => setEditando({ ...p })} className="rounded-pill p-2 text-terra hover:bg-creme"><Pencil size={20} /></button>
                      )}
                      <button type="button" role="switch" aria-checked={p.disponivel} aria-label={`${p.nome} ${p.disponivel ? "disponível" : "indisponível"}`} onClick={() => alternar(p)}
                        className={`relative h-8 w-14 shrink-0 rounded-pill transition ${p.disponivel ? "bg-zap" : "bg-linha"}`}>
                        <span className={`absolute top-1 h-6 w-6 rounded-pill bg-papel transition-all ${p.disponivel ? "left-7" : "left-1"}`} />
                      </button>
                    </li>
                  ))}
                  {podeEditar && (
                    <li className="p-3">
                      <button type="button" onClick={() => setEditando(novo(c.id, c.estilo === "destaque"))} className="inline-flex items-center gap-1 font-semibold text-terra"><Plus size={18} />Novo produto em {c.nome}</button>
                    </li>
                  )}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      {podeEditar && (
        <div className="mt-6 flex gap-2">
          <input value={novaCat} onChange={(e) => setNovaCat(e.target.value)} placeholder="Novo grupo (ex.: Doces de festa)" aria-label="Nome do novo grupo" className={`${campoCls} mt-0 flex-1`} />
          <Botao variante="secundario" onClick={criarCategoria}><Plus size={18} />Criar</Botao>
        </div>
      )}
      {editando && <EditorProduto inicial={editando} categorias={cats} onFechar={() => setEditando(null)} onSalvo={() => { setEditando(null); carregar(); }} />}
    </>
  );
}

function EditorProduto({ inicial, categorias, onFechar, onSalvo }: { inicial: Editavel; categorias: Categoria[]; onFechar: () => void; onSalvo: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [p, setP] = useState<Editavel>(inicial);
  const [precoTxt, setPrecoTxt] = useState(real(inicial.preco));
  const [ops, setOps] = useState<Opcao[]>(inicial.variacoes.map((v) => ({ nome: v.nome, preco: real(v.preco), nota: v.nota ?? "", foto_url: v.foto_url ?? null, encomenda: !!v.encomenda })));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const set = <K extends keyof Editavel>(k: K, v: Editavel[K]) => setP((x) => ({ ...x, [k]: v }));
  const setOp = (i: number, campo: Partial<Opcao>) => setOps((x) => x.map((y, j) => (j === i ? { ...y, ...campo } : y)));

  async function enviarFoto(arquivo: File | undefined, alvo: number | "principal") {
    if (!arquivo) return;
    setErro(null);
    try {
      const url = await subirFoto(supabase, arquivo, p.nome);
      if (alvo === "principal") set("foto_url", url);
      else setOp(alvo, { foto_url: url });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar a foto");
    }
  }

  async function salvar() {
    if (!p.nome.trim()) return setErro("Dê um nome para o produto.");
    setSalvando(true);
    setErro(null);
    const variacoes: Variacao[] = ops.filter((o) => o.nome.trim()).map((o) => ({ nome: o.nome.trim(), preco: numero(o.preco), nota: o.nota.trim() || null, foto_url: o.foto_url, encomenda: o.encomenda }));
    const nome = p.nome.trim();
    const dados = {
      categoria_id: p.categoria_id,
      nome,
      descricao: p.descricao?.trim() || null,
      medida: p.medida?.trim() || null,
      preco: variacoes.length ? null : numero(precoTxt),
      variacoes,
      foto_url: p.foto_url ?? variacoes.find((v) => v.foto_url)?.foto_url ?? null,
      foto_alt: `${nome} – Quitandas da Dila, Pompéu – MG`,
      encomenda: variacoes.length ? variacoes.every((v) => v.encomenda) : p.encomenda,
      disponivel: p.disponivel,
      atualizado_em: new Date().toISOString(),
    };
    const { error } = p.id
      ? await supabase.from("produtos").update(dados).eq("id", p.id)
      : await supabase.from("produtos").insert({ ...dados, slug: `${slugificar(nome)}-${Date.now().toString(36).slice(-4)}`, ordem: 9999 });
    setSalvando(false);
    if (error) return setErro(traduzirErro(error.message));
    await atualizarSite(["cardapio"]);
    onSalvo();
  }

  async function excluir() {
    if (!p.id || !window.confirm(`Apagar “${p.nome}” do site? Isso não tem volta. Se for só por hoje, use o interruptor.`)) return;
    const { error } = await supabase.from("produtos").delete().eq("id", p.id);
    if (error) return setErro(traduzirErro(error.message));
    await atualizarSite(["cardapio"]);
    onSalvo();
  }

  const fotoMini = (url: string | null, rotulo: string, alvo: number | "principal") => (
    <div className="flex items-center gap-3">
      {url ? <Image src={url} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-md object-cover" unoptimized={url.startsWith("/")} /> : <div className="flex h-[72px] w-[72px] items-center justify-center rounded-md bg-creme text-muted"><ImagePlus size={24} /></div>}
      <div className="flex flex-col gap-1">
        <label className="cursor-pointer rounded-pill border border-linha px-4 py-2 text-center text-sm font-semibold">
          {url ? `Trocar ${rotulo}` : `Escolher ${rotulo}`}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => enviarFoto(e.target.files?.[0], alvo)} />
        </label>
        {url && <button type="button" onClick={() => (alvo === "principal" ? set("foto_url", null) : setOp(alvo, { foto_url: null }))} className="text-left text-sm text-alerta underline">Tirar foto</button>}
      </div>
    </div>
  );

  return (
    <Sheet aberto titulo={p.id ? "Editar produto" : "Novo produto"} onFechar={onFechar}
      rodape={<div className="flex gap-3">{p.id && <Botao variante="perigo" onClick={excluir} aria-label="Apagar produto"><Trash2 size={20} /></Botao>}<Botao className="flex-1" disabled={salvando} onClick={salvar}>{salvando ? "Salvando…" : "Salvar"}</Botao></div>}>
      <div className="space-y-5">
        <Campo rotulo="Nome" value={p.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex.: Pão de Queijo, Bolo de Milho" />

        {/* Preços: o mais importante fica no topo */}
        <div>
          <span className="font-semibold">Opções e preços</span>
          <Explica>Ex.: <b>Congelado</b> R$ 39,99 e <b>Assado</b> R$ 49,99. No site o cliente escolhe e o valor muda. Sem opções? Use o preço único logo abaixo.</Explica>
          <ul className="mt-2 space-y-3">
            {ops.map((o, i) => (
              <li key={i} className="space-y-2 rounded-md border border-linha bg-creme/50 p-3">
                <div className="flex gap-2">
                  <input value={o.nome} onChange={(e) => setOp(i, { nome: e.target.value })} placeholder="Opção (ex.: Assado)" aria-label="Nome da opção" className={`${campoCls} mt-0 flex-1`} />
                  <input value={o.preco} onChange={(e) => setOp(i, { preco: e.target.value })} placeholder="R$" inputMode="decimal" aria-label={`Preço ${o.nome}`} className={`${campoCls} mt-0 w-28 text-lg font-bold`} />
                  <button type="button" onClick={() => setOps((x) => x.filter((_, j) => j !== i))} aria-label="Remover opção" className="p-2 text-muted"><Trash2 size={20} /></button>
                </div>
                <input value={o.nota} onChange={(e) => setOp(i, { nota: e.target.value })} placeholder="Aviso curto (ex.: Pronta entrega todo dia)" aria-label="Aviso da opção" className={`${campoCls} mt-0 text-sm`} />
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={o.encomenda} onChange={(e) => setOp(i, { encomenda: e.target.checked })} className="h-5 w-5 accent-terra" />
                  Por encomenda (o cliente marca dia e horário)
                </label>
                {fotoMini(o.foto_url, "foto desta opção", i)}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setOps((x) => [...x, { nome: "", preco: "", nota: "", foto_url: null, encomenda: false }])} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-terra"><Plus size={16} />Adicionar opção</button>
        </div>
        {ops.length === 0 && (
          <>
            <Campo rotulo="Preço (R$)" dica="Opcional. Em branco aparece “a confirmar”." inputMode="decimal" value={precoTxt} onChange={(e) => setPrecoTxt(e.target.value)} placeholder="Ex.: 45,00" />
            <Chave ligado={p.encomenda} onChange={(v) => set("encomenda", v)} rotulo="Sob encomenda" descricao="O cliente precisa marcar o dia e o horário." />
          </>
        )}

        <AreaTexto rotulo="Descrição" dica="Opcional. Ex.: Douradinho e sequinho, perfeito para o café da tarde." rows={2} value={p.descricao ?? ""} onChange={(e) => set("descricao", e.target.value)} />
        <Campo rotulo="Tamanho / quantidade" dica="Opcional. Ex.: Bandeja com 20 unidades · aprox. 1 kg" value={p.medida ?? ""} onChange={(e) => set("medida", e.target.value)} />

        <div>
          <span className="font-semibold">Foto principal <span className="font-normal text-muted">(opcional)</span></span>
          <Explica>Com boa luz, de perto. Se cada opção tiver foto própria (congelado/assado), o site troca a foto quando o cliente escolhe.</Explica>
          <div className="mt-2">{fotoMini(p.foto_url, "foto", "principal")}</div>
        </div>

        <label className="block">
          <span className="font-semibold">Grupo</span>
          <select value={p.categoria_id} onChange={(e) => set("categoria_id", e.target.value)} className={campoCls}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <Chave ligado={p.disponivel} onChange={(v) => set("disponivel", v)} rotulo="Disponível no site" />
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
      </div>
    </Sheet>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Camera, Newspaper, Settings, Tag, Users } from "lucide-react";
import { atualizarSite } from "@/app/admin/acoes";
import { useSessao } from "@/lib/admin/sessao";
import { createClient } from "@/lib/supabase/client";
import { Ajuda, Chave, Titulo } from "./ui";

type Cfg = { pedidos_pausados: boolean; mostrar_precos: boolean; aceita_entrega: boolean; taxa_entrega: number | null };

export function Inicio() {
  const { membro, pode } = useSessao();
  const supabase = useMemo(() => createClient(), []);
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [semPreco, setSemPreco] = useState<number | null>(null);
  const [pedidos7, setPedidos7] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("configuracoes").select("pedidos_pausados,mostrar_precos,aceita_entrega,taxa_entrega").eq("id", 1).single().then(({ data }) => setCfg(data as Cfg));
    supabase.from("produtos").select("preco,variacoes").eq("disponivel", true).then(({ data }) => {
      const faltam = (data ?? []).reduce((n, p: { preco: number | null; variacoes: { preco: number | null }[] }) =>
        n + (p.variacoes?.length ? p.variacoes.filter((v) => v.preco == null).length : p.preco == null ? 1 : 0), 0);
      setSemPreco(faltam);
    });
    if (pode("dono", "gerente")) {
      const desde = new Date(Date.now() - 7 * 864e5).toISOString();
      supabase.from("eventos").select("id", { count: "exact", head: true }).eq("tipo", "enviar_pedido").gte("criado_em", desde).then(({ count }) => setPedidos7(count ?? 0));
    }
  }, [supabase, pode]);

  async function salvar(campo: "pedidos_pausados" | "mostrar_precos" | "aceita_entrega", valor: boolean) {
    setCfg((c) => (c ? { ...c, [campo]: valor } : c));
    await supabase.from("configuracoes").update({ [campo]: valor, atualizado_em: new Date().toISOString() }).eq("id", 1);
    await atualizarSite(["config"]);
  }

  const atalho = "flex items-center gap-4 rounded-md border border-linha bg-papel p-5 text-lg font-semibold text-ink active:bg-creme";
  return (
    <>
      <Titulo sub="O que você quer fazer agora?">Olá, {membro?.nome.split(" ")[0]}!</Titulo>
      <Ajuda titulo="Primeira vez aqui? Veja como funciona" passos={[
        <>Este é o <b>painel do site</b>. Tudo que você muda aqui aparece no site <b>na hora</b>.</>,
        <>Em <b>Produtos e preços</b> você coloca o preço do <b>congelado</b> e do <b>assado</b>, cadastra quitandas novas e desliga o que acabou.</>,
        <>Em <b>Fotos e novidades</b> você sobe fotos e escreve avisos (ex.: encomendas de Natal).</>,
        <>Em <b>Ajustes</b> fica a <b>taxa de entrega</b>, o horário, o WhatsApp e as perguntas frequentes.</>,
        <>Muitas encomendas? Desligue <b>Recebendo encomendas</b> aqui embaixo e o site avisa o cliente.</>,
      ]} dicas={[
        "Não tem como estragar o site mexendo aqui: o que você muda dá para desfazer.",
        "Ao terminar, pode só fechar o navegador. Você continua conectada neste celular.",
      ]} />
      <div className="space-y-3">
        {pode("dono", "gerente", "atendente") && (
          <Link href="/admin/produtos" className={`${atalho} ${semPreco ? "border-dourado bg-dourado/20" : ""}`}>
            <Tag size={28} className="text-terra" aria-hidden />
            <span>Produtos e preços<span className="block text-sm font-normal text-muted">{semPreco ? `${semPreco} preço(s) ainda em branco — aparecem como “a confirmar”` : "Preços, quitandas novas e o que acabou"}</span></span>
          </Link>
        )}
        {pode("dono", "gerente", "social") && (
          <Link href="/admin/conteudo#fotos" className={atalho}>
            <Camera size={28} className="text-terra" aria-hidden />
            <span>Subir fotos<span className="block text-sm font-normal text-muted">Bandejas, bolos, a cozinha: o cliente compra com os olhos</span></span>
          </Link>
        )}
        {pode("dono", "gerente", "social") && (
          <Link href="/admin/conteudo#novidades" className={atalho}>
            <Newspaper size={28} className="text-terra" aria-hidden />
            <span>Escrever uma novidade<span className="block text-sm font-normal text-muted">Quitanda nova, datas especiais. Ajuda a aparecer no Google</span></span>
          </Link>
        )}
        {pode("dono", "gerente") && (
          <Link href="/admin/ajustes" className={atalho}>
            <Settings size={28} className="text-terra" aria-hidden />
            <span>Ajustes<span className="block text-sm font-normal text-muted">{cfg?.aceita_entrega && cfg.taxa_entrega == null ? "Falta colocar a taxa de entrega" : "Taxa de entrega, horário, WhatsApp e perguntas"}</span></span>
          </Link>
        )}
        {pode("dono") && (
          <Link href="/admin/equipe" className={atalho}>
            <Users size={28} className="text-terra" aria-hidden />
            <span>Equipe e acessos<span className="block text-sm font-normal text-muted">Cadastrar pessoas e trocar senhas</span></span>
          </Link>
        )}
      </div>

      {cfg && pode("dono", "gerente", "atendente") && (
        <section className="mt-8 space-y-3">
          <h2 className="text-xl font-semibold">Agora no site</h2>
          <Chave ligado={!cfg.pedidos_pausados} onChange={(v) => salvar("pedidos_pausados", !v)} rotulo={cfg.pedidos_pausados ? "Encomendas pausadas" : "Recebendo encomendas"} descricao="Desligue quando estiver sem dar conta ou de folga." />
          {pode("dono", "gerente") && (
            <>
              <Chave ligado={cfg.aceita_entrega} onChange={(v) => salvar("aceita_entrega", v)} rotulo={cfg.aceita_entrega ? "Fazendo entrega" : "Só retirada"} descricao="Ligado, o cliente escolhe entre retirar ou receber em casa (por encomenda)." />
              <Chave ligado={cfg.mostrar_precos} onChange={(v) => salvar("mostrar_precos", v)} rotulo={cfg.mostrar_precos ? "Preços aparecendo no site" : "Todos os preços escondidos"} descricao="Desligado, a encomenda sai como “valor a confirmar”." />
            </>
          )}
        </section>
      )}

      {pedidos7 !== null && (
        <Link href="/admin/resultados" className="mt-8 flex items-center justify-between gap-3 rounded-md bg-creme p-4 text-ink">
          <span><b className="text-2xl">{pedidos7}</b> encomendas enviadas pelo site nos últimos 7 dias.</span>
          <span className="shrink-0 font-semibold text-terra underline">Ver resultados</span>
        </Link>
      )}
    </>
  );
}

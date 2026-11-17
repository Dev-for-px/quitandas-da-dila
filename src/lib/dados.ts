// Leitura pública dos dados do Supabase, com cache do Next.js.
// O painel chama atualizarSite(tags) ao salvar, e o site mostra a mudança na hora.
import { createClient as createSupabase } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { supabaseConfigured, supabaseKey, supabaseUrl } from "./supabase/env";
import type { Redes } from "./redes";
import { SAIDA_PADRAO, type Saida } from "./saida";
export { SAIDA_PADRAO, type Saida };

export type Categoria = { id: string; nome: string; slug: string; descricao: string | null; estilo: "destaque" | "lista"; ordem: number };
/** Opção do produto (ex.: Congelado / Assado), cada uma com seu preço. */
export type Variacao = { nome: string; preco: number | null; nota?: string | null; foto_url?: string | null; encomenda?: boolean };
export type Produto = {
  id: string; categoria_id: string; nome: string; slug: string; descricao: string | null; medida: string | null;
  preco: number | null; variacoes: Variacao[]; foto_url: string | null; foto_alt: string | null; tags: string[];
  encomenda: boolean; disponivel: boolean; destaque: boolean; ordem: number; atualizado_em: string;
};
export type Faq = { id: string; pergunta: string; resposta: string };
export type Foto = { id: string; url: string; legenda: string | null };
export type Post = { id: string; titulo: string; slug: string; resumo: string | null; conteudo: string; capa_url: string | null; publicado_em: string | null; atualizado_em: string };
export type Config = {
  mostrar_precos: boolean; pedidos_pausados: boolean; whatsapp: string; telefone: string;
  aceita_entrega: boolean; taxa_entrega: number | null; pedido_minimo: number | null;
  horario: string | null; formas_pagamento: string[]; redes: Redes; saida: Saida; historia: string | null;
};

export const CONFIG_PADRAO: Config = {
  mostrar_precos: true, pedidos_pausados: false, whatsapp: "5537998262611", telefone: "5537998262611",
  aceita_entrega: true, taxa_entrega: null, pedido_minimo: null, horario: null, formas_pagamento: [],
  redes: { instagram: "https://www.instagram.com/quitandasdadila/" }, saida: SAIDA_PADRAO, historia: null,
};

function db() {
  return createSupabase(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

async function seguro<T>(fn: () => Promise<T>, padrao: T): Promise<T> {
  if (!supabaseConfigured) return padrao;
  try {
    return await fn();
  } catch (e) {
    console.error("[dados]", e);
    return padrao;
  }
}

export async function getConfig(): Promise<Config> {
  "use cache";
  cacheLife("minutes");
  cacheTag("config");
  return seguro(async () => {
    const { data, error } = await db().from("configuracoes").select("*").eq("id", 1).single();
    if (error) throw error;
    return {
      ...CONFIG_PADRAO, ...data,
      taxa_entrega: data.taxa_entrega == null ? null : Number(data.taxa_entrega),
      pedido_minimo: data.pedido_minimo == null ? null : Number(data.pedido_minimo),
      redes: data.redes ?? {}, saida: { ...SAIDA_PADRAO, ...(data.saida ?? {}) }, formas_pagamento: data.formas_pagamento ?? [],
    };
  }, CONFIG_PADRAO);
}

export async function getCategorias(): Promise<Categoria[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cardapio");
  return seguro(async () => {
    const { data, error } = await db().from("categorias").select("id,nome,slug,descricao,estilo,ordem").eq("ativo", true).order("ordem");
    if (error) throw error;
    return data as Categoria[];
  }, []);
}

const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

export async function getProdutos(): Promise<Produto[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cardapio");
  return seguro(async () => {
    const { data, error } = await db().from("produtos").select("*").order("ordem");
    if (error) throw error;
    return (data as Produto[]).map((p) => ({ ...p, preco: num(p.preco), variacoes: (p.variacoes ?? []).map((v) => ({ ...v, preco: num(v.preco) })) }));
  }, []);
}

/** Menor preço do produto (considerando as opções). */
export function precoMinimo(p: Pick<Produto, "preco" | "variacoes">) {
  const v = p.variacoes.map((x) => x.preco).filter((x): x is number => x != null);
  if (v.length) return Math.min(...v);
  return p.preco;
}

/** Categorias com seus produtos. */
export async function getCardapio() {
  const [categorias, produtos] = await Promise.all([getCategorias(), getProdutos()]);
  return categorias.map((c) => ({ ...c, produtos: produtos.filter((p) => p.categoria_id === c.id) }));
}

export async function getFaq(): Promise<Faq[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("faq");
  return seguro(async () => {
    const { data, error } = await db().from("faq").select("id,pergunta,resposta").eq("ativo", true).order("ordem");
    if (error) throw error;
    return data as Faq[];
  }, []);
}

export async function getGaleria(): Promise<Foto[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("galeria");
  return seguro(async () => {
    const { data, error } = await db().from("galeria").select("id,url,legenda").eq("ativo", true).order("ordem");
    if (error) throw error;
    return data as Foto[];
  }, []);
}

export async function getPosts(limite = 50): Promise<Post[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  return seguro(async () => {
    const { data, error } = await db().from("posts").select("id,titulo,slug,resumo,conteudo,capa_url,publicado_em,atualizado_em").eq("publicado", true).order("publicado_em", { ascending: false }).limit(limite);
    if (error) throw error;
    return data as Post[];
  }, []);
}

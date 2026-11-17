// Redes sociais configuráveis no painel (Ajustes). Só aparecem as que têm link.
export const REDES = [
  { chave: "instagram", nome: "Instagram" },
  { chave: "facebook", nome: "Facebook" },
  { chave: "tiktok", nome: "TikTok" },
  { chave: "youtube", nome: "YouTube" },
  { chave: "google", nome: "Google" },
] as const;

export type ChaveRede = (typeof REDES)[number]["chave"];
export type Redes = Partial<Record<ChaveRede, string>>;

export function redesAtivas(redes: Redes | null | undefined) {
  return REDES.filter((r) => (redes?.[r.chave] ?? "").trim().startsWith("http")).map((r) => ({ ...r, url: redes![r.chave]!.trim() }));
}

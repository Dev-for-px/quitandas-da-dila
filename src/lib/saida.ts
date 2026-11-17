// Aviso "Já vai?" — sem dependências de servidor (usado também no painel)
export type Saida = { ativo: boolean; titulo: string; texto: string; botao: "whatsapp" | "ligar" | "produtos"; textoBotao: string };
export const SAIDA_PADRAO: Saida = {
  ativo: false,
  titulo: "Já vai? Que tal um café da tarde mineiro?",
  texto: "Congelado tem todo dia. Assado, é só marcar o horário.",
  botao: "ligar",
  textoBotao: "Ligar para a Dila",
};

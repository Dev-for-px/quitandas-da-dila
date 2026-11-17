import { Icone } from "./Icone";
import { MSG_PADRAO, linkLigar, linkWhatsApp } from "@/lib/site";

type P = { texto?: string; grande?: boolean; bloco?: boolean; className?: string };
const cls = (base: string, { grande, bloco, className }: P) => `qd-botao ${base}${grande ? " qd-botao--lg" : ""}${bloco ? " bloco" : ""}${className ? ` ${className}` : ""}`;

/** Botão principal: a Dila prefere ligação. */
export function BotaoLigar({ texto = "Ligar e encomendar", numero, ...p }: P & { numero?: string }) {
  return (
    <a href={linkLigar(numero)} className={cls("qd-botao--primario", p)}>
      <Icone nome="telefone" tamanho={p.grande ? 22 : 20} />
      <span>{texto}</span>
    </a>
  );
}

export function BotaoWhatsApp({ texto = "Chamar no WhatsApp", mensagem = MSG_PADRAO, numero, verde = false, ...p }: P & { mensagem?: string; numero?: string; verde?: boolean }) {
  return (
    <a href={linkWhatsApp(mensagem, numero)} target="_blank" rel="noopener noreferrer" className={cls(verde ? "qd-botao--whatsapp" : "qd-botao--secundario", p)}>
      <Icone nome="whatsapp" tamanho={p.grande ? 22 : 20} />
      <span>{texto}</span>
    </a>
  );
}

"use client";
import { usePathname } from "next/navigation";
import { Icone } from "./Icone";
import { linkLigar, linkWhatsApp } from "@/lib/site";

/** Barra fixa no celular: Ligar (preferido pela Dila) e WhatsApp. Some na tela do pedido. */
export function BarraFixa({ telefone, whatsapp }: { telefone: string; whatsapp: string }) {
  const caminho = usePathname();
  if (caminho === "/pedido") return null;
  return (
    <>
      <div className="h-20 md:hidden" aria-hidden />
      <div className="barra-fixa" role="region" aria-label="Encomendar">
        <a className="qd-botao qd-botao--primario" href={linkLigar(telefone)}>
          <Icone nome="telefone" />
          <span>Ligar</span>
        </a>
        <a className="qd-botao qd-botao--secundario" href={linkWhatsApp(undefined, whatsapp)} target="_blank" rel="noopener noreferrer">
          <Icone nome="whatsapp" />
          <span>WhatsApp</span>
        </a>
      </div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Saida } from "@/lib/saida";
import { linkLigar, linkWhatsApp } from "@/lib/site";
import { Icone } from "./Icone";

const CHAVE = "dila:aviso-saida";

/**
 * Aviso "Já vai?" mostrado uma vez por visita quando a pessoa demonstra que vai sair
 * (mouse saindo da página no computador; rolagem rápida para o topo no celular).
 * Não mexe no botão Voltar do navegador (o Google pune isso).
 */
export function AvisoSaida({ config, whatsapp, telefone }: { config: Saida; whatsapp: string; telefone: string }) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!config.ativo) return;
    let jaMostrou = false;
    try { jaMostrou = sessionStorage.getItem(CHAVE) === "1"; } catch {}
    if (jaMostrou) return;
    const inicio = Date.now();
    let ultimoY = window.scrollY, ultimoT = Date.now(), maxY = 0;
    const mostrar = () => {
      if (Date.now() - inicio < 8000) return;
      try { sessionStorage.setItem(CHAVE, "1"); } catch {}
      setAberto(true);
      limpar();
    };
    const mouse = (e: MouseEvent) => { if (e.clientY <= 0) mostrar(); };
    const rolar = () => {
      const y = window.scrollY, t = Date.now();
      maxY = Math.max(maxY, y);
      const velocidade = (ultimoY - y) / Math.max(1, t - ultimoT);
      if (maxY > 800 && y < 300 && velocidade > 2.5) mostrar();
      ultimoY = y; ultimoT = t;
    };
    const limpar = () => {
      document.removeEventListener("mouseout", mouse);
      window.removeEventListener("scroll", rolar);
    };
    document.addEventListener("mouseout", mouse);
    window.addEventListener("scroll", rolar, { passive: true });
    return limpar;
  }, [config.ativo]);

  if (!aberto) return null;
  const botao =
    config.botao === "whatsapp" ? { href: linkWhatsApp(undefined, whatsapp), icone: "whatsapp" as const, fora: true, cls: "qd-botao--whatsapp" }
    : config.botao === "produtos" ? { href: "/#linha-mineira", icone: "encomenda" as const, fora: false, cls: "qd-botao--primario" }
    : { href: linkLigar(telefone), icone: "telefone" as const, fora: false, cls: "qd-botao--primario" };
  return (
    <div role="dialog" aria-modal="true" aria-label={config.titulo} className="fixed inset-0 z-[85] flex items-end justify-center md:items-center">
      <button type="button" aria-label="Fechar" onClick={() => setAberto(false)} className="absolute inset-0 bg-ink/50" />
      <div className="relative w-full max-w-md rounded-t-[20px] bg-papel p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center md:rounded-lg">
        <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="absolute right-3 top-3 rounded-pill p-2 text-muted"><X size={22} /></button>
        <p className="font-serif text-2xl font-bold text-cafe">{config.titulo}</p>
        <p className="mt-2 text-muted">{config.texto}</p>
        <a href={botao.href} {...(botao.fora ? { target: "_blank", rel: "noopener noreferrer" } : {})} onClick={() => setAberto(false)} className={`qd-botao qd-botao--lg ${botao.cls} mt-5 w-full`}>
          <Icone nome={botao.icone} tamanho={22} /><span>{config.textoBotao}</span>
        </a>
        <button type="button" onClick={() => setAberto(false)} className="mt-3 text-sm text-muted underline">Agora não</button>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Coracao } from "./Icone";
import { IconeRede } from "./IconeRede";
import { redesAtivas, type Redes } from "@/lib/redes";
import { ENDERECO_LINHA, NEGOCIO, formatarTelefone, linkLigar } from "@/lib/site";

const fora = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Rodape({ redes, telefone, horario }: { redes: Redes; telefone: string; horario: string | null }) {
  const ativas = redesAtivas(redes);
  return (
    <footer className="rodape">
      <div className="xadrez" aria-hidden="true" />
      <div className="envelope rodape__conteudo">
        <p className="qd-slogan">Feito com carinho, do jeitinho mineiro. <Coracao tamanho={12} /></p>
        <address className="rodape__info not-italic">
          {NEGOCIO.nome} · <a href={linkLigar(telefone)} className="underline">{formatarTelefone(telefone)}</a><br />
          Retirada: {ENDERECO_LINHA}
          {horario && <><br />{horario}</>}
        </address>
        {ativas.length > 0 && (
          <ul className="mt-2 flex flex-wrap justify-center gap-2" aria-label="Redes sociais">
            {ativas.map((r) => (
              <li key={r.chave}>
                <a href={r.url} {...fora} aria-label={`${r.nome} da Quitandas da Dila`} title={r.nome}
                  className="flex h-11 w-11 items-center justify-center rounded-pill border border-linha text-cafe hover:bg-creme">
                  <IconeRede rede={r.chave} size={20} />
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-semibold">
          <Link className="underline" href="/perguntas-frequentes">Perguntas frequentes</Link>
          <Link className="underline" href="/como-assar">Como assar</Link>
          <Link className="underline" href="/novidades">Novidades</Link>
        </p>
        <p className="mt-3 text-[11px] text-muted opacity-80">
          Desenvolvido por <a href="https://pharconsultoria.com" {...fora} className="underline">PHAR</a>
        </p>
      </div>
    </footer>
  );
}

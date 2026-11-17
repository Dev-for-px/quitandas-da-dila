import Link from "next/link";
import { Icone } from "./Icone";
import { linkLigar } from "@/lib/site";

export const LINKS = [
  { href: "/#linha-mineira", label: "Pão de Queijo" },
  { href: "/#sob-encomenda", label: "Sob encomenda" },
  { href: "/como-assar", label: "Como assar" },
  { href: "/#encomendar", label: "Onde retirar" },
];

export function Topo({ telefone }: { telefone: string }) {
  return (
    <header className="topo envelope">
      <Link href="/" className="topo__logo" aria-label="Quitandas da Dila — início">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo-240.webp" srcSet="/img/logo-240.webp 1x, /img/logo-480.webp 2x" width={120} height={120} alt="Quitandas da Dila" className="h-[72px] w-[72px] md:h-[120px] md:w-[120px]" />
      </Link>
      <nav className="topo__nav" aria-label="Seções">
        {LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </nav>
      <a className="qd-botao qd-botao--primario topo__cta" href={linkLigar(telefone)}>
        <Icone nome="telefone" />
        <span>Ligar</span>
      </a>
      <Link href="/pedido" className="flex min-h-12 items-center gap-2 rounded-pill border-2 border-borda px-4 text-[15px] font-bold text-cafe md:hidden" aria-label="Ver minha encomenda">
        <Icone nome="encomenda" />
        <span>Encomenda</span>
      </Link>
    </header>
  );
}

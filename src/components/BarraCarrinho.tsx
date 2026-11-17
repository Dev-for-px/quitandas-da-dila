"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCarrinho } from "@/lib/carrinho";
import { formatarPreco } from "@/lib/site";
import { Icone } from "./Icone";

// Barra fixa "Ver encomenda" (acima da barra Ligar/WhatsApp no celular) + aviso de item adicionado.
export function BarraCarrinho() {
  const { totalItens, subtotal, config, aviso, temSemPreco } = useCarrinho();
  const caminho = usePathname();
  if (caminho.startsWith("/admin")) return null;
  return (
    <>
      {aviso && (
        <div role="status" className="fixed inset-x-4 top-4 z-[70] mx-auto max-w-md rounded-pill bg-cafe px-4 py-3 text-center text-sm font-semibold text-leite shadow-cartao">{aviso}</div>
      )}
      {totalItens > 0 && caminho !== "/pedido" && (
        <>
          <div className="h-20" aria-hidden />
          <div className="fixed inset-x-0 bottom-[76px] z-50 px-3 pb-2 md:bottom-4">
            <Link href="/pedido" data-evento="ver_pedido" data-rotulo="Barra Ver encomenda" className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-pill bg-cafe px-5 py-3.5 text-leite shadow-cartao">
              <span className="flex items-center gap-2 font-bold">
                <Icone nome="encomenda" tamanho={22} />
                Ver encomenda
                <span className="rounded-pill bg-papel px-2 text-sm font-bold text-cafe">{totalItens}</span>
              </span>
              <span className="font-bold">{config.mostrarPrecos && subtotal != null ? `${formatarPreco(subtotal)}${temSemPreco ? "+" : ""}` : "Enviar"}</span>
            </Link>
          </div>
        </>
      )}
    </>
  );
}

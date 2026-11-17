import type { Metadata } from "next";
import { Checkout } from "@/components/Checkout";
import { getConfig } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Sua encomenda",
  robots: { index: false, follow: true },
  alternates: { canonical: "/pedido" },
};

export default async function Pedido() {
  const config = await getConfig();
  return (
    <div className="envelope max-w-xl py-6">
      <h1 className="text-3xl font-bold">Sua encomenda</h1>
      <p className="mt-2 text-muted">Confira os itens, marque como e quando quer receber e envie. A mensagem chega pronta no WhatsApp da Dila.</p>
      <div className="mt-6"><Checkout formasPagamento={config.formas_pagamento} /></div>
    </div>
  );
}

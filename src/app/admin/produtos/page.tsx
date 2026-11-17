import type { Metadata } from "next";
import { ProdutosAdmin } from "@/components/admin/ProdutosAdmin";

export const metadata: Metadata = { title: "Produtos e preços" };

export default function PaginaProdutos() {
  return <ProdutosAdmin />;
}

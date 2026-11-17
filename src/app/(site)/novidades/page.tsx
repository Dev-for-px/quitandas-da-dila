import type { Metadata } from "next";
import { CardPost } from "@/components/CardPost";
import { JsonLd } from "@/components/JsonLd";
import { getPosts } from "@/lib/dados";
import { breadcrumbJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Novidades da Dila",
  description: "Novidades da Quitandas da Dila em Pompéu – MG: quitandas novas, encomendas especiais e avisos.",
  alternates: { canonical: "/novidades" },
};

export default async function Novidades() {
  const posts = await getPosts();
  return (
    <div className="envelope py-10">
      <JsonLd data={breadcrumbJsonLd([{ nome: "Início", url: "/" }, { nome: "Novidades", url: "/novidades" }])} />
      <h1 className="text-4xl font-bold">Novidades da Dila</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Quitandas novas, encomendas especiais e avisos da Quitandas da Dila, em Pompéu – MG.</p>
      {posts.length === 0 ? (
        <p className="mt-8 rounded-md bg-creme p-6 text-center text-muted">Em breve as primeiras novidades por aqui.</p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">{posts.map((p) => <CardPost key={p.id} p={p} nivel={2} />)}</div>
      )}
    </div>
  );
}

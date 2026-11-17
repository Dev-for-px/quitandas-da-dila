import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold">Página não encontrada</h1>
      <p className="mt-3 text-muted">Essa página não existe. Que tal ver as quitandas da Dila?</p>
      <Link href="/" className="qd-botao qd-botao--primario mt-6">Ver as quitandas</Link>
    </div>
  );
}

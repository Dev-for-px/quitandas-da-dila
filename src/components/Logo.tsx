/* eslint-disable @next/next/no-img-element */
/** Logo oficial (intocável): cesta de quitandas da Dila. */
export function Logo({ altura = 48, prioridade = false }: { altura?: number; prioridade?: boolean }) {
  return (
    <img src="/img/logo-240.webp" srcSet="/img/logo-240.webp 1x, /img/logo-480.webp 2x" width={altura} height={altura}
      alt="Quitandas da Dila" loading={prioridade ? "eager" : "lazy"} className="rounded-full bg-papel" style={{ width: altura, height: altura }} />
  );
}

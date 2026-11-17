import Link from "next/link";
import { Arabesco, Coracao, Icone, TituloSecao } from "@/components/Icone";
import { BotaoLigar, BotaoWhatsApp } from "@/components/Botoes";
import { CartaoMineiro } from "@/components/CartaoMineiro";
import { fonteFoto } from "@/lib/foto";
import { ItemLista } from "@/components/ItemLista";
import { GaleriaFaixa } from "@/components/GaleriaFaixa";
import { CardPost } from "@/components/CardPost";
import { JsonLd } from "@/components/JsonLd";
import { ListaFaq } from "@/components/ListaFaq";
import { getCardapio, getConfig, getFaq, getGaleria, getPosts } from "@/lib/dados";
import { catalogoJsonLd, faqJsonLd } from "@/lib/schema";
import { ENDERECO_LINHA, NEGOCIO, formatarPreco, formatarTelefone, linkLigar } from "@/lib/site";

function Foto({ url, alt, prioridade, className }: { url: string; alt: string; prioridade?: boolean; className?: string }) {
  const f = fonteFoto(url);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={f.src} srcSet={f.srcSet} sizes="(min-width: 900px) 480px, 100vw" width={480} height={600} alt={alt}
      loading={prioridade ? "eager" : "lazy"} fetchPriority={prioridade ? "high" : undefined} decoding="async" />
  );
}

export default async function Home() {
  const [config, secoes, faq, fotos, posts] = await Promise.all([getConfig(), getCardapio(), getFaq(), getGaleria(), getPosts(3)]);
  const destaque = secoes.filter((s) => s.estilo === "destaque" && s.produtos.length);
  const lista = secoes.filter((s) => s.estilo === "lista" && s.produtos.length);
  const fotoEncomenda = lista.flatMap((s) => s.produtos).find((p) => p.foto_url);
  const mp = config.mostrar_precos;

  return (
    <>
      <JsonLd data={catalogoJsonLd(secoes, mp)} />
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}

      {/* CAPA */}
      <section className="hero envelope">
        <div className="hero__texto">
          <div className="qd-faixa">
            <span className="qd-faixa__texto">{NEGOCIO.slogans.principal} <Coracao tamanho={12} /></span>
          </div>
          <h1 className="qd-titulo-produto">
            <span className="qd-titulo-produto__linha">O verdadeiro sabor de</span>
            <span className="qd-titulo-produto__destaque">Minas</span>
            <span className="sr-only"> – pão de queijo e biscoito de queijo da Quitandas da Dila em Pompéu – MG</span>
          </h1>
          <p className="hero__lead">
            Pão de queijo e biscoito de queijo feitos à mão em Pompéu. Congelados todos os dias, ou quentinhos saindo do forno no horário que você marcar.
          </p>
          <div className="acoes">
            <BotaoLigar grande numero={config.telefone} />
            <Link href="#linha-mineira" className="qd-botao qd-botao--secundario qd-botao--lg">
              <Icone nome="encomenda" tamanho={22} /><span>Montar minha encomenda</span>
            </Link>
          </div>
          <p className="nota">Para um atendimento mais rápido, a Dila prefere ligação.</p>
        </div>
        <div className="hero__foto">
          <Foto url="/img/pao-de-queijo-assado-900.webp" alt="Assadeira de pães de queijo dourados saindo do forno da Dila" prioridade />
          <span className="qd-selo qd-selo--redondo qd-selo--cafe"><Icone nome="congelado" tamanho={26} />Congelado pronta entrega</span>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="envelope" aria-labelledby="t-como">
        <h2 id="t-como" className="sr-only">Como encomendar</h2>
        <ol className="qd-diferenciais">
          {[
            { icone: "congelado" as const, t: "1. Escolha congelado ou assado" },
            { icone: "encomenda" as const, t: "2. Marque o dia e o horário" },
            { icone: config.aceita_entrega ? "local" as const : "retirada" as const, t: config.aceita_entrega ? "3. Retire ou receba em casa" : "3. Retire quentinho" },
            { icone: "whatsapp" as const, t: "4. Envie no WhatsApp ou ligue" },
          ].map((p) => (
            <li key={p.t} className="qd-diferenciais__item"><Icone nome={p.icone} tamanho={30} /><span>{p.t}</span></li>
          ))}
        </ol>
      </section>

      {/* LINHA MINEIRA */}
      {destaque.map((s) => (
        <section key={s.id} className="secao envelope" aria-labelledby={s.slug}>
          <TituloSecao id={s.slug}>{s.nome}</TituloSecao>
          {s.descricao && <p className="secao__intro qd-slogan">{s.descricao}</p>}
          <div className="produtos">
            {s.produtos.map((p) => <CartaoMineiro key={p.id} p={p} grupo={s.nome} mostrarPreco={mp} />)}
          </div>
          <div className="modos">
            <div className="modo">
              <span className="modo__icone"><Icone nome="congelado" tamanho={28} /></span>
              <div>
                <h3>Congelado</h3>
                <p>Pronta entrega <strong>todos os dias</strong>, inclusive fins de semana e feriados. Leve pra casa e asse no forno ou na Air Fryer. <Link href="/como-assar" className="font-bold underline">Veja como assar</Link>.</p>
              </div>
            </div>
            <div className="modo">
              <span className="modo__icone"><Icone nome="forno" tamanho={28} /></span>
              <div>
                <h3>Assado</h3>
                <p>Por encomenda: é só <strong>marcar o horário</strong> e buscar fresquinho, saindo do forno.</p>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* SOB ENCOMENDA */}
      {lista.length > 0 && (
        <section className="secao secao--creme" aria-labelledby="sob-encomenda">
          <div className="envelope">
            <TituloSecao id="sob-encomenda">Sob Encomenda</TituloSecao>
            <p className="secao__intro qd-slogan">Para completar a mesa do café.</p>
            <div className="encomenda">
              {fotoEncomenda?.foto_url && (
                <figure className="encomenda__foto">
                  <Foto url={fotoEncomenda.foto_url} alt={fotoEncomenda.foto_alt || `${fotoEncomenda.nome} da Quitandas da Dila`} />
                </figure>
              )}
              <div className="cardapio">
                {lista.map((s) => (
                  <div key={s.id} className="cardapio__grupo">
                    <h3>{s.nome}</h3>
                    {s.descricao && <p className="-mt-1 mb-1 text-sm italic text-muted">{s.descricao}</p>}
                    <ul className="!gap-0 divide-y divide-dashed divide-linha [&>li]:!pl-0 [&>li]:before:!hidden">
                      {s.produtos.map((p) => <ItemLista key={p.id} p={p} grupo={s.nome} mostrarPreco={mp} />)}
                    </ul>
                  </div>
                ))}
                <span className="qd-selo qd-selo--pilula qd-selo--claro"><Icone nome="encomenda" tamanho={16} />Sob encomenda: marque o dia</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {fotos.length > 0 && (
        <section aria-labelledby="t-fotos" className="pt-12">
          <h2 id="t-fotos" className="sr-only">Fotos das quitandas da Dila</h2>
          <GaleriaFaixa fotos={fotos} titulo="Fotos das quitandas da Dila" />
        </section>
      )}

      {/* AFETO */}
      <section className="afeto envelope" aria-label="Sobre a Dila">
        <Arabesco largura={200} />
        <p className="afeto__frase">Tem cheiro de café passado na hora.<br />Tem sabor de receita de família.<br />Tem carinho em cada detalhe.</p>
        {config.historia && <p className="mx-auto max-w-[640px] text-base">{config.historia}</p>}
      </section>

      {posts.length > 0 && (
        <section aria-labelledby="t-novidades" className="secao envelope">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="t-novidades" className="text-3xl font-bold">Novidades da Dila</h2>
            <Link href="/novidades" className="font-bold text-terra underline">Ver todas</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">{posts.map((p) => <CardPost key={p.id} p={p} />)}</div>
        </section>
      )}

      {/* ENCOMENDAR */}
      <section className="secao envelope encomendar" aria-labelledby="encomendar">
        <h2 className="encomendar__titulo" id="encomendar">Faça sua encomenda</h2>
        <p className="secao__intro">Congelado tem todo dia. Assado, é só marcar o horário.</p>
        <div className="qd-barra">
          <a className="qd-barra__tel" href={linkLigar(config.telefone)}>
            <span className="qd-barra__icone"><Icone nome="telefone" tamanho={26} /></span>
            <span className="qd-barra__textos">
              <span className="qd-barra__chamada">Ligação ou WhatsApp</span>
              <span className="qd-barra__numero">{formatarTelefone(config.telefone)}</span>
            </span>
          </a>
          <a className="qd-barra__insta" href={NEGOCIO.instagram} target="_blank" rel="noopener noreferrer">
            <Icone nome="instagram" tamanho={22} /><span>{NEGOCIO.instagramArroba}</span>
          </a>
          <p className="qd-barra__nota">Para um atendimento mais rápido e ágil, prefira a ligação.</p>
        </div>
        <div className="acoes acoes--centro">
          <BotaoLigar grande texto="Ligar agora" numero={config.telefone} />
          <BotaoWhatsApp grande numero={config.whatsapp} />
        </div>
        <a className="retirada" href={NEGOCIO.mapsBusca} target="_blank" rel="noopener noreferrer">
          <span className="retirada__icone"><Icone nome="local" tamanho={24} /></span>
          <span>
            <strong>Retirada{config.aceita_entrega ? " ou entrega" : ""}</strong>
            <span className="retirada__end">{ENDERECO_LINHA}</span>
            {config.aceita_entrega && (
              <span className="retirada__end">Entrega em Pompéu por encomenda{mp && config.taxa_entrega != null ? `, taxa de ${formatarPreco(config.taxa_entrega)}` : ", com taxa de entrega"}.</span>
            )}
            {config.horario && <span className="retirada__end">{config.horario}</span>}
            <span className="retirada__link">Ver no mapa</span>
          </span>
        </a>
      </section>

      {faq.length > 0 && (
        <section aria-labelledby="t-faq" className="envelope mx-auto max-w-3xl pb-16">
          <h2 id="t-faq" className="mb-6 text-center text-3xl font-bold">Perguntas frequentes</h2>
          <ListaFaq faq={faq.slice(0, 6)} />
          <p className="mt-4 text-center"><Link href="/perguntas-frequentes" className="font-bold text-terra underline">Ver todas as perguntas</Link></p>
        </section>
      )}
    </>
  );
}

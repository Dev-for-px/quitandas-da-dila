# Quitandas da Dila — site

Landing page (vitrine) da Quitandas da Dila, quitandeira de Pompéu – MG (pão de queijo, biscoito de queijo, bolos, tarecos, pudim). O objetivo do site é gerar encomendas pelo WhatsApp e aparecer no Google para buscas locais.

## Stack
- Next.js 14 (App Router) + React 18 + TypeScript. Sem Tailwind: CSS puro em `app/globals.css`.
- Fontes via `@fontsource` (Great Vibes, Playfair Display, Montserrat) — não usar Google Fonts por CDN.
- Deploy: Vercel. Todo `git push` na `main` publica em produção.

## Comandos
- `npm install` · `npm run dev` (http://localhost:3000) · `npm run build` (rodar antes de dar push para checar erros).

## Onde fica cada coisa
- `lib/contato.ts` — **fonte única** de telefone, Instagram, endereço, link do WhatsApp e `SITE_URL`. Nunca repita esses dados à mão em outro arquivo; importe daqui.
- `app/page.tsx` — textos e seções da página.
- `components/ProdutoMineiro.tsx` — cartões de Pão de Queijo / Biscoito (alterna assado ↔ congelado).
- `components/Icone.tsx` — ícones SVG do Design System.
- `app/globals.css` — tokens do Design System (cores, tamanhos, espaçamentos) em variáveis CSS.
- `app/layout.tsx` — title, meta description, Open Graph e JSON-LD (Bakery/LocalBusiness).
- `app/sitemap.ts`, `app/robots.ts` — SEO técnico.
- `public/img/` — fotos em WebP, sempre em duas larguras (480 e 900 px).

## Regras
- Mobile first: a maioria dos clientes chega pelo celular.
- Respeitar o Design System: usar as variáveis de `globals.css`, não cores/tamanhos soltos.
- SEO local é prioridade: manter "Pompéu – MG" nos títulos, descrições e no schema.org. Ao mudar dados do negócio, atualizar `contato.ts` e o JSON-LD do `layout.tsx` juntos.
- Imagens novas: converter para WebP nas versões 480 e 900 px, com `alt` descritivo.
- Textos em português do Brasil, tom caseiro e acolhedor ("Da cozinha da Dila para sua família.").
- Responder e comentar código em português.

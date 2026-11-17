@AGENTS.md

# Projeto: site da Quitandas da Dila (Pompéu – MG)

Cliente da PHAR. Quitandas mineiras da Dirlene (Dila). Site com encomenda: o cliente monta o pedido e envia pronto para o WhatsApp (ou liga — a Dila **prefere ligação**). Não tem pagamento online.

## Stack
- Next.js 16 (App Router, cacheComponents) + TypeScript + Tailwind v4 + Supabase (`@supabase/ssr`)
- Base reaproveitada do projeto Aconchego (`Dev-for-px/aconchego-pompeu`): mesmo carrinho, painel, perfis e RLS
- Supabase: projeto `sksuvgugshfueqgtbbwy` ("Quitandas da Dila", região São Paulo). Variáveis em `.env.local` (modelo em `.env.example`)
- SQL versionado em `supabase/migrations/` (já aplicado)
- Código portátil: nada exclusivo da Vercel (plano: migrar para Hostinger depois)

## Regras
- **Design System oficial** é a fonte da verdade: cores terracota/café/creme/papel, fontes Great Vibes / Playfair Display / Montserrat (via @fontsource), componentes `qd-*` em `src/app/globals.css` (layer components) + tokens Tailwind (`terra`, `terracota`, `cafe`, `creme`, `papel`, `leite`, `linha`, `borda`, `dourado`, `zap`)
- Logo intocável (`public/img/logo-*.webp`). Assinatura PHAR discreta no rodapé. Nada com "cara de IA"
- **Nunca inventar dado** (preço, horário, produto). Preço vazio = "a confirmar"; horário vazio = não aparece
- NAP: Rua Professora Pequenina, 361 – Bairro Cristos, Pompéu – MG, CEP 35640-000 · (37) 99826-2611 · @quitandasdadila
- Texto em português do Brasil; público leigo, botões grandes, mobile primeiro
- Nunca commitar `.env*` nem chave `service_role`

## Produtos
- `categorias.estilo`: `destaque` (cartão grande com foto: Linha Mineira) ou `lista` (sob encomenda)
- `produtos.variacoes`: `[{ nome, preco, nota, foto_url, encomenda }]` — ex.: Congelado (pronta entrega) e Assado (por encomenda), cada um com seu preço. No site o cliente escolhe e o valor muda (`CartaoMineiro`)
- `produtos.encomenda` / `variacao.encomenda`: exige dia e horário no pedido

## Encomenda (carrinho → WhatsApp)
- Estado em `src/lib/carrinho.tsx` (localStorage `dila:*`); mensagem em `src/lib/mensagem.ts`
- Retirada ou entrega (`configuracoes.aceita_entrega`); entrega é sempre por encomenda, com `taxa_entrega` (soma no total; vazia = "a confirmar")
- Nome, telefone (com DDD), dia e horário são obrigatórios em toda encomenda
- WhatsApp sempre abre em nova aba (o cliente nunca sai do site)
- Formas de pagamento só aparecem se cadastradas no painel

## Painel (/admin)
- Início, Produtos e preços, Fotos e novidades, Ajustes (entrega/taxa, contato, horário, pagamento, redes, aviso "Já vai?", história, FAQ), Equipe, Resultados
- Perfis: dono, gerente, social, atendente. Primeiro dono: `select public.criar_membro('Nome', 'SENHA', 'dono', '37 9XXXX-XXXX');` no SQL Editor
- Ao salvar chama `atualizarSite(tags)` (tags: config, cardapio, faq, galeria, posts)

## SEO/GEO
- Schema Bakery + OfferCatalog + FAQPage + HowTo (`/como-assar`) + BlogPosting; sitemap, robots, llms.txt, llms-full.txt
- FAQ inicial tirada de `estrategia-seo-geo/03_GEO_AEO_ANSWER_BLOCKS.md`

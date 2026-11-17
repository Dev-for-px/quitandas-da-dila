# Quitandas da Dila — site

Site com encomenda da Quitandas da Dila (Pompéu – MG): o cliente escolhe congelado ou assado, marca dia e horário, escolhe retirada ou entrega e envia a encomenda pronta no WhatsApp — ou liga. Tem painel (`/admin`) para a Dila mudar preços, produtos, fotos, taxa de entrega e textos.

- Next.js + TypeScript + Tailwind + Supabase
- Design System oficial da marca (Great Vibes / Playfair Display / Montserrat)

## Rodar no computador
```bash
npm install
cp .env.example .env.local   # preencha a publishable key do Supabase
npm run dev                  # http://localhost:3000
```

## Publicar
Cada `git push` na `main` publica na Vercel. Variáveis obrigatórias na Vercel: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Detalhes técnicos em `CLAUDE.md`. Status em `docs/status-projeto.md`.

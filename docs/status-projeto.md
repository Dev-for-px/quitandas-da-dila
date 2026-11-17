# Quitandas da Dila – Status do site (16/11/2026)

## Infra
- Código: GitHub `Dev-for-px/quitandas-da-dila` (antigo `pedrodadila/quitandas-da-dila`, redireciona)
- Site: https://quitandas-da-dila.vercel.app (push na `main` = publica)
- Supabase: projeto `sksuvgugshfueqgtbbwy` – "Quitandas da Dila" (São Paulo)

## O que está pronto (versão 2 – com encomenda e painel)
- Cartões do Pão de Queijo e do Biscoito: escolhe Congelado ou Assado, cada um com seu preço; foto troca; quantidade + Adicionar
- Sob encomenda (bolos, tarecos, pudim): um toque adiciona; depois vira + / −
- Página da encomenda: retirada ou entrega (por encomenda, com taxa), dia e horário, nome, pagamento (se cadastrado), observação → mensagem pronta no WhatsApp; botão "Prefiro ligar"
- Painel: produtos e preços, fotos e novidades, ajustes (taxa de entrega, horário, WhatsApp, pagamento, redes, FAQ), equipe e resultados
- Página /como-assar (forno e Air Fryer), FAQ, novidades, SEO/GEO completo

## Pendências
- [ ] Criar o login da Dila (e o do Pedro) – SQL `criar_membro` no Supabase
- [ ] Dila colocar os preços (congelado e assado) e a taxa de entrega no painel
- [ ] Horário de atendimento e formas de pagamento (só se a Dila informar)
- [ ] Desativar "Allow new users to sign up" no Supabase (Authentication)
- [ ] Domínio próprio, Google Search Console e Google Meu Negócio
- [ ] Migrar para a Hostinger junto com os outros clientes

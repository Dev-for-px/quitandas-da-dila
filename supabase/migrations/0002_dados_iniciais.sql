-- Quitandas da Dila – dados iniciais (só o que está no Design System oficial; sem preços nem horário)
insert into public.configuracoes (id, redes, saida)
values (1,
  '{"instagram": "https://www.instagram.com/quitandasdadila/"}'::jsonb,
  '{"ativo": false, "titulo": "Já vai? Que tal um café da tarde mineiro?", "texto": "Congelado tem todo dia. Assado, é só marcar o horário.", "botao": "ligar", "textoBotao": "Ligar para a Dila"}'::jsonb)
on conflict (id) do nothing;

insert into public.categorias (nome, slug, descricao, estilo, ordem) values
  ('Linha Mineira', 'linha-mineira', 'Crocante por fora. Macio por dentro. Do jeitinho mineiro.', 'destaque', 10),
  ('Bolos Caseiros', 'bolos-caseiros', 'Sob encomenda. Tem outros sabores: pergunte!', 'lista', 20),
  ('Tarecos', 'tarecos', 'Sob encomenda.', 'lista', 30),
  ('Sobremesas', 'sobremesas', 'Sob encomenda.', 'lista', 40)
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, descricao, medida, variacoes, foto_url, foto_alt, encomenda, destaque, ordem)
select c.id, x.nome, x.slug, x.descricao, x.medida, x.variacoes, x.foto, x.alt, x.encomenda, x.destaque, x.ordem
from (values
  ('linha-mineira', 'Pão de Queijo', 'pao-de-queijo',
   'Casquinha crocante e miolo macio, com gostinho de queijo de verdade.',
   'Bandeja com 20 unidades · aprox. 1 kg',
   '[{"nome":"Congelado","preco":null,"nota":"Pronta entrega todo dia · forno ou Air Fryer","foto_url":"/img/pao-de-queijo-congelado-900.webp","encomenda":false},
     {"nome":"Assado","preco":null,"nota":"Por encomenda · é só marcar o horário","foto_url":"/img/pao-de-queijo-assado-900.webp","encomenda":true}]'::jsonb,
   '/img/pao-de-queijo-assado-900.webp', 'Pão de queijo mineiro da Quitandas da Dila, em Pompéu – MG', false, true, 10),
  ('linha-mineira', 'Biscoito de Queijo', 'biscoito-de-queijo',
   'Douradinho e sequinho, perfeito para o café da tarde.',
   'Bandeja com 20 unidades · aprox. 1 kg',
   '[{"nome":"Congelado","preco":null,"nota":"Pronta entrega todo dia · forno ou Air Fryer","foto_url":"/img/biscoito-de-queijo-congelado-900.webp","encomenda":false},
     {"nome":"Assado","preco":null,"nota":"Por encomenda · é só marcar o horário","foto_url":"/img/biscoito-de-queijo-assado-900.webp","encomenda":true}]'::jsonb,
   '/img/biscoito-de-queijo-assado-900.webp', 'Biscoito de queijo mineiro da Quitandas da Dila, em Pompéu – MG', false, true, 20),
  ('bolos-caseiros', 'Bolo de Fubá', 'bolo-de-fuba', null, null, '[]'::jsonb, '/img/bolo-de-fuba-900.webp', 'Bolo de fubá caseiro da Dila, em Pompéu – MG', true, false, 10),
  ('bolos-caseiros', 'Bolo de Fubá Cremoso', 'bolo-de-fuba-cremoso', null, null, '[]'::jsonb, null, null, true, false, 20),
  ('bolos-caseiros', 'Bolo de Trigo', 'bolo-de-trigo', null, null, '[]'::jsonb, null, null, true, false, 30),
  ('bolos-caseiros', 'Bolo de Trigo com Queijo', 'bolo-de-trigo-com-queijo', null, null, '[]'::jsonb, null, null, true, false, 40),
  ('tarecos', 'Tarecos Tradicionais', 'tarecos-tradicionais', null, null, '[]'::jsonb, null, null, true, false, 10),
  ('tarecos', 'Tarecos com Raspa de Limão', 'tarecos-com-raspa-de-limao', null, null, '[]'::jsonb, null, null, true, false, 20),
  ('sobremesas', 'Pudim de Leite Condensado', 'pudim-de-leite-condensado', null, null, '[]'::jsonb, null, null, true, false, 10)
) as x(cat, nome, slug, descricao, medida, variacoes, foto, alt, encomenda, destaque, ordem)
join public.categorias c on c.slug = x.cat
on conflict (slug) do nothing;

insert into public.galeria (url, legenda, ordem) values
  ('/img/pao-de-queijo-perto-900.webp', 'Pão de queijo mineiro de perto, da Quitandas da Dila em Pompéu – MG', 10),
  ('/img/biscoito-assadeira-900.webp', 'Assadeira de biscoito de queijo da Dila saindo do forno, em Pompéu – MG', 20),
  ('/img/bolo-de-fuba-900.webp', 'Bolo de fubá caseiro da Quitandas da Dila, em Pompéu – MG', 30);

-- Perguntas frequentes: tiradas dos blocos de resposta oficiais (estrategia-seo-geo/03)
insert into public.faq (pergunta, resposta, ordem) values
('O que é a Quitandas da Dila?',
 'A Quitandas da Dila é uma marca de quitandas mineiras artesanais em Pompéu – MG, criada pela quitandeira Dirlene (Dila). Produz pão de queijo e biscoito de queijo, tarecos, bolos caseiros e pudim, com opções congeladas para pronta entrega e assadas sob encomenda, para retirar na Rua Professora Pequenina, 361, Bairro Cristos.', 10),
('Onde comprar pão de queijo artesanal em Pompéu?',
 'Na Quitandas da Dila, em Pompéu – MG. O pão de queijo e o biscoito de queijo são feitos com receita mineira e vendidos em bandejas com 20 unidades (aprox. 1 kg), congelados para assar em casa ou assados sob encomenda. Encomendas pelo telefone e WhatsApp (37) 99826-2611.', 20),
('Tem pão de queijo congelado para pronta entrega em Pompéu?',
 'Sim. A Quitandas da Dila tem pão de queijo e biscoito de queijo congelados para pronta entrega todos os dias, inclusive fins de semana e feriados, em bandejas de aprox. 1 kg. É só levar para casa e assar no forno ou na Air Fryer, sem descongelar.', 30),
('Como encomendar pão de queijo assado?',
 'O pão de queijo e o biscoito de queijo assados são feitos por encomenda: é só marcar o horário e buscar quentinho. Dá para montar o pedido pelo site e enviar pelo WhatsApp, ou ligar para (37) 99826-2611. Para um atendimento mais rápido, a Dila prefere ligação.', 40),
('A Dila faz bolo caseiro sob encomenda?',
 'Sim. A Quitandas da Dila, em Pompéu – MG, faz sob encomenda Bolo de Fubá, Bolo de Fubá Cremoso, Bolo de Trigo e Bolo de Trigo com Queijo, além de tarecos tradicionais e com raspa de limão e pudim de leite condensado. Tem outros sabores de bolo: é só perguntar.', 50),
('Onde retirar a encomenda da Quitandas da Dila?',
 'A retirada é na Rua Professora Pequenina, 361, Bairro Cristos, Pompéu – MG, CEP 35640-000. Telefone e WhatsApp: (37) 99826-2611.', 60),
('Como assar o pão de queijo congelado na Air Fryer?',
 'Pré-aqueça a Air Fryer a 200 °C por 10 minutos, coloque os pães direto do freezer no cesto sem amontoar e asse a 200 °C por 15 a 18 minutos, sacudindo o cesto aos 7 minutos. Não descongele antes de assar. O biscoito de queijo da Dila assa do mesmo jeito.', 70),
('A Quitandas da Dila faz entrega?',
 'Sim. A Quitandas da Dila faz entrega em Pompéu – MG mediante encomenda, com taxa de entrega. Também dá para retirar na Rua Professora Pequenina, 361, Bairro Cristos. Encomendas pelo telefone e WhatsApp (37) 99826-2611.', 65),
('Precisa untar a forma para assar o pão de queijo da Dila?',
 'Não precisa untar. Distribua os pães ou biscoitos com espaço entre eles e leve direto do freezer ao forno pré-aquecido.', 80);

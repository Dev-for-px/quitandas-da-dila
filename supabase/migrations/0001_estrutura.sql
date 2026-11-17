-- =====================================================================
-- Quitandas da Dila – banco do site: equipe, produtos, conteúdo, métricas
-- Baseado no projeto do Aconchego (mesma lógica de perfis e RLS)
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

create type public.perfil_equipe as enum ('dono', 'gerente', 'social', 'atendente');

-- ---------- Equipe ----------
create table public.equipe (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null,
  telefone    text unique,
  usuario     text unique,
  email       text unique,
  email_login text not null unique,
  perfil      public.perfil_equipe not null default 'atendente',
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

create or replace function public.meu_perfil()
returns public.perfil_equipe
language sql stable security definer set search_path = public as $$
  select perfil from public.equipe where id = auth.uid() and ativo
$$;

create or replace function public.tem_perfil(perfis public.perfil_equipe[])
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_perfil() = any (perfis), false)
$$;

create or replace function public.email_para_login(identificador text)
returns text
language sql stable security definer set search_path = public as $$
  with entrada as (
    select lower(trim(identificador)) as txt,
           regexp_replace(identificador, '\D', '', 'g') as digitos
  )
  select e.email_login
  from public.equipe e, entrada
  where e.ativo and (
       e.email = entrada.txt
    or e.usuario = entrada.txt
    or (length(entrada.digitos) >= 10 and (
         e.telefone = entrada.digitos
      or e.telefone = '55' || entrada.digitos))
  )
  limit 1
$$;
grant execute on function public.email_para_login(text) to anon, authenticated;

-- ---------- Configurações (linha única) ----------
create table public.configuracoes (
  id                 int primary key default 1 check (id = 1),
  mostrar_precos     boolean not null default true,   -- produto sem preço aparece "a confirmar"
  pedidos_pausados   boolean not null default false,
  whatsapp           text not null default '5537998262611',
  telefone           text not null default '5537998262611',
  aceita_entrega     boolean not null default true,   -- entrega por encomenda (taxa no painel)
  taxa_entrega       numeric(10,2),
  pedido_minimo      numeric(10,2),
  horario            text,                            -- texto livre; vazio = não aparece no site
  formas_pagamento   text[] not null default '{}',    -- vazio = não pergunta no pedido
  redes              jsonb not null default '{}'::jsonb,
  saida              jsonb not null default '{}'::jsonb,
  historia           text,
  atualizado_em      timestamptz not null default now()
);

-- ---------- Produtos ----------
-- estilo: 'destaque' = cartão grande com foto (Linha Mineira) · 'lista' = lista de sob encomenda
create table public.categorias (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  slug      text not null unique,
  descricao text,
  estilo    text not null default 'lista' check (estilo in ('destaque', 'lista')),
  ordem     int not null default 0,
  ativo     boolean not null default true
);

-- variacoes: [{ nome, preco, nota, foto_url, encomenda }]  ex.: Congelado / Assado
create table public.produtos (
  id            uuid primary key default gen_random_uuid(),
  categoria_id  uuid not null references public.categorias (id) on delete cascade,
  nome          text not null,
  slug          text not null unique,
  descricao     text,
  medida        text,                    -- ex.: "Bandeja com 20 unidades · aprox. 1 kg"
  preco         numeric(10,2),
  variacoes     jsonb not null default '[]'::jsonb,
  foto_url      text,
  foto_alt      text,
  tags          text[] not null default '{}',
  encomenda     boolean not null default false,  -- precisa marcar dia e horário
  disponivel    boolean not null default true,
  destaque      boolean not null default false,
  ordem         int not null default 0,
  atualizado_em timestamptz not null default now()
);
create index on public.produtos (categoria_id, ordem);

-- ---------- Conteúdo ----------
create table public.faq (
  id       uuid primary key default gen_random_uuid(),
  pergunta text not null,
  resposta text not null,
  ordem    int not null default 0,
  ativo    boolean not null default true
);

create table public.galeria (
  id      uuid primary key default gen_random_uuid(),
  url     text not null,
  legenda text,
  ordem   int not null default 0,
  ativo   boolean not null default true
);

create table public.posts (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  slug          text not null unique,
  resumo        text,
  conteudo      text not null default '',
  capa_url      text,
  publicado     boolean not null default false,
  publicado_em  timestamptz,
  atualizado_em timestamptz not null default now(),
  autor_id      uuid references public.equipe (id) on delete set null
);

-- ---------- Métricas (anônimas) ----------
create table public.eventos (
  id         bigint generated always as identity primary key,
  tipo       text not null,
  rotulo     text,
  pagina     text,
  sessao     text,
  criado_em  timestamptz not null default now(),
  constraint eventos_tamanhos check (length(tipo) <= 40 and coalesce(length(rotulo),0) <= 120 and coalesce(length(pagina),0) <= 200 and coalesce(length(sessao),0) <= 40)
);
create index eventos_criado_em_idx on public.eventos (criado_em desc);

-- ---------- Histórico ----------
create table public.historico (
  id          bigint generated always as identity primary key,
  membro_id   uuid references public.equipe (id) on delete set null,
  tabela      text not null,
  acao        text not null,
  registro_id text,
  criado_em   timestamptz not null default now()
);

create or replace function public.registrar_historico()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.historico (membro_id, tabela, acao, registro_id)
  values (auth.uid(), tg_table_name, lower(tg_op),
          coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'id', ''));
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['configuracoes','categorias','produtos','faq','galeria','posts','equipe']
  loop
    execute format('create trigger historico_%1$s after insert or update or delete on public.%1$s
                    for each row execute function public.registrar_historico()', t);
  end loop;
end $$;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.equipe        enable row level security;
alter table public.configuracoes enable row level security;
alter table public.categorias    enable row level security;
alter table public.produtos      enable row level security;
alter table public.faq           enable row level security;
alter table public.galeria       enable row level security;
alter table public.posts         enable row level security;
alter table public.eventos       enable row level security;
alter table public.historico     enable row level security;

create policy equipe_ler on public.equipe for select using (id = auth.uid() or public.tem_perfil('{dono}'));
create policy equipe_dono on public.equipe for all using (public.tem_perfil('{dono}')) with check (public.tem_perfil('{dono}'));

create policy config_ler on public.configuracoes for select using (true);
create policy config_editar on public.configuracoes for update
  using (public.tem_perfil('{dono,gerente,atendente}')) with check (public.tem_perfil('{dono,gerente,atendente}'));

create policy cat_ler on public.categorias for select using (ativo or public.meu_perfil() is not null);
create policy cat_editar on public.categorias for all using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));

create policy prod_ler on public.produtos for select using (true);
create policy prod_editar on public.produtos for all using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));
create policy prod_disponivel on public.produtos for update using (public.tem_perfil('{atendente}')) with check (public.tem_perfil('{atendente}'));

create policy faq_ler on public.faq for select using (ativo or public.meu_perfil() is not null);
create policy faq_editar on public.faq for all using (public.tem_perfil('{dono,gerente}')) with check (public.tem_perfil('{dono,gerente}'));

create policy gal_ler on public.galeria for select using (ativo or public.meu_perfil() is not null);
create policy gal_editar on public.galeria for all using (public.tem_perfil('{dono,gerente,social}')) with check (public.tem_perfil('{dono,gerente,social}'));

create policy posts_ler on public.posts for select using (publicado or public.meu_perfil() is not null);
create policy posts_editar on public.posts for all using (public.tem_perfil('{dono,gerente,social}')) with check (public.tem_perfil('{dono,gerente,social}'));

create policy eventos_inserir on public.eventos for insert with check (true);
create policy eventos_ler on public.eventos for select using (public.tem_perfil('{dono,gerente}'));

create policy historico_ler on public.historico for select using (public.tem_perfil('{dono}'));

-- ---------- Storage: fotos ----------
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) on conflict (id) do nothing;
create policy fotos_ler on storage.objects for select using (bucket_id = 'fotos');
create policy fotos_enviar on storage.objects for insert with check (bucket_id = 'fotos' and public.tem_perfil('{dono,gerente,social}'));
create policy fotos_alterar on storage.objects for update using (bucket_id = 'fotos' and public.tem_perfil('{dono,gerente,social}'));
create policy fotos_apagar on storage.objects for delete using (bucket_id = 'fotos' and public.tem_perfil('{dono,gerente,social}'));

-- =====================================================================
-- Equipe sem chave secreta (funções só para o Dono)
-- =====================================================================
create or replace function public.criar_membro(
  p_nome text, p_senha text, p_perfil public.perfil_equipe,
  p_telefone text default null, p_usuario text default null, p_email text default null
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_id uuid := gen_random_uuid();
  v_tel text := nullif(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g'), '');
  v_usuario text := nullif(lower(trim(coalesce(p_usuario, ''))), '');
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_login text;
  v_admin boolean := auth.uid() is null and session_user <> 'authenticator';
begin
  if not v_admin and not tem_perfil('{dono}') then
    raise exception 'Só o dono pode cadastrar pessoas na equipe';
  end if;
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  if v_tel is null and v_usuario is null and v_email is null then raise exception 'Informe telefone, usuário ou e-mail'; end if;
  if v_tel is not null and length(v_tel) in (10, 11) then v_tel := '55' || v_tel; end if;

  v_login := coalesce(v_email, 'u-' || replace(v_id::text, '-', '') || '@equipe.quitandasdadila.app');

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_login,
          crypt(p_senha, gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}', jsonb_build_object('nome', p_nome), now(), now(),
          '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_login, 'email_verified', true),
          'email', now(), now(), now());

  insert into equipe (id, nome, telefone, usuario, email, email_login, perfil)
  values (v_id, trim(p_nome), v_tel, v_usuario, v_email, v_login, p_perfil);
  return v_id;
end $$;

create or replace function public.redefinir_senha(p_id uuid, p_senha text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not (tem_perfil('{dono}') or p_id = auth.uid()) then raise exception 'Sem permissão'; end if;
  if length(coalesce(p_senha, '')) < 6 then raise exception 'A senha precisa ter pelo menos 6 caracteres'; end if;
  update auth.users set encrypted_password = crypt(p_senha, gen_salt('bf')), updated_at = now() where id = p_id;
end $$;

create or replace function public.definir_ativo(p_id uuid, p_ativo boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not tem_perfil('{dono}') then raise exception 'Sem permissão'; end if;
  if p_id = auth.uid() and not p_ativo then raise exception 'Você não pode desativar a si mesmo'; end if;
  update equipe set ativo = p_ativo where id = p_id;
  update auth.users set banned_until = case when p_ativo then null else 'infinity'::timestamptz end where id = p_id;
end $$;

revoke all on function public.criar_membro(text, text, public.perfil_equipe, text, text, text) from public, anon;
revoke all on function public.redefinir_senha(uuid, text) from public, anon;
revoke all on function public.definir_ativo(uuid, boolean) from public, anon;
grant execute on function public.criar_membro(text, text, public.perfil_equipe, text, text, text) to authenticated;
grant execute on function public.redefinir_senha(uuid, text) to authenticated;
grant execute on function public.definir_ativo(uuid, boolean) to authenticated;

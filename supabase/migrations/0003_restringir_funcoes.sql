-- Função de gatilho não precisa ser chamada pela API
revoke execute on function public.registrar_historico() from public, anon, authenticated;
-- meu_perfil/tem_perfil seguem liberadas: as regras de leitura (RLS) usam essas funções também para visitantes

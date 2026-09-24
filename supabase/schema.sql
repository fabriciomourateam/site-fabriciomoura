-- Rodar uma vez no Supabase (SQL Editor). Cria o armazenamento do CMS.
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
-- Sem políticas públicas: só o servidor do site (chave service_role) lê e grava.
alter table public.site_content enable row level security;

-- Bucket público para as imagens enviadas pelo painel
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

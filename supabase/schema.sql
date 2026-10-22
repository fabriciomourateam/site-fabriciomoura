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

-- Blog (migration 20261022230000_site_blog_posts no repo controle-de-pacientes).
-- Artigos novos e edições do /admin. Os posts importados do WordPress ficam em content/blog/*.json;
-- uma linha aqui com o mesmo slug SOBRESCREVE o arquivo (edição) ou o oculta (status draft/deleted).
create table if not exists public.blog_posts (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  seo_title text,
  description text,
  focus_kw text,
  image text,
  content text not null default '',
  status text not null default 'publish' check (status in ('publish', 'draft', 'deleted')),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text
);
alter table public.blog_posts enable row level security;

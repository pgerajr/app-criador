-- Já aplicada no projeto app-criador do Supabase.
create table public.brand_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome_marca text not null default '',
  nicho text not null default '',
  publico text not null default '',
  tom text not null default '',
  redes text[] not null default '{}',
  cores text not null default '',
  exemplos text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.brand_profiles enable row level security;

create policy "perfil: ler o próprio" on public.brand_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "perfil: criar o próprio" on public.brand_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "perfil: alterar o próprio" on public.brand_profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table public.messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index messages_user_created_idx on public.messages (user_id, created_at desc);

alter table public.messages enable row level security;

create policy "mensagens: ler as próprias" on public.messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "mensagens: criar as próprias" on public.messages
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "mensagens: apagar as próprias" on public.messages
  for delete to authenticated using ((select auth.uid()) = user_id);

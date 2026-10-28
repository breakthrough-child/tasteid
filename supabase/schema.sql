create table if not exists passports (
  id uuid primary key, secret_hash text not null, seeds jsonb not null default '[]', profile jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now());
create index if not exists passports_secret_hash on passports(secret_hash);
create table if not exists clients (
  id text primary key, name text not null, description text, redirect_uris text[] not null default '{}',
  secret_hash text, is_demo boolean default false);
create table if not exists grants (
  id uuid primary key, passport_id uuid not null, client_id text not null, scopes text[] not null default '{}',
  created_at timestamptz default now(), revoked_at timestamptz, last_used_at timestamptz);
create index if not exists grants_passport on grants(passport_id);
create table if not exists auth_codes (
  code text primary key, passport_id uuid not null, client_id text not null, scopes text[] not null,
  redirect_uri text not null, code_challenge text not null, expires_at timestamptz not null);
create table if not exists qloo_cache (key text primary key, body jsonb not null, expires_at timestamptz not null);
-- Demo clients (public PKCE clients). Redirect URIs are also enforced in code (lib/clients.ts) so they follow NEXT_PUBLIC_APP_URL.
insert into clients (id, name, description, redirect_uris, is_demo) values
 ('reelhouse','Reelhouse','Demo streaming app built to show TasteID integration','{}',true),
 ('forkful','Forkful','Demo dining app built to show TasteID integration','{}',true),
 ('threadline','Threadline','Demo shopping app built to show TasteID integration','{}',true),
 ('tasteid-console','TasteID Console','Developer try-it console','{}',true)
on conflict (id) do nothing;

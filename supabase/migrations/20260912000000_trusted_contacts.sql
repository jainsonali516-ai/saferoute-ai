-- Trusted contacts: the first real (Postgres-backed) table for SafeRoute AI.
-- userId is our own anonymous session id (see src/lib/server/auth.ts), not a
-- Supabase Auth user — there is no real auth system yet, so this table is
-- reached only through server-side API routes using the service_role key,
-- which already scope every query by that session's userId. No RLS policies
-- are defined because the table is never queried directly from the browser.

create table if not exists trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  phone_number text not null,
  relationship text not null check (relationship in ('Parent', 'Guardian', 'Friend', 'Relative', 'Other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trusted_contacts_user_id_idx on trusted_contacts (user_id);

alter table trusted_contacts enable row level security;

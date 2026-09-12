create table if not exists instruments (
  id bigint primary key generated always as identity,
  name text not null
);

alter table instruments enable row level security;

create policy "public can read instruments"
  on instruments for select
  to anon
  using (true);

insert into instruments (name)
values
  ('violin'),
  ('viola'),
  ('cello')
on conflict do nothing;

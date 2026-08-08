-- Shipments table: one row per tracked package.
create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  store text not null check (store in ('amazon', 'shein', 'temu', 'otro')),
  tracking_number text,
  amount_usd numeric(10, 2) not null check (amount_usd >= 0),
  order_date date not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'en_camino', 'recibido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_user_id_idx on shipments (user_id);
create index if not exists shipments_order_date_idx on shipments (order_date);

alter table shipments enable row level security;

create policy "Users manage their own shipments"
  on shipments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at current on every write.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger shipments_set_updated_at
  before update on shipments
  for each row
  execute function set_updated_at();

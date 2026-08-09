-- Identify the country from which the package is being shipped.
alter table shipments
  add column if not exists origin_country text not null default 'estados_unidos'
  check (origin_country in ('estados_unidos', 'espana'));

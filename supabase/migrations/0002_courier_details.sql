-- Add the courier workflow and the information received by email.
alter table shipments
  drop constraint if exists shipments_status_check;

alter table shipments
  add constraint shipments_status_check check (
    status in (
      'pendiente',
      'en_camino',
      'en_courier',
      'consolidacion_solicitada',
      'enviado_courier',
      'recibido'
    )
  ),
  add column if not exists shipping_carrier text,
  add column if not exists courier_prealerted boolean not null default false,
  add column if not exists courier_prealerted_at date,
  add column if not exists courier_received_at date,
  add column if not exists consolidation_requested_at date,
  add column if not exists shipping_quote_usd numeric(10, 2)
    check (shipping_quote_usd is null or shipping_quote_usd >= 0),
  add column if not exists email_details text,
  add column if not exists notes text;

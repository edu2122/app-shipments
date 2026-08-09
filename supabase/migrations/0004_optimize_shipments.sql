-- Optimize the authenticated user's most common shipment query.
create index if not exists shipments_user_order_date_idx
  on shipments (user_id, order_date desc);

-- Evaluate auth.uid() once per statement instead of once per row.
drop policy if exists "Users manage their own shipments" on shipments;

create policy "Users manage their own shipments"
  on shipments
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

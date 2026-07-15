
-- Process BUY order: update wallet gold + mark order complete
create or replace function public.process_buy_order(
  p_user_id uuid,
  p_order_id uuid,
  p_weight_grams numeric,
  p_weight_ounces numeric,
  p_customer_email text,
  p_customer_name text,
  p_payment_intent text
)
returns void language plpgsql security definer as $$
begin
  -- Update order status
  update public.orders
  set
    status = 'completed',
    completed_at = now(),
    customer_email = p_customer_email,
    customer_name = p_customer_name,
    stripe_payment_intent_id = p_payment_intent
  where id = p_order_id and status = 'pending';

  -- Add gold to wallet
  update public.wallets
  set
    gold_grams = gold_grams + p_weight_grams,
    gold_ounces = gold_ounces + p_weight_ounces,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

-- Process SELL order: deduct wallet gold + add cash proceeds + mark order complete
create or replace function public.process_sell_order(
  p_user_id uuid,
  p_order_id uuid,
  p_weight_grams numeric,
  p_weight_ounces numeric,
  p_total_usd numeric
)
returns void language plpgsql security definer as $$
begin
  -- Check sufficient gold
  if (select gold_grams from public.wallets where user_id = p_user_id) < p_weight_grams then
    raise exception 'Insufficient gold holdings';
  end if;

  -- Update order status
  update public.orders
  set status = 'completed', completed_at = now()
  where id = p_order_id and status = 'pending';

  -- Deduct gold, add cash
  update public.wallets
  set
    gold_grams = gold_grams - p_weight_grams,
    gold_ounces = gold_ounces - p_weight_ounces,
    cash_balance_usd = cash_balance_usd + p_total_usd,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

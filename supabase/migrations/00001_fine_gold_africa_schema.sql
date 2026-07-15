
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Enum types
create type user_role as enum ('individual', 'corporate');
create type kyc_status as enum ('pending', 'approved', 'rejected');
create type order_type as enum ('buy', 'sell');
create type order_status as enum ('pending', 'completed', 'cancelled', 'failed');
create type product_type as enum ('gold_bars', 'gold_nuggets', 'gold_dust', 'bulk_supply');

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  company_name text,
  role user_role not null default 'individual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- KYC Verifications
create table public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null default 'government_id',
  document_path text,
  license_path text,
  status kyc_status not null default 'pending',
  admin_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Wallets
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  gold_ounces numeric(18, 6) not null default 0,
  gold_grams numeric(18, 6) not null default 0,
  cash_balance_usd numeric(18, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_type order_type not null,
  product_type product_type not null,
  weight_grams numeric(18, 6) not null,
  weight_ounces numeric(18, 6) not null,
  spot_price_per_oz numeric(18, 4) not null,
  spot_price_per_gram numeric(18, 4) not null,
  subtotal_usd numeric(18, 2) not null,
  processing_fee_usd numeric(18, 2) not null,
  total_usd numeric(18, 2) not null,
  status order_status not null default 'pending',
  reference_code text not null unique,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_kyc_user_id on public.kyc_verifications(user_id);
create index idx_kyc_status on public.kyc_verifications(status);
create index idx_wallets_user_id on public.wallets(user_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_reference on public.orders(reference_code);
create index idx_orders_stripe_session on public.orders(stripe_session_id);

-- Auto-generate reference codes
create or replace function generate_reference_code()
returns trigger language plpgsql as $$
begin
  new.reference_code := 'FGA-' || upper(substring(gen_random_uuid()::text, 1, 8));
  return new;
end;
$$;

create trigger orders_reference_code
  before insert on public.orders
  for each row
  when (new.reference_code is null or new.reference_code = '')
  execute function generate_reference_code();

-- Auto-create wallet and profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'individual')
  );
  insert into public.wallets (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function update_updated_at();
create trigger kyc_updated_at before update on public.kyc_verifications for each row execute function update_updated_at();
create trigger wallets_updated_at before update on public.wallets for each row execute function update_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function update_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.kyc_verifications enable row level security;
alter table public.wallets enable row level security;
alter table public.orders enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Service role full access profiles" on public.profiles for all using (auth.jwt()->>'role' = 'service_role');

-- KYC policies
create policy "Users can view own KYC" on public.kyc_verifications for select using (auth.uid() = user_id);
create policy "Users can insert own KYC" on public.kyc_verifications for insert with check (auth.uid() = user_id);
create policy "Users can update own KYC" on public.kyc_verifications for update using (auth.uid() = user_id);
create policy "Service role full access KYC" on public.kyc_verifications for all using (auth.jwt()->>'role' = 'service_role');

-- Wallet policies
create policy "Users can view own wallet" on public.wallets for select using (auth.uid() = user_id);
create policy "Service role full access wallets" on public.wallets for all using (auth.jwt()->>'role' = 'service_role');

-- Order policies
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Service role full access orders" on public.orders for all using (auth.jwt()->>'role' = 'service_role');

-- Storage bucket for KYC documents
insert into storage.buckets (id, name, public) values ('kyc-documents', 'kyc-documents', false);
create policy "Users upload own KYC docs" on storage.objects for insert with check (bucket_id = 'kyc-documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users view own KYC docs" on storage.objects for select using (bucket_id = 'kyc-documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Service role access KYC docs" on storage.objects for all using (bucket_id = 'kyc-documents' and auth.jwt()->>'role' = 'service_role');

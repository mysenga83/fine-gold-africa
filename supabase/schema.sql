-- ============================================================
-- SECTION: SCHEMA
-- ============================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS "public";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pgcrypto"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";


--
-- Name: EXTENSION "supabase_vault"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "supabase_vault" IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: kyc_status; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'kyc_status'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."kyc_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'order_status'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'completed',
    'cancelled',
    'failed'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: order_type; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'order_type'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."order_type" AS ENUM (
    'buy',
    'sell'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: product_type; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'product_type'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."product_type" AS ENUM (
    'gold_bars',
    'gold_nuggets',
    'gold_dust',
    'bulk_supply'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'user_role'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."user_role" AS ENUM (
    'individual',
    'corporate'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: generate_reference_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."generate_reference_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.reference_code := 'FGA-' || upper(substring(gen_random_uuid()::text, 1, 8));
  return new;
end;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


--
-- Name: process_buy_order("uuid", "uuid", numeric, numeric, "text", "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."process_buy_order"("p_user_id" "uuid", "p_order_id" "uuid", "p_weight_grams" numeric, "p_weight_ounces" numeric, "p_customer_email" "text", "p_customer_name" "text", "p_payment_intent" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


--
-- Name: process_sell_order("uuid", "uuid", numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."process_sell_order"("p_user_id" "uuid", "p_order_id" "uuid", "p_weight_grams" numeric, "p_weight_ounces" numeric, "p_total_usd" numeric) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


--
-- Name: update_inbound_leads_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."update_inbound_leads_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: banner_slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."banner_slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "subtitle" "text",
    "media_url" "text" NOT NULL,
    "media_type" "text" DEFAULT 'image'::"text" NOT NULL,
    "link_url" "text",
    "sort_order" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "banner_slides_media_type_check" CHECK (("media_type" = ANY (ARRAY['image'::"text", 'video'::"text"])))
);


--
-- Name: inbound_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."inbound_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_person" "text" NOT NULL,
    "corporate_email" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "inquiry_type" "text" NOT NULL,
    "volume_scale" "text",
    "message" "text",
    "document_requested" boolean DEFAULT false,
    "document_email" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "inbound_leads_inquiry_type_check" CHECK (("inquiry_type" = ANY (ARRAY['bulk_purchase'::"text", 'investor_relations'::"text"]))),
    CONSTRAINT "inbound_leads_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'qualified'::"text", 'closed'::"text"])))
);


--
-- Name: kyc_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."kyc_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "document_type" "text" DEFAULT 'government_id'::"text" NOT NULL,
    "document_path" "text",
    "license_path" "text",
    "status" "public"."kyc_status" DEFAULT 'pending'::"public"."kyc_status" NOT NULL,
    "admin_notes" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_type" "public"."order_type" NOT NULL,
    "product_type" "public"."product_type" NOT NULL,
    "weight_grams" numeric(18,6) NOT NULL,
    "weight_ounces" numeric(18,6) NOT NULL,
    "spot_price_per_oz" numeric(18,4) NOT NULL,
    "spot_price_per_gram" numeric(18,4) NOT NULL,
    "subtotal_usd" numeric(18,2) NOT NULL,
    "processing_fee_usd" numeric(18,2) NOT NULL,
    "total_usd" numeric(18,2) NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "reference_code" "text" NOT NULL,
    "stripe_session_id" "text",
    "stripe_payment_intent_id" "text",
    "customer_email" "text",
    "customer_name" "text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "subtitle" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "purity_range" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text",
    "video_url" "text",
    "min_weight_grams" numeric DEFAULT 1 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "company_name" "text",
    "role" "public"."user_role" DEFAULT 'individual'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."wallets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "gold_ounces" numeric(18,6) DEFAULT 0 NOT NULL,
    "gold_grams" numeric(18,6) DEFAULT 0 NOT NULL,
    "cash_balance_usd" numeric(18,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: banner_slides banner_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'banner_slides_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'banner_slides'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."banner_slides"
    ADD CONSTRAINT "banner_slides_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: inbound_leads inbound_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'inbound_leads_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'inbound_leads'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."inbound_leads"
    ADD CONSTRAINT "inbound_leads_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: kyc_verifications kyc_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'kyc_verifications_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'kyc_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."kyc_verifications"
    ADD CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: kyc_verifications kyc_verifications_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'kyc_verifications_user_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'kyc_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."kyc_verifications"
    ADD CONSTRAINT "kyc_verifications_user_id_key" UNIQUE ("user_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'orders_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders orders_reference_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'orders_reference_code_key'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_reference_code_key" UNIQUE ("reference_code");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders orders_stripe_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'orders_stripe_session_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_stripe_session_id_key" UNIQUE ("stripe_session_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'products_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'products'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'profiles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'wallets_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'wallets'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'wallets_user_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'wallets'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_user_id_key" UNIQUE ("user_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: idx_kyc_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_kyc_status" ON "public"."kyc_verifications" USING "btree" ("status");


--
-- Name: idx_kyc_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_kyc_user_id" ON "public"."kyc_verifications" USING "btree" ("user_id");


--
-- Name: idx_orders_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_orders_reference" ON "public"."orders" USING "btree" ("reference_code");


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "public"."orders" USING "btree" ("status");


--
-- Name: idx_orders_stripe_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_orders_stripe_session" ON "public"."orders" USING "btree" ("stripe_session_id");


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");


--
-- Name: idx_wallets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS "idx_wallets_user_id" ON "public"."wallets" USING "btree" ("user_id");


--
-- Name: kyc_verifications kyc_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "kyc_updated_at" BEFORE UPDATE ON "public"."kyc_verifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: orders orders_reference_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "orders_reference_code" BEFORE INSERT ON "public"."orders" FOR EACH ROW WHEN ((("new"."reference_code" IS NULL) OR ("new"."reference_code" = ''::"text"))) EXECUTE FUNCTION "public"."generate_reference_code"();


--
-- Name: orders orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: profiles profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: inbound_leads trg_inbound_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "trg_inbound_leads_updated_at" BEFORE UPDATE ON "public"."inbound_leads" FOR EACH ROW EXECUTE FUNCTION "public"."update_inbound_leads_updated_at"();


--
-- Name: wallets wallets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "wallets_updated_at" BEFORE UPDATE ON "public"."wallets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: kyc_verifications kyc_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'kyc_verifications_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'kyc_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."kyc_verifications"
    ADD CONSTRAINT "kyc_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'orders_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'profiles_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'wallets_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'wallets'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: kyc_verifications Service role full access KYC; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Service role full access KYC'
      AND n.nspname = 'public'
      AND c.relname = 'kyc_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Service role full access KYC" ON "public"."kyc_verifications" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders Service role full access orders; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Service role full access orders'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Service role full access orders" ON "public"."orders" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles Service role full access profiles; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Service role full access profiles'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Service role full access profiles" ON "public"."profiles" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: wallets Service role full access wallets; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Service role full access wallets'
      AND n.nspname = 'public'
      AND c.relname = 'wallets'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Service role full access wallets" ON "public"."wallets" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: kyc_verifications Users can insert own KYC; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can insert own KYC'
      AND n.nspname = 'public'
      AND c.relname = 'kyc_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can insert own KYC" ON "public"."kyc_verifications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can insert own profile'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: kyc_verifications Users can update own KYC; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can update own KYC'
      AND n.nspname = 'public'
      AND c.relname = 'kyc_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can update own KYC" ON "public"."kyc_verifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can update own profile'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: kyc_verifications Users can view own KYC; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can view own KYC'
      AND n.nspname = 'public'
      AND c.relname = 'kyc_verifications'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can view own KYC" ON "public"."kyc_verifications" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: orders Users can view own orders; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can view own orders'
      AND n.nspname = 'public'
      AND c.relname = 'orders'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can view own profile'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: wallets Users can view own wallet; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users can view own wallet'
      AND n.nspname = 'public'
      AND c.relname = 'wallets'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "Users can view own wallet" ON "public"."wallets" FOR SELECT USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: banner_slides auth_manage_slides; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'auth_manage_slides'
      AND n.nspname = 'public'
      AND c.relname = 'banner_slides'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "auth_manage_slides" ON "public"."banner_slides" TO "authenticated" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: inbound_leads auth_read; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'auth_read'
      AND n.nspname = 'public'
      AND c.relname = 'inbound_leads'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "auth_read" ON "public"."inbound_leads" FOR SELECT TO "authenticated" USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: banner_slides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."banner_slides" ENABLE ROW LEVEL SECURITY;

--
-- Name: inbound_leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."inbound_leads" ENABLE ROW LEVEL SECURITY;

--
-- Name: kyc_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."kyc_verifications" ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

--
-- Name: products products_public_select; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'products_public_select'
      AND n.nspname = 'public'
      AND c.relname = 'products'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "products_public_select" ON "public"."products" FOR SELECT USING (("active" = true));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: products products_service_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'products_service_all'
      AND n.nspname = 'public'
      AND c.relname = 'products'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "products_service_all" ON "public"."products" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: inbound_leads public_insert; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'public_insert'
      AND n.nspname = 'public'
      AND c.relname = 'inbound_leads'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "public_insert" ON "public"."inbound_leads" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: banner_slides public_read_slides; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'public_read_slides'
      AND n.nspname = 'public'
      AND c.relname = 'banner_slides'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "public_read_slides" ON "public"."banner_slides" FOR SELECT TO "authenticated", "anon" USING (("active" = true));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: banner_slides service_all_slides; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'service_all_slides'
      AND n.nspname = 'public'
      AND c.relname = 'banner_slides'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "service_all_slides" ON "public"."banner_slides" TO "service_role" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: inbound_leads service_role_all; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'service_role_all'
      AND n.nspname = 'public'
      AND c.relname = 'inbound_leads'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "service_role_all" ON "public"."inbound_leads" TO "service_role" USING (true) WITH CHECK (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: wallets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."wallets" ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




-- ============================================================
-- SECTION: DIFF FILTER OBJECTS
-- ============================================================
-- Objects that match diff-filter.json but cannot be represented
-- precisely by pg_dump --filter.

-- auth.users trigger: on_auth_user_created
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT t.tgisinternal
      AND t.tgname = 'on_auth_user_created'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
  ) THEN
    EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();';
  END IF;
END
$pg_schema_restore$;
-- policy: "Service role access KYC docs" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Service role access KYC docs'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role access KYC docs" ON storage.objects AS PERMISSIVE FOR ALL TO PUBLIC USING (((bucket_id = ''kyc-documents''::text) AND ((auth.jwt() ->> ''role''::text) = ''service_role''::text)));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Users upload own KYC docs" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users upload own KYC docs'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users upload own KYC docs" ON storage.objects AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((bucket_id = ''kyc-documents''::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));';
  END IF;
END
$pg_schema_restore$;
-- policy: "Users view own KYC docs" on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'Users view own KYC docs'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users view own KYC docs" ON storage.objects AS PERMISSIVE FOR SELECT TO PUBLIC USING (((bucket_id = ''kyc-documents''::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));';
  END IF;
END
$pg_schema_restore$;
-- policy: banner_media_auth_delete on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'banner_media_auth_delete'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY banner_media_auth_delete ON storage.objects AS PERMISSIVE FOR DELETE TO PUBLIC USING ((bucket_id = ''banner-media''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: banner_media_auth_write on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'banner_media_auth_write'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY banner_media_auth_write ON storage.objects AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((bucket_id = ''banner-media''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: banner_media_public_read on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'banner_media_public_read'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY banner_media_public_read ON storage.objects AS PERMISSIVE FOR SELECT TO PUBLIC USING ((bucket_id = ''banner-media''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: product_media_auth_delete on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'product_media_auth_delete'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY product_media_auth_delete ON storage.objects AS PERMISSIVE FOR DELETE TO PUBLIC USING ((bucket_id = ''product-media''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: product_media_auth_write on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'product_media_auth_write'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY product_media_auth_write ON storage.objects AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((bucket_id = ''product-media''::text));';
  END IF;
END
$pg_schema_restore$;
-- policy: product_media_public_read on storage.objects
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'product_media_public_read'
      AND n.nspname = 'storage'
      AND c.relname = 'objects'
  ) THEN
    EXECUTE 'CREATE POLICY product_media_public_read ON storage.objects AS PERMISSIVE FOR SELECT TO PUBLIC USING ((bucket_id = ''product-media''::text));';
  END IF;
END
$pg_schema_restore$;

-- ============================================================
-- SECTION: STORAGE BUCKETS DATA
-- ============================================================

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('banner-media', 'banner-media', NULL, '2026-07-05 19:01:20.305234+00', '2026-07-05 19:01:20.305234+00', 'true', 'false', '104857600', '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime}', NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('kyc-documents', 'kyc-documents', NULL, '2026-07-04 15:01:29.320049+00', '2026-07-04 15:01:29.320049+00', 'false', 'false', NULL, NULL, NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES ('product-media', 'product-media', NULL, '2026-07-05 19:01:20.305234+00', '2026-07-05 19:01:20.305234+00', 'true', 'false', '52428800', '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime}', NULL, 'STANDARD') ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "owner" = EXCLUDED."owner", "created_at" = EXCLUDED."created_at", "updated_at" = EXCLUDED."updated_at", "public" = EXCLUDED."public", "avif_autodetection" = EXCLUDED."avif_autodetection", "file_size_limit" = EXCLUDED."file_size_limit", "allowed_mime_types" = EXCLUDED."allowed_mime_types", "owner_id" = EXCLUDED."owner_id", "type" = EXCLUDED."type";

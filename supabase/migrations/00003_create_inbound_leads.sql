
CREATE TABLE IF NOT EXISTS public.inbound_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  corporate_email text NOT NULL,
  phone_number text NOT NULL,
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('bulk_purchase','investor_relations')),
  volume_scale text,
  message text,
  document_requested boolean DEFAULT false,
  document_email text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.inbound_leads ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "service_role_all" ON public.inbound_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anyone can insert (lead submission is public)
CREATE POLICY "public_insert" ON public.inbound_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated admins can read
CREATE POLICY "auth_read" ON public.inbound_leads
  FOR SELECT TO authenticated USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_inbound_leads_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_inbound_leads_updated_at ON public.inbound_leads;
CREATE TRIGGER trg_inbound_leads_updated_at
  BEFORE UPDATE ON public.inbound_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_inbound_leads_updated_at();

-- Banner media table for admin-uploaded slides
CREATE TABLE IF NOT EXISTS public.banner_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  link_url text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_slides" ON public.banner_slides FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "service_all_slides" ON public.banner_slides FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_manage_slides" ON public.banner_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);

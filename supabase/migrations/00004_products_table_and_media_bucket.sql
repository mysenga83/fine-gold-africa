
-- Products table for admin-managed catalog
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text NOT NULL,
  name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  purity_range text NOT NULL DEFAULT '',
  image_url text,
  video_url text,
  min_weight_grams numeric NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "products_public_select" ON products
  FOR SELECT USING (active = true);

-- Authenticated admin can do everything (we'll check email on server; use service role for writes)
CREATE POLICY "products_service_all" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for product images/videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  52428800,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket for banner media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner-media',
  'banner-media',
  true,
  104857600,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Public storage policies
CREATE POLICY "product_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');

CREATE POLICY "product_media_auth_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-media');

CREATE POLICY "product_media_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-media');

CREATE POLICY "banner_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'banner-media');

CREATE POLICY "banner_media_auth_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banner-media');

CREATE POLICY "banner_media_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'banner-media');

-- Seed default products from existing catalog
INSERT INTO products (product_type, name, subtitle, description, purity_range, image_url, min_weight_grams, sort_order) VALUES
(
  'gold_bars', 'Gold Bars', 'Refined Bullion',
  'LBMA-standard refined gold bars, available from 1g to 400oz. Each bar is hallmarked with serial number, assay certificate, and purity stamp. Ideal for institutional allocation and reserve holdings.',
  '99.5% – 99.99%',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_383da6be-f737-4e02-9c17-9877146627f7.jpg',
  1, 1
),
(
  'gold_nuggets', 'Gold Nuggets', 'High-Purity Raw Form',
  'Naturally formed alluvial and primary gold nuggets sourced from certified West and Central African operations. Each lot undergoes XRF spectrometry testing before dispatch.',
  '97% – 99.5%',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d243eed4-ead0-4798-bd7f-5039e7958908.jpg',
  5, 2
),
(
  'gold_dust', 'Gold Dust', 'Alluvial Composition',
  'Fine alluvial gold dust from artisanal and small-scale mining (ASM) operations verified under OECD compliance frameworks. Packaged in sealed, tamper-evident assay pouches.',
  '96% – 98%',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3c0f72f7-c913-4e23-b523-29355b83c688.jpg',
  10, 3
),
(
  'bulk_supply', 'Bulk Gold Supply', 'Industrial Volume',
  'Large-volume gold supply contracts for refineries, jewellery manufacturers, and institutional buyers. Minimum 1kg lots with custom purity grading and dedicated account management.',
  '96% – 99.99%',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_55c343d9-d299-4cf3-8e3e-e325d4d46a79.jpg',
  1000, 4
);

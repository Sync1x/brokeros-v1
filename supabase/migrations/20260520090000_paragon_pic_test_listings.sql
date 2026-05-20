-- Paragon/PIC RESO Web API test dataset cache columns for BrokerOS listings.
-- Manual listings continue to use the existing create flow; MLS-backed rows use source='paragon_test'.

ALTER TABLE public.house_profiles ALTER COLUMN seller_lead_id DROP NOT NULL;

ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS mls_provider text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS mls_dataset_id text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS mls_listing_key text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS mls_listing_id text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS mls_status text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS mls_modified_at timestamptz;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS raw_mls_json jsonb;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS media_json jsonb;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS primary_photo_url text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS zip text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS lot_size_acres numeric;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS garage_spaces numeric;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS garage_yn boolean;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS waterfront_yn boolean;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS property_sub_type text;
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS remarks text;

UPDATE public.house_profiles
SET source = 'manual'
WHERE source IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS house_profiles_mls_identity_idx
  ON public.house_profiles (mls_provider, mls_dataset_id, mls_listing_key)
  WHERE mls_provider IS NOT NULL
    AND mls_dataset_id IS NOT NULL
    AND mls_listing_key IS NOT NULL;

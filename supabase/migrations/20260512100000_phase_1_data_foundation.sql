-- Phase 1: BrokerOS lead-to-listing matching data foundation (no UI).
-- Reshapes public.leads; adds buyer_profiles, house_profiles, town_adjacency, matches.
-- Does not touch google_calendar_tokens, listings, users, or drop lead_listing_matches.

-- ---------------------------------------------------------------------------
-- leads: drop FK that blocks removing assigned_listing_key (if present)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'leads'
      AND c.contype = 'f'
      AND pg_get_constraintdef(c.oid) ILIKE '%assigned_listing_key%'
  LOOP
    EXECUTE format('ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- leads: rename legacy columns
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'type'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'lead_type'
  ) THEN
    ALTER TABLE public.leads RENAME COLUMN type TO lead_type;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'notes'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'notes_md'
  ) THEN
    ALTER TABLE public.leads RENAME COLUMN notes TO notes_md;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- leads: drop buyer-specific CRM columns (Phase 1 uses buyer_profiles)
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads DROP COLUMN IF EXISTS price_min;
ALTER TABLE public.leads DROP COLUMN IF EXISTS price_max;
ALTER TABLE public.leads DROP COLUMN IF EXISTS bedrooms_wanted;
ALTER TABLE public.leads DROP COLUMN IF EXISTS bathrooms_wanted;
ALTER TABLE public.leads DROP COLUMN IF EXISTS preferred_city;
ALTER TABLE public.leads DROP COLUMN IF EXISTS assigned_listing_key;

-- ---------------------------------------------------------------------------
-- leads: add new columns if missing
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_type text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS temperature text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes_md text;

-- Backfill nullable text columns for NOT NULL migration
UPDATE public.leads
SET lead_type = 'buyer'
WHERE lead_type IS NULL OR trim(lead_type) = '';

UPDATE public.leads
SET name = coalesce(nullif(trim(name), ''), 'Unknown lead')
WHERE name IS NULL OR trim(name) = '';

ALTER TABLE public.leads ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.leads ALTER COLUMN lead_type SET NOT NULL;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_lead_type_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_lead_type_check
  CHECK (lead_type IN ('buyer', 'seller'));

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_temperature_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_temperature_check
  CHECK (temperature IS NULL OR temperature IN ('hot', 'warm', 'cold'));

-- ---------------------------------------------------------------------------
-- buyer_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  lead_id uuid NOT NULL PRIMARY KEY REFERENCES public.leads (id) ON DELETE CASCADE,
  budget_max integer,
  bedrooms_min numeric,
  bathrooms_min numeric,
  property_type text,
  location_primary text,
  must_haves text[] NOT NULL DEFAULT '{}',
  nice_to_haves text[] NOT NULL DEFAULT '{}',
  dealbreakers text[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- house_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.house_profiles (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_lead_id uuid NOT NULL REFERENCES public.leads (id) ON DELETE CASCADE,
  address text,
  town text,
  beds numeric,
  baths numeric,
  sqft integer,
  property_type text,
  features text[] NOT NULL DEFAULT '{}',
  list_price integer,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS house_profiles_seller_lead_id_idx ON public.house_profiles (seller_lead_id);
CREATE INDEX IF NOT EXISTS house_profiles_town_idx ON public.house_profiles (town);

ALTER TABLE public.house_profiles ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- town_adjacency
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.town_adjacency (
  primary_town text NOT NULL,
  adjacent_town text NOT NULL,
  tier integer NOT NULL CHECK (tier IN (1, 2)),
  PRIMARY KEY (primary_town, adjacent_town)
);

ALTER TABLE public.town_adjacency ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- matches (buyer lead x house profile scores)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_lead_id uuid NOT NULL REFERENCES public.leads (id) ON DELETE CASCADE,
  house_profile_id uuid NOT NULL REFERENCES public.house_profiles (id) ON DELETE CASCADE,
  score numeric NOT NULL,
  score_breakdown_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_buyer_house_unique UNIQUE (buyer_lead_id, house_profile_id)
);

CREATE INDEX IF NOT EXISTS matches_buyer_lead_id_idx ON public.matches (buyer_lead_id);
CREATE INDEX IF NOT EXISTS matches_house_profile_id_idx ON public.matches (house_profile_id);
CREATE INDEX IF NOT EXISTS matches_score_desc_idx ON public.matches (score DESC);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

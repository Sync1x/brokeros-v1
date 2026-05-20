-- BrokerOS tenancy columns.
-- Listings are shared inside a Clerk org/brokerage. Leads and matches are owned by agents.
-- Keep these columns nullable until current data has been backfilled and verified.

ALTER TABLE public.house_profiles
  ADD COLUMN IF NOT EXISTS org_id text;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS org_id text,
  ADD COLUMN IF NOT EXISTS owner_user_id text;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS org_id text,
  ADD COLUMN IF NOT EXISTS owner_user_id text;

CREATE INDEX IF NOT EXISTS house_profiles_org_id_idx
  ON public.house_profiles (org_id);

CREATE INDEX IF NOT EXISTS leads_org_owner_idx
  ON public.leads (org_id, owner_user_id);

CREATE INDEX IF NOT EXISTS matches_org_owner_idx
  ON public.matches (org_id, owner_user_id);

DROP INDEX IF EXISTS public.house_profiles_mls_identity_idx;

CREATE UNIQUE INDEX house_profiles_mls_identity_idx
  ON public.house_profiles (org_id, mls_provider, mls_dataset_id, mls_listing_key)
  WHERE org_id IS NOT NULL
    AND mls_provider IS NOT NULL
    AND mls_dataset_id IS NOT NULL
    AND mls_listing_key IS NOT NULL;

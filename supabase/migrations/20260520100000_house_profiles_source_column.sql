-- Ensure production house_profiles has the source discriminator used by
-- BrokerOS listing reads and Paragon test syncs.

ALTER TABLE public.house_profiles
  ADD COLUMN IF NOT EXISTS source text;

ALTER TABLE public.house_profiles
  ALTER COLUMN source SET DEFAULT 'manual';

UPDATE public.house_profiles
SET source = 'manual'
WHERE source IS NULL;

ALTER TABLE public.house_profiles
  ALTER COLUMN source SET NOT NULL;

CREATE INDEX IF NOT EXISTS house_profiles_source_idx
  ON public.house_profiles (source);

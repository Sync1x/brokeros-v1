-- Phase 2: Controlled vocabulary foundation only.
-- Creates shared canonical terms for buyer criteria and home profile features.
-- Does not create matches, matching triggers, UI, integrations, or touch google_calendar_tokens.

-- ---------------------------------------------------------------------------
-- feature_terms
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feature_terms (
  key text PRIMARY KEY,
  label text NOT NULL,
  category text,
  aliases text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_terms ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- property_type_terms
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_type_terms (
  key text PRIMARY KEY,
  label text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_type_terms ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- canonical key columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.buyer_profiles ADD COLUMN IF NOT EXISTS must_have_keys text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.buyer_profiles ADD COLUMN IF NOT EXISTS nice_to_have_keys text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.buyer_profiles ADD COLUMN IF NOT EXISTS dealbreaker_keys text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.buyer_profiles ADD COLUMN IF NOT EXISTS property_type_key text;

ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS feature_keys text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.house_profiles ADD COLUMN IF NOT EXISTS property_type_key text;

-- ---------------------------------------------------------------------------
-- feature vocabulary
-- ---------------------------------------------------------------------------
INSERT INTO public.feature_terms (key, label, category, aliases, active)
VALUES
  ('lakefront', 'Lakefront', 'waterfront', ARRAY['lake front', 'on the lake', 'lake frontage', 'waterfront lake'], true),
  ('waterfront', 'Waterfront', 'waterfront', ARRAY['water frontage', 'on water', 'waterfront property'], true),
  ('river_frontage', 'River frontage', 'waterfront', ARRAY['riverfront', 'on the river', 'river frontage'], true),
  ('pond_frontage', 'Pond frontage', 'waterfront', ARRAY['pond front', 'on pond', 'private pond', 'pondfront'], true),
  ('mountain_view', 'Mountain view', 'view', ARRAY['mountain views', 'views', 'mountain scenery'], true),
  ('valley_view', 'Valley view', 'view', ARRAY['valley views', 'open valley view'], true),
  ('acreage', 'Acreage', 'land', ARRAY['acres', 'large lot', 'big parcel', 'large parcel'], true),
  ('open_land', 'Open land', 'land', ARRAY['open field', 'fields', 'meadow', 'cleared land'], true),
  ('wooded', 'Wooded', 'land', ARRAY['forested', 'woods', 'wooded lot', 'timber'], true),
  ('pasture', 'Pasture', 'land', ARRAY['grazing land', 'field pasture', 'animal pasture'], true),
  ('barn', 'Barn', 'structures', ARRAY['barns', 'horse barn', 'dairy barn'], true),
  ('outbuilding', 'Outbuilding', 'structures', ARRAY['shed', 'storage building', 'utility building'], true),
  ('garage', 'Garage', 'structures', ARRAY['attached garage', 'detached garage', 'car garage'], true),
  ('workshop', 'Workshop', 'structures', ARRAY['shop', 'work space', 'workspace', 'tool shop'], true),
  ('private_driveway', 'Private driveway', 'access', ARRAY['long driveway', 'secluded drive', 'private road'], true),
  ('rural', 'Rural', 'location', ARRAY['country', 'countryside', 'quiet rural'], true),
  ('in_town', 'In town', 'location', ARRAY['village', 'walkable town', 'town center', 'downtown'], true),
  ('near_burke_mountain', 'Near Burke Mountain', 'recreation', ARRAY['Burke Mountain', 'close to Burke', 'near ski mountain'], true),
  ('near_vast_trails', 'Near VAST trails', 'recreation', ARRAY['VAST trails', 'snowmobile trails', 'near snowmobile trails'], true),
  ('near_kingdom_trails', 'Near Kingdom Trails', 'recreation', ARRAY['Kingdom Trails', 'bike trails', 'mountain bike trails'], true),
  ('ski_access', 'Ski access', 'recreation', ARRAY['near skiing', 'ski area', 'ski mountain'], true),
  ('deck', 'Deck', 'exterior', ARRAY['back deck', 'front deck', 'large deck'], true),
  ('balcony', 'Balcony', 'exterior', ARRAY['private balcony', 'upper balcony'], true),
  ('porch', 'Porch', 'exterior', ARRAY['covered porch', 'front porch', 'screened porch'], true),
  ('mudroom', 'Mudroom', 'interior', ARRAY['entry room', 'boot room', 'coat room'], true),
  ('wood_stove', 'Wood stove', 'heating', ARRAY['wood stove', 'woodstove', 'wood-burning stove', 'wood heat'], true),
  ('fireplace', 'Fireplace', 'heating', ARRAY['stone fireplace', 'gas fireplace', 'hearth'], true),
  ('renovated_kitchen', 'Renovated kitchen', 'interior', ARRAY['updated kitchen', 'modern kitchen', 'new kitchen'], true),
  ('first_floor_bedroom', 'First-floor bedroom', 'accessibility', ARRAY['main-floor bedroom', 'main floor bedroom', 'bedroom on first floor'], true),
  ('first_floor_bathroom', 'First-floor bathroom', 'accessibility', ARRAY['main-floor bath', 'main floor bath', 'bathroom on first floor'], true),
  ('finished_basement', 'Finished basement', 'interior', ARRAY['finished lower level', 'basement living area'], true),
  ('walkout_basement', 'Walkout basement', 'interior', ARRAY['walk-out basement', 'daylight basement'], true),
  ('guest_space', 'Guest space', 'interior', ARRAY['guest suite', 'in-law space', 'in law space', 'guest room'], true),
  ('home_office', 'Home office', 'interior', ARRAY['office', 'study', 'work from home space'], true),
  ('single_level_living', 'Single-level living', 'accessibility', ARRAY['one-level living', 'one level living', 'single floor', 'no stairs'], true),
  ('new_construction', 'New construction', 'condition', ARRAY['newly built', 'new build'], true),
  ('fixer_upper', 'Fixer upper', 'condition', ARRAY['needs work', 'project house', 'renovation project'], true),
  ('move_in_ready', 'Move-in ready', 'condition', ARRAY['turnkey', 'ready to move in', 'move in ready'], true),
  ('investment_potential', 'Investment potential', 'financial', ARRAY['rental potential', 'income property potential'], true),
  ('privacy', 'Privacy', 'location', ARRAY['private', 'secluded', 'hidden', 'no neighbors close'], true)
ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  category = EXCLUDED.category,
  aliases = EXCLUDED.aliases,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- property type vocabulary
-- ---------------------------------------------------------------------------
INSERT INTO public.property_type_terms (key, label, aliases, active)
VALUES
  ('single_family', 'Single family', ARRAY['single family', 'single-family', 'house', 'home', 'residential home'], true),
  ('lakefront', 'Lakefront', ARRAY['lakefront home', 'lake front home', 'waterfront lake home'], true),
  ('farmhouse', 'Farmhouse', ARRAY['farm house', 'farm property', 'country farmhouse'], true),
  ('cabin', 'Cabin', ARRAY['camp', 'cottage', 'rustic cabin'], true),
  ('condo', 'Condo', ARRAY['condominium', 'townhouse', 'townhome'], true),
  ('land', 'Land', ARRAY['lot', 'parcel', 'building lot', 'raw land'], true),
  ('multi_family', 'Multi-family', ARRAY['multifamily', 'multi family', 'duplex', 'triplex', 'rental building'], true)
ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  aliases = EXCLUDED.aliases,
  active = EXCLUDED.active,
  updated_at = now();

import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';
import {
  canonicalizeBuyerProfile,
  canonicalizeHouseProfile,
  type FeatureTerm,
  type PropertyTypeTerm
} from '@/lib/vocabulary/canonicalize';

interface BuyerProfileRow {
  lead_id: string;
  must_haves: string[] | null;
  nice_to_haves: string[] | null;
  dealbreakers: string[] | null;
  property_type: string | null;
}

interface HouseProfileRow {
  id: string;
  features: string[] | null;
  property_type: string | null;
}

function addAll(target: Map<string, number>, values: string[]) {
  for (const value of values) {
    target.set(value, (target.get(value) ?? 0) + 1);
  }
}

function printUnmapped(title: string, values: Map<string, number>) {
  console.log(`\n${title}:`);
  if (!values.size) {
    console.log('  none');
    return;
  }

  for (const [value, count] of [...values.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${value} (${count})`);
  }
}

async function main() {
  const supabase = createScriptSupabaseAdmin();

  const { data: featureTerms, error: featureTermsError } = await supabase
    .from('feature_terms')
    .select('key, label, category, aliases, active')
    .order('key');

  if (featureTermsError) throw new Error(`Fetch feature_terms: ${featureTermsError.message}`);

  const { data: propertyTypeTerms, error: propertyTypeTermsError } = await supabase
    .from('property_type_terms')
    .select('key, label, aliases, active')
    .order('key');

  if (propertyTypeTermsError) {
    throw new Error(`Fetch property_type_terms: ${propertyTypeTermsError.message}`);
  }

  const { data: buyerProfiles, error: buyerProfilesError } = await supabase
    .from('buyer_profiles')
    .select('lead_id, must_haves, nice_to_haves, dealbreakers, property_type');

  if (buyerProfilesError) throw new Error(`Fetch buyer_profiles: ${buyerProfilesError.message}`);

  const { data: houseProfiles, error: houseProfilesError } = await supabase
    .from('house_profiles')
    .select('id, features, property_type');

  if (houseProfilesError) throw new Error(`Fetch house_profiles: ${houseProfilesError.message}`);

  const featureTermRows = (featureTerms ?? []) as FeatureTerm[];
  const propertyTypeTermRows = (propertyTypeTerms ?? []) as PropertyTypeTerm[];
  const buyerRows = (buyerProfiles ?? []) as BuyerProfileRow[];
  const houseRows = (houseProfiles ?? []) as HouseProfileRow[];

  const unmappedBuyerTerms = new Map<string, number>();
  const unmappedHouseTerms = new Map<string, number>();
  const unmappedPropertyTypes = new Map<string, number>();

  let buyerProfilesUpdated = 0;
  let houseProfilesUpdated = 0;

  for (const profile of buyerRows) {
    const canonicalized = canonicalizeBuyerProfile(profile, featureTermRows, propertyTypeTermRows);

    addAll(unmappedBuyerTerms, canonicalized.unmapped.must_haves);
    addAll(unmappedBuyerTerms, canonicalized.unmapped.nice_to_haves);
    addAll(unmappedBuyerTerms, canonicalized.unmapped.dealbreakers);
    addAll(unmappedPropertyTypes, canonicalized.unmapped.property_type);

    const { error } = await supabase
      .from('buyer_profiles')
      .update({
        must_have_keys: canonicalized.must_have_keys,
        nice_to_have_keys: canonicalized.nice_to_have_keys,
        dealbreaker_keys: canonicalized.dealbreaker_keys,
        property_type_key: canonicalized.property_type_key
      })
      .eq('lead_id', profile.lead_id);

    if (error) throw new Error(`Update buyer_profiles ${profile.lead_id}: ${error.message}`);
    buyerProfilesUpdated += 1;
  }

  for (const home of houseRows) {
    const canonicalized = canonicalizeHouseProfile(home, featureTermRows, propertyTypeTermRows);

    addAll(unmappedHouseTerms, canonicalized.unmapped.features);
    addAll(unmappedPropertyTypes, canonicalized.unmapped.property_type);

    const { error } = await supabase
      .from('house_profiles')
      .update({
        feature_keys: canonicalized.feature_keys,
        property_type_key: canonicalized.property_type_key
      })
      .eq('id', home.id);

    if (error) throw new Error(`Update house_profiles ${home.id}: ${error.message}`);
    houseProfilesUpdated += 1;
  }

  console.log('\nPhase 2 vocabulary canonicalization complete.');
  console.log(`Buyer profiles updated: ${buyerProfilesUpdated}`);
  console.log(`House profiles updated: ${houseProfilesUpdated}`);
  printUnmapped('Unmapped buyer terms', unmappedBuyerTerms);
  printUnmapped('Unmapped house terms', unmappedHouseTerms);
  printUnmapped('Unmapped property types', unmappedPropertyTypes);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

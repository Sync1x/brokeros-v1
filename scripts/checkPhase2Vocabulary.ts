import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';

interface LeadRow {
  id: string;
  name: string | null;
}

interface BuyerProfileCheckRow {
  lead_id: string;
  must_haves: string[] | null;
  must_have_keys: string[] | null;
  nice_to_haves: string[] | null;
  nice_to_have_keys: string[] | null;
  dealbreakers: string[] | null;
  dealbreaker_keys: string[] | null;
  property_type: string | null;
  property_type_key: string | null;
}

interface HouseProfileCheckRow {
  id: string;
  seller_lead_id: string;
  address: string | null;
  features: string[] | null;
  feature_keys: string[] | null;
  property_type: string | null;
  property_type_key: string | null;
}

function list(values: string[] | null | undefined) {
  return values?.length ? values.join(', ') : '(none)';
}

function value(input: string | null | undefined) {
  return input?.trim() ? input : '(none)';
}

async function main() {
  const supabase = createScriptSupabaseAdmin();

  const { data: buyerProfiles, error: buyerProfilesError } = await supabase
    .from('buyer_profiles')
    .select(
      'lead_id, must_haves, must_have_keys, nice_to_haves, nice_to_have_keys, dealbreakers, dealbreaker_keys, property_type, property_type_key'
    )
    .order('lead_id')
    .limit(12);

  if (buyerProfilesError) throw new Error(`Fetch buyer_profiles: ${buyerProfilesError.message}`);

  const { data: houseProfiles, error: houseProfilesError } = await supabase
    .from('house_profiles')
    .select('id, seller_lead_id, address, features, feature_keys, property_type, property_type_key')
    .order('address')
    .limit(12);

  if (houseProfilesError) throw new Error(`Fetch house_profiles: ${houseProfilesError.message}`);

  const buyerRows = (buyerProfiles ?? []) as BuyerProfileCheckRow[];
  const houseRows = (houseProfiles ?? []) as HouseProfileCheckRow[];
  const leadIds = [
    ...new Set([...buyerRows.map((row) => row.lead_id), ...houseRows.map((row) => row.seller_lead_id)])
  ];

  const leadNames = new Map<string, string>();
  if (leadIds.length) {
    const { data: leads, error: leadsError } = await supabase.from('leads').select('id, name').in('id', leadIds);
    if (leadsError) throw new Error(`Fetch leads: ${leadsError.message}`);

    for (const lead of (leads ?? []) as LeadRow[]) {
      leadNames.set(lead.id, lead.name ?? lead.id);
    }
  }

  console.log('\nBuyer vocabulary examples');
  console.log('='.repeat(72));
  for (const profile of buyerRows) {
    console.log(`\nBuyer lead: ${leadNames.get(profile.lead_id) ?? profile.lead_id}`);
    console.log(`  raw must_haves: ${list(profile.must_haves)}`);
    console.log(`  canonical must_have_keys: ${list(profile.must_have_keys)}`);
    console.log(`  raw nice_to_haves: ${list(profile.nice_to_haves)}`);
    console.log(`  canonical nice_to_have_keys: ${list(profile.nice_to_have_keys)}`);
    console.log(`  raw dealbreakers: ${list(profile.dealbreakers)}`);
    console.log(`  canonical dealbreaker_keys: ${list(profile.dealbreaker_keys)}`);
    console.log(`  raw property_type: ${value(profile.property_type)}`);
    console.log(`  canonical property_type_key: ${value(profile.property_type_key)}`);
  }

  console.log('\nHouse vocabulary examples');
  console.log('='.repeat(72));
  for (const home of houseRows) {
    console.log(`\nAddress: ${value(home.address)}`);
    console.log(`  raw features: ${list(home.features)}`);
    console.log(`  canonical feature_keys: ${list(home.feature_keys)}`);
    console.log(`  raw property_type: ${value(home.property_type)}`);
    console.log(`  canonical property_type_key: ${value(home.property_type_key)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

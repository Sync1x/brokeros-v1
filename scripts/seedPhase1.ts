import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';

const SEED = 'brokeros_phase1_seed';

/** Stable UUIDs for idempotent re-seed + cleanup. */
const I = {
  bAmanda: 'c1000001-0001-4000-8000-000000000001',
  bMarcus: 'c1000001-0001-4000-8000-000000000002',
  bElena: 'c1000001-0001-4000-8000-000000000003',
  bJonah: 'c1000001-0001-4000-8000-000000000004',
  bPriya: 'c1000001-0001-4000-8000-000000000005',
  bOwen: 'c1000001-0001-4000-8000-000000000006',
  bTessa: 'c1000001-0001-4000-8000-000000000007',
  bLiam: 'c1000001-0001-4000-8000-000000000008',
  sHarlan: 'c1000002-0002-4000-8000-000000000001',
  sIris: 'c1000002-0002-4000-8000-000000000002',
  sGus: 'c1000002-0002-4000-8000-000000000003',
  sNora: 'c1000002-0002-4000-8000-000000000004',
  sCaleb: 'c1000002-0002-4000-8000-000000000005',
  sDina: 'c1000002-0002-4000-8000-000000000006',
  sRuss: 'c1000002-0002-4000-8000-000000000007',
  sMaya: 'c1000002-0002-4000-8000-000000000008',
  h1: 'c1000003-0003-4000-8000-000000000001',
  h2: 'c1000003-0003-4000-8000-000000000002',
  h3: 'c1000003-0003-4000-8000-000000000003',
  h4: 'c1000003-0003-4000-8000-000000000004',
  h5: 'c1000003-0003-4000-8000-000000000005',
  h6: 'c1000003-0003-4000-8000-000000000006',
  h7: 'c1000003-0003-4000-8000-000000000007',
  h8: 'c1000003-0003-4000-8000-000000000008'
};

function nekAdjacency(): { primary_town: string; adjacent_town: string; tier: 1 | 2 }[] {
  const t1: [string, string][] = [
    ['St Johnsbury', 'Lyndon'],
    ['St Johnsbury', 'Danville'],
    ['St Johnsbury', 'Waterford'],
    ['St Johnsbury', 'Barnet'],
    ['Lyndon', 'Lyndonville'],
    ['Lyndon', 'Burke'],
    ['Lyndon', 'Kirby'],
    ['Lyndon', 'St Johnsbury'],
    ['Lyndonville', 'Lyndon'],
    ['Lyndonville', 'Burke'],
    ['Lyndonville', 'West Burke'],
    ['Burke', 'East Burke'],
    ['Burke', 'West Burke'],
    ['Burke', 'Lyndonville'],
    ['Burke', 'Sutton'],
    ['East Burke', 'Burke'],
    ['West Burke', 'Burke'],
    ['West Burke', 'Lyndonville'],
    ['Danville', 'St Johnsbury'],
    ['Danville', 'Peacham'],
    ['Waterford', 'St Johnsbury'],
    ['Waterford', 'Ryegate'],
    ['Barnet', 'St Johnsbury'],
    ['Barnet', 'Groton'],
    ['Newport', 'Derby'],
    ['Newport', 'Coventry'],
    ['Derby', 'Newport'],
    ['Coventry', 'Newport'],
    ['Barton', 'Orleans'],
    ['Orleans', 'Barton'],
    ['Barton', 'Glover'],
    ['Glover', 'Barton'],
    ['Hardwick', 'Greensboro'],
    ['Greensboro', 'Hardwick'],
    ['Hardwick', 'Walden'],
    ['Walden', 'Hardwick'],
    ['Cabot', 'Peacham'],
    ['Peacham', 'Cabot'],
    ['Sheffield', 'Wheelock'],
    ['Wheelock', 'Sheffield'],
    ['Concord', 'Waterford'],
    ['Waterford', 'Concord'],
    ['Lyndon', 'Sheffield'],
    ['Sheffield', 'Lyndon'],
    ['Sutton', 'Burke'],
    ['Sutton', 'Greensboro'],
    ['Greensboro', 'Sutton'],
    ['Westmore', 'Burke'],
    ['Burke', 'Westmore'],
    ['Brownington', 'Orleans'],
    ['Orleans', 'Brownington'],
    ['Newark', 'West Burke'],
    ['West Burke', 'Newark'],
    ['Kirby', 'Lyndon'],
    ['Lyndon', 'Kirby'],
    ['Groton', 'Barnet'],
    ['Barnet', 'Groton'],
    ['Ryegate', 'Waterford'],
    ['Waterford', 'Ryegate']
  ];
  const t2: [string, string][] = [
    ['Lyndonville', 'St Johnsbury'],
    ['St Johnsbury', 'Lyndonville'],
    ['Lyndonville', 'Westmore'],
    ['Westmore', 'Lyndonville'],
    ['Burke', 'Hardwick'],
    ['Hardwick', 'Burke'],
    ['Lyndon', 'Danville'],
    ['Danville', 'Lyndon'],
    ['Newport', 'Barton'],
    ['Barton', 'Newport'],
    ['Orleans', 'Newport'],
    ['Newport', 'Orleans'],
    ['Glover', 'Greensboro'],
    ['Greensboro', 'Glover'],
    ['Cabot', 'Hardwick'],
    ['Hardwick', 'Cabot'],
    ['Peacham', 'Danville'],
    ['Danville', 'Peacham'],
    ['East Burke', 'Lyndonville'],
    ['Lyndonville', 'East Burke'],
    ['Sutton', 'Lyndon'],
    ['Lyndon', 'Sutton'],
    ['Concord', 'St Johnsbury'],
    ['St Johnsbury', 'Concord'],
    ['Sheffield', 'Burke'],
    ['Burke', 'Sheffield'],
    ['Wheelock', 'Lyndonville'],
    ['Lyndonville', 'Wheelock'],
    ['Brownington', 'Barton'],
    ['Barton', 'Brownington'],
    ['Newark', 'Lyndon'],
    ['Lyndon', 'Newark'],
    ['Coventry', 'Barton'],
    ['Barton', 'Coventry'],
    ['Derby', 'Coventry'],
    ['Coventry', 'Derby'],
    ['Walden', 'Cabot'],
    ['Cabot', 'Walden'],
    ['Groton', 'Ryegate'],
    ['Ryegate', 'Groton'],
    ['Kirby', 'Burke'],
    ['Burke', 'Kirby']
  ];
  const rows: { primary_town: string; adjacent_town: string; tier: 1 | 2 }[] = [];
  for (const [a, b] of t1) {
    rows.push({ primary_town: a, adjacent_town: b, tier: 1 });
    rows.push({ primary_town: b, adjacent_town: a, tier: 1 });
  }
  for (const [a, b] of t2) {
    rows.push({ primary_town: a, adjacent_town: b, tier: 2 });
    rows.push({ primary_town: b, adjacent_town: a, tier: 2 });
  }
  return rows;
}

function dedupeAdjacency(
  rows: { primary_town: string; adjacent_town: string; tier: 1 | 2 }[]
) {
  const unique = new Map<string, { primary_town: string; adjacent_town: string; tier: 1 | 2 }>();

  for (const row of rows) {
    const key = `${row.primary_town}::${row.adjacent_town}`;
    const existing = unique.get(key);

    if (!existing || row.tier < existing.tier) {
      unique.set(key, row);
    }
  }

  return [...unique.values()];
}

async function main() {
  const supabase = createScriptSupabaseAdmin();

  const { error: probe } = await supabase.from('leads').select('notes_md,lead_type').limit(1);
  if (probe?.message?.includes('notes_md') || probe?.message?.includes('lead_type')) {
    console.error(
      'Supabase `leads` table is missing Phase 1 columns. Apply migration first:\n' +
        '  supabase/migrations/20260512100000_phase_1_data_foundation.sql\n' +
        `Detail: ${probe.message}`
    );
    process.exit(1);
  }

  const nekTowns = [
    'St Johnsbury',
    'Lyndonville',
    'Lyndon',
    'Burke',
    'East Burke',
    'West Burke',
    'Danville',
    'Waterford',
    'Concord',
    'Kirby',
    'Sheffield',
    'Sutton',
    'Wheelock',
    'Newark',
    'Barton',
    'Orleans',
    'Brownington',
    'Westmore',
    'Glover',
    'Greensboro',
    'Hardwick',
    'Walden',
    'Cabot',
    'Peacham',
    'Barnet',
    'Groton',
    'Ryegate',
    'Newport',
    'Derby',
    'Coventry'
  ];

  const leads = [
    {
      id: I.bAmanda,
      name: 'Amanda Cole',
      phone: '802-555-0101',
      email: 'amanda.cole@example.com',
      lead_type: 'buyer',
      status: 'active',
      temperature: 'hot',
      notes_md: SEED
    },
    {
      id: I.bMarcus,
      name: 'Marcus Webb',
      phone: '802-555-0102',
      email: 'marcus.webb@example.com',
      lead_type: 'buyer',
      status: 'active',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.bElena,
      name: 'Elena Ruiz',
      phone: '802-555-0103',
      email: 'elena.ruiz@example.com',
      lead_type: 'buyer',
      status: 'nurture',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.bJonah,
      name: 'Jonah Pike',
      phone: '802-555-0104',
      email: 'jonah.pike@example.com',
      lead_type: 'buyer',
      status: 'active',
      temperature: 'cold',
      notes_md: SEED
    },
    {
      id: I.bPriya,
      name: 'Priya Nandakumar',
      phone: '802-555-0105',
      email: 'priya.n@example.com',
      lead_type: 'buyer',
      status: 'active',
      temperature: 'hot',
      notes_md: SEED
    },
    {
      id: I.bOwen,
      name: 'Owen Fletcher',
      phone: '802-555-0106',
      email: 'owen.fletcher@example.com',
      lead_type: 'buyer',
      status: 'active',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.bTessa,
      name: 'Tessa Morin',
      phone: '802-555-0107',
      email: 'tessa.morin@example.com',
      lead_type: 'buyer',
      status: 'nurture',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.bLiam,
      name: 'Liam Brooks',
      phone: '802-555-0108',
      email: 'liam.brooks@example.com',
      lead_type: 'buyer',
      status: 'active',
      temperature: 'hot',
      notes_md: SEED
    },
    {
      id: I.sHarlan,
      name: 'Harlan Voss',
      phone: '802-555-0201',
      email: 'harlan.voss@example.com',
      lead_type: 'seller',
      status: 'active',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.sIris,
      name: 'Iris Cantrell',
      phone: '802-555-0202',
      email: 'iris.cantrell@example.com',
      lead_type: 'seller',
      status: 'active',
      temperature: 'hot',
      notes_md: SEED
    },
    {
      id: I.sGus,
      name: 'Gus Tillman',
      phone: '802-555-0203',
      email: 'gus.tillman@example.com',
      lead_type: 'seller',
      status: 'nurture',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.sNora,
      name: 'Nora Elling',
      phone: '802-555-0204',
      email: 'nora.elling@example.com',
      lead_type: 'seller',
      status: 'active',
      temperature: 'cold',
      notes_md: SEED
    },
    {
      id: I.sCaleb,
      name: 'Caleb Arnault',
      phone: '802-555-0205',
      email: 'caleb.arnault@example.com',
      lead_type: 'seller',
      status: 'active',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.sDina,
      name: 'Dina Kostas',
      phone: '802-555-0206',
      email: 'dina.kostas@example.com',
      lead_type: 'seller',
      status: 'active',
      temperature: 'hot',
      notes_md: SEED
    },
    {
      id: I.sRuss,
      name: 'Russ Holloway',
      phone: '802-555-0207',
      email: 'russ.holloway@example.com',
      lead_type: 'seller',
      status: 'nurture',
      temperature: 'warm',
      notes_md: SEED
    },
    {
      id: I.sMaya,
      name: 'Maya Lindstrom',
      phone: '802-555-0208',
      email: 'maya.lindstrom@example.com',
      lead_type: 'seller',
      status: 'active',
      temperature: 'warm',
      notes_md: SEED
    }
  ];

  const leadIds = leads.map((lead) => lead.id);
  const buyerLeadIds = leads.filter((lead) => lead.lead_type === 'buyer').map((lead) => lead.id);

  const buyerProfiles = [
    {
      lead_id: I.bAmanda,
      budget_max: 500_000,
      bedrooms_min: 3,
      bathrooms_min: 2,
      property_type: 'lakefront',
      location_primary: 'Lyndonville',
      must_haves: ['lakefront', 'balcony'],
      nice_to_haves: ['mountain view', 'garage', 'deck'],
      dealbreakers: ['multi_family']
    },
    {
      lead_id: I.bMarcus,
      budget_max: 385_000,
      bedrooms_min: 2,
      bathrooms_min: 1,
      property_type: 'single_family',
      location_primary: 'St Johnsbury',
      must_haves: ['garage'],
      nice_to_haves: ['mudroom', 'renovated kitchen'],
      dealbreakers: []
    },
    {
      lead_id: I.bElena,
      budget_max: 620_000,
      bedrooms_min: 4,
      bathrooms_min: 3,
      property_type: 'farmhouse',
      location_primary: 'Hardwick',
      must_haves: ['acreage', 'barn'],
      nice_to_haves: ['pasture', 'workshop'],
      dealbreakers: []
    },
    {
      lead_id: I.bJonah,
      budget_max: 275_000,
      bedrooms_min: 2,
      bathrooms_min: 1,
      property_type: 'condo',
      location_primary: 'Newport',
      must_haves: ['in-town'],
      nice_to_haves: ['deck'],
      dealbreakers: ['rural']
    },
    {
      lead_id: I.bPriya,
      budget_max: 450_000,
      bedrooms_min: 3,
      bathrooms_min: 2,
      property_type: 'single_family',
      location_primary: 'Burke',
      must_haves: ['near Burke Mountain'],
      nice_to_haves: ['near VAST trails', 'mudroom'],
      dealbreakers: []
    },
    {
      lead_id: I.bOwen,
      budget_max: 340_000,
      bedrooms_min: 2,
      bathrooms_min: 2,
      property_type: 'cabin',
      location_primary: 'West Burke',
      must_haves: ['wood stove'],
      nice_to_haves: ['mountain view', 'private driveway'],
      dealbreakers: []
    },
    {
      lead_id: I.bTessa,
      budget_max: 510_000,
      bedrooms_min: 3,
      bathrooms_min: 2,
      property_type: 'lakefront',
      location_primary: 'Westmore',
      must_haves: ['lakefront'],
      nice_to_haves: ['deck', 'mountain view'],
      dealbreakers: []
    },
    {
      lead_id: I.bLiam,
      budget_max: 425_000,
      bedrooms_min: 3,
      bathrooms_min: 2,
      property_type: 'single_family',
      location_primary: 'Danville',
      must_haves: ['first-floor bedroom'],
      nice_to_haves: ['finished basement', 'garage'],
      dealbreakers: []
    }
  ];

  const houses = [
    {
      id: I.h1,
      seller_lead_id: I.sHarlan,
      address: '14 Spruce Point Rd',
      town: 'Lyndonville',
      beds: 3,
      baths: 2,
      sqft: 1840,
      property_type: 'lakefront',
      features: ['lakefront', 'balcony', 'deck', 'mountain view', 'private driveway', 'mudroom'],
      list_price: 489_000,
      status: 'active'
    },
    {
      id: I.h2,
      seller_lead_id: I.sIris,
      address: '220 Mountain Rd',
      town: 'Burke',
      beds: 3,
      baths: 2,
      sqft: 1760,
      property_type: 'lakefront',
      features: ['lakefront', 'mountain view', 'near VAST trails', 'garage', 'deck'],
      list_price: 535_000,
      status: 'active'
    },
    {
      id: I.h3,
      seller_lead_id: I.sGus,
      address: '8 Maple St',
      town: 'Lyndonville',
      beds: 3,
      baths: 2,
      sqft: 1620,
      property_type: 'single_family',
      features: ['garage', 'renovated kitchen', 'in-town', 'mudroom'],
      list_price: 349_000,
      status: 'active'
    },
    {
      id: I.h4,
      seller_lead_id: I.sNora,
      address: '455 Lakeview Dr',
      town: 'Westmore',
      beds: 4,
      baths: 3,
      sqft: 2280,
      property_type: 'lakefront',
      features: ['lakefront', 'deck', 'mountain view', 'dock', 'workshop'],
      list_price: 598_000,
      status: 'active'
    },
    {
      id: I.h5,
      seller_lead_id: I.sCaleb,
      address: '103 Ridge Rd',
      town: 'East Burke',
      beds: 3,
      baths: 2,
      sqft: 1900,
      property_type: 'single_family',
      features: ['near Burke Mountain', 'near VAST trails', 'garage', 'mudroom', 'deck'],
      list_price: 465_000,
      status: 'active'
    },
    {
      id: I.h6,
      seller_lead_id: I.sDina,
      address: '77 Pond Rd',
      town: 'St Johnsbury',
      beds: 2,
      baths: 1,
      sqft: 1180,
      property_type: 'condo',
      features: ['in-town', 'deck', 'renovated kitchen'],
      list_price: 259_000,
      status: 'active'
    },
    {
      id: I.h7,
      seller_lead_id: I.sRuss,
      address: '612 Cabot Rd',
      town: 'Hardwick',
      beds: 4,
      baths: 3,
      sqft: 2460,
      property_type: 'farmhouse',
      features: ['acreage', 'barn', 'pasture', 'workshop', 'mudroom', 'wood stove'],
      list_price: 579_000,
      status: 'active'
    },
    {
      id: I.h8,
      seller_lead_id: I.sMaya,
      address: '39 Alder Ln',
      town: 'West Burke',
      beds: 2,
      baths: 2,
      sqft: 1320,
      property_type: 'cabin',
      features: ['wood stove', 'mountain view', 'private driveway', 'near VAST trails'],
      list_price: 318_000,
      status: 'active'
    }
  ];

  const houseIds = houses.map((house) => house.id);

  const { error: delMatchesByBuyer } = await supabase
    .from('matches')
    .delete()
    .in('buyer_lead_id', buyerLeadIds);
  if (delMatchesByBuyer) throw new Error(`Clear matches by buyer: ${delMatchesByBuyer.message}`);

  const { error: delMatchesByHouse } = await supabase
    .from('matches')
    .delete()
    .in('house_profile_id', houseIds);
  if (delMatchesByHouse) throw new Error(`Clear matches by house: ${delMatchesByHouse.message}`);

  const { error: delBuyerProfiles } = await supabase
    .from('buyer_profiles')
    .delete()
    .in('lead_id', buyerLeadIds);
  if (delBuyerProfiles) throw new Error(`Clear buyer_profiles: ${delBuyerProfiles.message}`);

  const { error: delHouseProfiles } = await supabase
    .from('house_profiles')
    .delete()
    .in('id', houseIds);
  if (delHouseProfiles) throw new Error(`Clear house_profiles: ${delHouseProfiles.message}`);

  const { error: delAdj } = await supabase.from('town_adjacency').delete().in('primary_town', nekTowns);
  if (delAdj) throw new Error(`Clear town_adjacency: ${delAdj.message}`);

  const { error: delLeadsBySeed } = await supabase.from('leads').delete().eq('notes_md', SEED);
  if (delLeadsBySeed) throw new Error(`Clear seed leads: ${delLeadsBySeed.message}`);

  const { error: delLeadsById } = await supabase.from('leads').delete().in('id', leadIds);
  if (delLeadsById) throw new Error(`Clear seed lead IDs: ${delLeadsById.message}`);

  const { error: insLeads } = await supabase.from('leads').insert(leads);
  if (insLeads) throw new Error(`Insert leads: ${insLeads.message}`);

  const { error: insBp } = await supabase.from('buyer_profiles').insert(buyerProfiles);
  if (insBp) throw new Error(`Insert buyer_profiles: ${insBp.message}`);

  const { error: insH } = await supabase.from('house_profiles').insert(houses);
  if (insH) throw new Error(`Insert house_profiles: ${insH.message}`);

  const adj = dedupeAdjacency(nekAdjacency());
  const { error: insAdj } = await supabase
    .from('town_adjacency')
    .upsert(adj, { onConflict: 'primary_town,adjacent_town', ignoreDuplicates: true });
  if (insAdj) throw new Error(`Insert town_adjacency: ${insAdj.message}`);

  console.log(
    `Phase 1 seed OK: ${leads.length} leads, ${buyerProfiles.length} buyer_profiles, ${houses.length} houses, ${adj.length} adjacency rows.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

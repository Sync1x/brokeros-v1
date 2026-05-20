import { syncParagonTestListings } from '@/features/mls/paragon/sync';
import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for script tenancy scope`);
  return value;
}

async function main() {
  const userId = requiredEnv('BROKEROS_USER_ID');
  const orgId = process.env.BROKEROS_ORG_ID?.trim() || `solo:${userId}`;
  const result = await syncParagonTestListings(orgId, userId, createScriptSupabaseAdmin());

  console.log(`Dataset: ${result.datasetId}`);
  console.log(`Fetched: ${result.fetched}`);
  console.log(`Upserted: ${result.upserted}`);
  console.log(`First 3 ListingKeys: ${result.firstListingKeys.slice(0, 3).join(', ') || 'none'}`);
  console.log(`Failed: ${result.failed}`);
  console.log(`Matching pairs scored: ${result.matching?.pairsScored ?? 0}`);
  console.log(`Matches written: ${result.matching?.matchesWritten ?? 0}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

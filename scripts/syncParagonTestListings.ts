import { syncParagonTestListings } from '@/features/mls/paragon/sync';
import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';

async function main() {
  const result = await syncParagonTestListings(createScriptSupabaseAdmin());

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

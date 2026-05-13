import { runMatchingForAllBuyers } from '@/lib/matching/runMatchingForAllBuyers';

async function main() {
  const result = await runMatchingForAllBuyers();
  console.log(
    `Matching complete: ${result.buyersConsidered} buyers × ${result.housesConsidered} houses → ${result.upsertRows} upserted rows.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

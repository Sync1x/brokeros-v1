import { runMatchingForAllBuyers } from '@/lib/matching/runMatchingForAllBuyers';

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for script tenancy scope`);
  return value;
}

async function main() {
  const userId = requiredEnv('BROKEROS_USER_ID');
  const orgId = process.env.BROKEROS_ORG_ID?.trim() || `solo:${userId}`;
  const result = await runMatchingForAllBuyers({ orgId, ownerUserId: userId });
  console.log(
    `Matching complete: ${result.buyersConsidered} buyers × ${result.housesConsidered} houses → ${result.upsertRows} upserted rows.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';
import type { ScoreBreakdown } from '@/lib/matching/types';

const TOP_PER_BUYER = 6;

async function main() {
  const supabase = createScriptSupabaseAdmin();

  const { data: matches, error: mErr } = await supabase
    .from('matches')
    .select('buyer_lead_id, house_profile_id, score, score_breakdown_json')
    .order('score', { ascending: false });

  if (mErr) throw new Error(mErr.message);
  if (!matches?.length) {
    console.log('No rows in matches. Run: bun run db:matching:phase1');
    return;
  }

  const buyerIds = [...new Set(matches.map((m) => m.buyer_lead_id as string))];
  const houseIds = [...new Set(matches.map((m) => m.house_profile_id as string))];

  const { data: buyers, error: bErr } = await supabase
    .from('leads')
    .select('id, name, lead_type')
    .in('id', buyerIds)
    .eq('lead_type', 'buyer');

  if (bErr) throw new Error(bErr.message);

  const { data: houses, error: hErr } = await supabase
    .from('house_profiles')
    .select('id, address, town, list_price')
    .in('id', houseIds);

  if (hErr) throw new Error(hErr.message);

  const buyerName = new Map((buyers ?? []).map((b) => [b.id as string, b.name as string]));
  const houseRow = new Map((houses ?? []).map((h) => [h.id as string, h]));

  const byBuyer = new Map<string, typeof matches>();
  for (const row of matches) {
    const bid = row.buyer_lead_id as string;
    if (!buyerName.has(bid)) continue;
    const list = byBuyer.get(bid) ?? [];
    list.push(row);
    byBuyer.set(bid, list);
  }

  for (const [bid, rows] of byBuyer) {
    const name = buyerName.get(bid) ?? bid;
    rows.sort((a, b) => Number(b.score) - Number(a.score));
    const top = rows.slice(0, TOP_PER_BUYER);
    console.log('\n' + '='.repeat(72));
    console.log(`Buyer: ${name}`);
    console.log('='.repeat(72));
    for (const row of top) {
      const h = houseRow.get(row.house_profile_id as string);
      const breakdown = row.score_breakdown_json as ScoreBreakdown | null;
      const reasons = breakdown?.reasons?.slice(0, 4) ?? [];
      const penalties = breakdown?.penalties ?? [];
      console.log(
        `\n  Score: ${row.score}  |  $${h?.list_price?.toLocaleString() ?? '?'}  |  ${h?.address ?? '?'}, ${h?.town ?? '?'}`
      );
      if (reasons.length) console.log(`  Reasons: ${reasons.join(' · ')}`);
      if (penalties.length) console.log(`  Penalties: ${penalties.join(' · ')}`);
    }
  }

  console.log('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

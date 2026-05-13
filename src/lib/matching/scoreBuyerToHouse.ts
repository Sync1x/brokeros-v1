import {
  BUDGET_STRETCH_RATIO,
  DISQUALIFIED_SCORE_CAP,
  LOCATION_NONE,
  LOCATION_SAME_TOWN,
  LOCATION_TIER1,
  LOCATION_TIER2,
  MATCH_WEIGHTS,
  ROOM_OVERFIT_FIT,
  ROOM_UPPER_TOLERANCE
} from './scoring-constants';
import type { BuyerProfileRow, HouseProfileRow, ScoreBreakdown, ScoreResult, TownAdjacencyRow } from './types';
import { normalizeFeatureList, normalizeMatchToken } from './normalize';

function buildAdjacencyLookup(rows: TownAdjacencyRow[]): Map<string, Map<string, 1 | 2>> {
  const byPrimary = new Map<string, Map<string, 1 | 2>>();
  for (const r of rows) {
    const p = normalizeMatchToken(r.primary_town);
    const a = normalizeMatchToken(r.adjacent_town);
    if (!p || !a) continue;
    let inner = byPrimary.get(p);
    if (!inner) {
      inner = new Map();
      byPrimary.set(p, inner);
    }
    const prev = inner.get(a);
    if (prev === undefined || r.tier < prev) {
      inner.set(a, r.tier);
    }
  }
  return byPrimary;
}

function locationFitFromAdjacency(
  buyerTownRaw: string | null | undefined,
  houseTownRaw: string | null | undefined,
  adjacency: Map<string, Map<string, 1 | 2>>,
  reasons: string[],
  penalties: string[]
): number {
  const b = buyerTownRaw ? normalizeMatchToken(buyerTownRaw) : '';
  const h = houseTownRaw ? normalizeMatchToken(houseTownRaw) : '';
  if (!b || !h) {
    penalties.push('Missing buyer primary town or house town for location scoring.');
    return LOCATION_NONE;
  }
  if (b === h) {
    reasons.push(`Same town (${houseTownRaw?.trim() ?? h}).`);
    return LOCATION_SAME_TOWN;
  }
  const tier = adjacency.get(b)?.get(h);
  if (tier === 1) {
    reasons.push(`Tier-1 adjacent to buyer town (${houseTownRaw?.trim() ?? h}).`);
    return LOCATION_TIER1;
  }
  if (tier === 2) {
    reasons.push(`Tier-2 adjacent to buyer town (${houseTownRaw?.trim() ?? h}).`);
    return LOCATION_TIER2;
  }
  penalties.push('House town is not buyer town or a known adjacent town (NEK map).');
  return LOCATION_NONE;
}

function budgetFit(
  budgetMax: number | null,
  listPrice: number | null,
  reasons: string[],
  penalties: string[]
): { fit: number; hardFail: boolean } {
  if (budgetMax == null || budgetMax <= 0) {
    penalties.push('Buyer budget_max missing; budget fit discounted.');
    return { fit: 0.55, hardFail: false };
  }
  if (listPrice == null || listPrice <= 0) {
    penalties.push('House list_price missing; budget fit discounted.');
    return { fit: 0.5, hardFail: false };
  }
  const stretch = Math.round(budgetMax * BUDGET_STRETCH_RATIO);
  if (listPrice <= budgetMax) {
    reasons.push('At or under stated budget.');
    return { fit: 1, hardFail: false };
  }
  if (listPrice <= stretch) {
    const span = stretch - budgetMax;
    const t = span > 0 ? (listPrice - budgetMax) / span : 1;
    const fit = 1 - 0.65 * Math.min(1, Math.max(0, t));
    reasons.push('Within 10% stretch over budget (reduced budget fit).');
    return { fit: Math.max(0.28, fit), hardFail: false };
  }
  penalties.push(`Over budget by more than 10% (max ~${stretch}, list ${listPrice}).`);
  return { fit: 0, hardFail: true };
}

function roomFit(
  label: 'bedrooms' | 'bathrooms',
  minWant: number | null,
  actual: number | null,
  reasons: string[],
  penalties: string[]
): { fit: number; hardFail: boolean } {
  if (minWant == null || minWant <= 0) {
    return { fit: 1, hardFail: false };
  }
  if (actual == null) {
    penalties.push(`House ${label} unknown; ${label} fit discounted.`);
    return { fit: 0.45, hardFail: false };
  }
  if (actual < minWant) {
    penalties.push(`${label}: house below buyer minimum (${actual} < ${minWant}).`);
    return { fit: 0, hardFail: true };
  }
  if (actual <= minWant + ROOM_UPPER_TOLERANCE) {
    reasons.push(`${label}: meets minimum without large overfit.`);
    return { fit: 1, hardFail: false };
  }
  reasons.push(`${label}: above min + ${ROOM_UPPER_TOLERANCE} (small overfit penalty).`);
  return { fit: ROOM_OVERFIT_FIT, hardFail: false };
}

function propertyTypeFit(
  buyerType: string | null,
  houseType: string | null,
  houseFeaturesNorm: string[],
  reasons: string[],
  penalties: string[]
): { fit: number; catastrophic: boolean } {
  const b = buyerType ? normalizeMatchToken(buyerType) : '';
  const h = houseType ? normalizeMatchToken(houseType) : '';
  const houseHasLakefrontFeature = houseFeaturesNorm.includes('lakefront');

  if (!b) {
    penalties.push('Buyer property_type missing; type fit discounted.');
    return { fit: 0.55, catastrophic: false };
  }
  if (!h) {
    penalties.push('House property_type missing; type fit discounted.');
    return { fit: 0.45, catastrophic: false };
  }

  if (b === h) {
    reasons.push('Property type exact match.');
    return { fit: 1, catastrophic: false };
  }

  if (b === 'lakefront') {
    const ok = h === 'lakefront' || houseHasLakefrontFeature;
    if (!ok) {
      penalties.push('Buyer requires lakefront category; house is not lakefront.');
      return { fit: 0.03, catastrophic: true };
    }
    reasons.push('Lakefront intent satisfied (type or feature).');
    return { fit: 0.92, catastrophic: false };
  }

  if (h === 'lakefront' && b !== 'lakefront') {
    reasons.push('House is lakefront while buyer is broader category (good).');
    return { fit: 0.88, catastrophic: false };
  }

  const cluster = new Set(['single_family', 'farmhouse', 'cabin']);
  if (cluster.has(b) && cluster.has(h)) {
    reasons.push('Property type same general family (single-family / farmhouse / cabin).');
    return { fit: 0.58, catastrophic: false };
  }

  if ((b === 'land') !== (h === 'land')) {
    penalties.push('Land vs improved property mismatch.');
    return { fit: 0.06, catastrophic: true };
  }

  if ((b === 'condo') !== (h === 'condo')) {
    penalties.push('Condo vs non-condo mismatch.');
    return { fit: 0.18, catastrophic: false };
  }

  penalties.push('Property type mismatch (weighted heavily).');
  return { fit: 0.14, catastrophic: false };
}

function mustHaveFit(
  mustHavesRaw: string[],
  houseFeaturesNorm: string[],
  houseTypeNorm: string,
  reasons: string[],
  penalties: string[]
): { fit: number; catastrophic: boolean } {
  const must = normalizeFeatureList(mustHavesRaw);
  if (!must.length) {
    return { fit: 1, catastrophic: false };
  }
  let worst = 1;
  let catastrophic = false;
  for (const token of must) {
    const inFeatures = houseFeaturesNorm.includes(token);
    const typeIsLakefrontToken = token === 'lakefront' && houseTypeNorm === 'lakefront';
    const ok = inFeatures || typeIsLakefrontToken;
    if (!ok) {
      penalties.push(`Missing must-have: "${token}".`);
      if (token === 'lakefront') {
        worst = Math.min(worst, 0.04);
        catastrophic = true;
      } else {
        worst = Math.min(worst, 0.12);
      }
    } else {
      reasons.push(`Must-have satisfied: "${token}".`);
    }
  }
  return { fit: worst, catastrophic };
}

function dealbreakerHit(
  dealbreakersRaw: string[],
  houseFeaturesNorm: string[],
  penalties: string[]
): boolean {
  const d = normalizeFeatureList(dealbreakersRaw);
  if (!d.length) return false;
  for (const token of d) {
    if (houseFeaturesNorm.includes(token)) {
      penalties.push(`Dealbreaker present in listing features: "${token}".`);
      return true;
    }
  }
  return false;
}

function niceToHaveBonus(
  niceRaw: string[],
  houseFeaturesNorm: string[],
  reasons: string[]
): number {
  const nice = normalizeFeatureList(niceRaw);
  if (!nice.length) return 0;
  let hits = 0;
  for (const token of nice) {
    if (houseFeaturesNorm.includes(token)) {
      hits += 1;
      reasons.push(`Nice-to-have present: "${token}".`);
    }
  }
  if (!hits) return 0;
  const per = MATCH_WEIGHTS.nice_to_haves_cap / Math.max(3, nice.length);
  return Math.min(MATCH_WEIGHTS.nice_to_haves_cap, hits * per * 1.4);
}

export function scoreBuyerToHouse(
  buyerProfile: BuyerProfileRow,
  houseProfile: HouseProfileRow,
  townAdjacencyRows: TownAdjacencyRow[]
): ScoreResult {
  const reasons: string[] = [];
  const penalties: string[] = [];
  let disqualified = false;

  const adjacency = buildAdjacencyLookup(townAdjacencyRows);
  const houseFeaturesNorm = normalizeFeatureList(houseProfile.features);
  const houseTypeNorm = houseProfile.property_type ? normalizeMatchToken(houseProfile.property_type) : '';

  if (dealbreakerHit(buyerProfile.dealbreakers, houseFeaturesNorm, penalties)) {
    disqualified = true;
  }

  const { fit: budget_fit, hardFail: budgetHard } = budgetFit(
    buyerProfile.budget_max,
    houseProfile.list_price,
    reasons,
    penalties
  );
  if (budgetHard) disqualified = true;

  const location_fit = locationFitFromAdjacency(
    buyerProfile.location_primary,
    houseProfile.town,
    adjacency,
    reasons,
    penalties
  );
  if (location_fit <= 0) {
    disqualified = true;
    penalties.push('Zero location fit — match heavily discounted.');
  }

  const { fit: bedrooms_fit, hardFail: bedHard } = roomFit(
    'bedrooms',
    buyerProfile.bedrooms_min,
    houseProfile.beds,
    reasons,
    penalties
  );
  if (bedHard) disqualified = true;

  const { fit: bathrooms_fit, hardFail: bathHard } = roomFit(
    'bathrooms',
    buyerProfile.bathrooms_min,
    houseProfile.baths,
    reasons,
    penalties
  );
  if (bathHard) disqualified = true;

  const {
    fit: property_type_fit,
    catastrophic: typeCat
  } = propertyTypeFit(
    buyerProfile.property_type,
    houseProfile.property_type,
    houseFeaturesNorm,
    reasons,
    penalties
  );
  if (typeCat) disqualified = true;

  const {
    fit: must_have_fit,
    catastrophic: mustCat
  } = mustHaveFit(
    buyerProfile.must_haves,
    houseFeaturesNorm,
    houseTypeNorm,
    reasons,
    penalties
  );
  if (mustCat) disqualified = true;

  const nice_to_have_bonus = niceToHaveBonus(buyerProfile.nice_to_haves, houseFeaturesNorm, reasons);

  const weighted =
    budget_fit * MATCH_WEIGHTS.budget +
    location_fit * MATCH_WEIGHTS.location +
    bedrooms_fit * MATCH_WEIGHTS.bedrooms +
    bathrooms_fit * MATCH_WEIGHTS.bathrooms +
    property_type_fit * MATCH_WEIGHTS.property_type +
    must_have_fit * MATCH_WEIGHTS.must_haves +
    nice_to_have_bonus;

  let score = Math.round(Math.min(100, Math.max(0, weighted)));
  if (disqualified) {
    score = Math.min(DISQUALIFIED_SCORE_CAP, score);
  }

  const breakdown: ScoreBreakdown = {
    budget_fit,
    location_fit,
    bedrooms_fit,
    bathrooms_fit,
    property_type_fit,
    must_have_fit,
    nice_to_have_bonus,
    penalties,
    reasons
  };

  return { score, breakdown };
}

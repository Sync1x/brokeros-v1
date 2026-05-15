import { normalizeTerm } from './normalizeTerm';

export interface FeatureTerm {
  key: string;
  label: string;
  category: string | null;
  aliases: string[];
  active?: boolean | null;
}

export interface PropertyTypeTerm {
  key: string;
  label: string;
  aliases: string[];
  active?: boolean | null;
}

export interface BuyerProfileVocabularyInput {
  must_haves: string[] | null;
  nice_to_haves: string[] | null;
  dealbreakers: string[] | null;
  property_type: string | null;
}

export interface HouseProfileVocabularyInput {
  features: string[] | null;
  property_type: string | null;
}

export interface CanonicalizedBuyerProfile<TProfile extends BuyerProfileVocabularyInput> {
  profile: TProfile;
  must_have_keys: string[];
  nice_to_have_keys: string[];
  dealbreaker_keys: string[];
  property_type_key: string | null;
  unmapped: {
    must_haves: string[];
    nice_to_haves: string[];
    dealbreakers: string[];
    property_type: string[];
  };
}

export interface CanonicalizedHouseProfile<TProfile extends HouseProfileVocabularyInput> {
  profile: TProfile;
  feature_keys: string[];
  property_type_key: string | null;
  unmapped: {
    features: string[];
    property_type: string[];
  };
}

function isActive(term: { active?: boolean | null }) {
  return term.active !== false;
}

function termCandidates(term: { key: string; label: string; aliases: string[] }) {
  return [term.key, term.label, ...(term.aliases ?? [])].map(normalizeTerm);
}

function canonicalizeTerm<
  TTerm extends { key: string; label: string; aliases: string[]; active?: boolean | null }
>(input: string | null | undefined, terms: TTerm[]): string | null {
  if (!input?.trim()) return null;

  const normalizedInput = normalizeTerm(input);
  if (!normalizedInput) return null;

  for (const term of terms) {
    if (!isActive(term)) continue;
    if (termCandidates(term).includes(normalizedInput)) return term.key;
  }

  return null;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function normalizedUnmappedValue(input: string) {
  return input.trim();
}

export function canonicalizeFeatureTerm(input: string, featureTerms: FeatureTerm[]): string | null {
  return canonicalizeTerm(input, featureTerms);
}

export function canonicalizePropertyType(
  input: string,
  propertyTypeTerms: PropertyTypeTerm[]
): string | null {
  return canonicalizeTerm(input, propertyTypeTerms);
}

export function canonicalizeFeatureArray(
  inputs: string[] | null | undefined,
  featureTerms: FeatureTerm[]
): { keys: string[]; unmapped: string[] } {
  const keys: string[] = [];
  const unmapped: string[] = [];

  for (const input of inputs ?? []) {
    if (!input?.trim()) continue;

    const key = canonicalizeFeatureTerm(input, featureTerms);
    if (key) {
      keys.push(key);
    } else {
      unmapped.push(normalizedUnmappedValue(input));
    }
  }

  return {
    keys: unique(keys),
    unmapped: unique(unmapped)
  };
}

export function canonicalizeBuyerProfile<TProfile extends BuyerProfileVocabularyInput>(
  profile: TProfile,
  featureTerms: FeatureTerm[],
  propertyTypeTerms: PropertyTypeTerm[]
): CanonicalizedBuyerProfile<TProfile> {
  const mustHaves = canonicalizeFeatureArray(profile.must_haves, featureTerms);
  const niceToHaves = canonicalizeFeatureArray(profile.nice_to_haves, featureTerms);
  const dealbreakers = canonicalizeFeatureArray(profile.dealbreakers, featureTerms);
  const propertyTypeKey = profile.property_type?.trim()
    ? canonicalizePropertyType(profile.property_type, propertyTypeTerms)
    : null;
  const unmappedPropertyType =
    profile.property_type?.trim() && !propertyTypeKey ? [profile.property_type.trim()] : [];

  if (
    mustHaves.unmapped.length ||
    niceToHaves.unmapped.length ||
    dealbreakers.unmapped.length ||
    unmappedPropertyType.length
  ) {
    console.warn('Unmapped buyer vocabulary terms', {
      must_haves: mustHaves.unmapped,
      nice_to_haves: niceToHaves.unmapped,
      dealbreakers: dealbreakers.unmapped,
      property_type: unmappedPropertyType
    });
  }

  return {
    profile,
    must_have_keys: mustHaves.keys,
    nice_to_have_keys: niceToHaves.keys,
    dealbreaker_keys: dealbreakers.keys,
    property_type_key: propertyTypeKey,
    unmapped: {
      must_haves: mustHaves.unmapped,
      nice_to_haves: niceToHaves.unmapped,
      dealbreakers: dealbreakers.unmapped,
      property_type: unmappedPropertyType
    }
  };
}

export function canonicalizeHouseProfile<TProfile extends HouseProfileVocabularyInput>(
  home: TProfile,
  featureTerms: FeatureTerm[],
  propertyTypeTerms: PropertyTypeTerm[]
): CanonicalizedHouseProfile<TProfile> {
  const features = canonicalizeFeatureArray(home.features, featureTerms);
  const propertyTypeKey = home.property_type?.trim()
    ? canonicalizePropertyType(home.property_type, propertyTypeTerms)
    : null;
  const unmappedPropertyType =
    home.property_type?.trim() && !propertyTypeKey ? [home.property_type.trim()] : [];

  if (features.unmapped.length || unmappedPropertyType.length) {
    console.warn('Unmapped house vocabulary terms', {
      features: features.unmapped,
      property_type: unmappedPropertyType
    });
  }

  return {
    profile: home,
    feature_keys: features.keys,
    property_type_key: propertyTypeKey,
    unmapped: {
      features: features.unmapped,
      property_type: unmappedPropertyType
    }
  };
}

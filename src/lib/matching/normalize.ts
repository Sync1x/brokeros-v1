/** Normalize town or feature token for comparison (trim, lowercase, collapse spaces, drop periods in St.). */
export function normalizeMatchToken(raw: string): string {
  let s = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  s = s.replace(/\./g, '');
  s = s.replace(/^st\s+/i, 'st ');
  return s;
}

export function normalizeFeatureList(items: string[] | null | undefined): string[] {
  if (!items?.length) return [];
  return items.map((x) => normalizeMatchToken(String(x))).filter(Boolean);
}

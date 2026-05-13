import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

let envLoaded = false;

function ensureEnvLoaded() {
  if (envLoaded) return;
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', {
    info: () => {},
    error: () => {}
  });
  envLoaded = true;
}

function firstNonEmpty(...values: (string | undefined)[]) {
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const s = v.trim();
    if (s) return s;
  }
  return undefined;
}

/**
 * Service-role Supabase client for local/server scripts only.
 * Never import this from client components or route handlers exposed to the browser.
 */
export function createScriptSupabaseAdmin(): SupabaseClient {
  ensureEnvLoaded();
  const url = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL
  );
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    const missing: string[] = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL or VITE_SUPABASE_URL');
    if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(`Script Supabase client missing: ${missing.join(', ')}`);
  }
  return createClient(url.replace(/\/$/, ''), key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

import 'server-only';

import { loadEnvConfig } from '@next/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let envLoaded = false;

function ensureEnvLoaded() {
  if (envLoaded) return;
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', {
    info: () => {},
    error: () => {}
  });
  envLoaded = true;
}

function envValue(name: string) {
  const direct = process.env[name];
  if (direct?.trim()) return direct.trim();
  ensureEnvLoaded();
  return process.env[name]?.trim();
}

function firstNonEmpty(...values: (string | undefined)[]) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function getServerSupabaseConfig() {
  const url = firstNonEmpty(
    envValue('NEXT_PUBLIC_SUPABASE_URL'),
    envValue('SUPABASE_URL'),
    envValue('VITE_SUPABASE_URL')
  );
  const key = firstNonEmpty(
    envValue('SUPABASE_SERVICE_ROLE_KEY'),
    envValue('SUPABASE_SERVICE_KEY')
  );

  if (!url || !key) {
    const missing: string[] = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
    if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    throw new Error(`BrokerOS Supabase server client missing: ${missing.join(', ')}`);
  }

  return { url: url.replace(/\/$/, ''), key };
}

/**
 * Server-only Supabase client for BrokerOS data reads.
 * Uses the service role key to avoid browser exposure and RLS read blockers.
 */
export function createServerSupabaseAdmin(): SupabaseClient {
  const { url, key } = getServerSupabaseConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

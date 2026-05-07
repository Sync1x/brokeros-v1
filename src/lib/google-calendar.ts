import 'server-only';
import crypto from 'node:crypto';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_EVENTS_URL =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TOKEN_TABLE = 'google_calendar_tokens';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface StoredGoogleCalendarToken {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  scope: string | null;
  token_type: string | null;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function supabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function supabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
}

function getSupabaseConfig() {
  const url = supabaseUrl();
  const key = supabaseKey();

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  return { url: url.replace(/\/$/, ''), key };
}

function stateSecret() {
  return process.env.GOOGLE_OAUTH_STATE_SECRET ?? requiredEnv('GOOGLE_CLIENT_SECRET');
}

function base64Url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function signStatePayload(payload: string) {
  return crypto.createHmac('sha256', stateSecret()).update(payload).digest('base64url');
}

export function createGoogleOAuthState(userId: string) {
  const payload = JSON.stringify({
    userId,
    nonce: crypto.randomBytes(16).toString('hex'),
    exp: Date.now() + 10 * 60 * 1000
  });

  return `${base64Url(payload)}.${signStatePayload(payload)}`;
}

export function verifyGoogleOAuthState(state: string, expectedUserId: string) {
  const [encodedPayload, signature] = state.split('.');
  if (!encodedPayload || !signature) return false;

  const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  const expectedSignature = signStatePayload(payload);
  if (signature.length !== expectedSignature.length) return false;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }

  const parsed = JSON.parse(payload) as { userId: string; exp: number };
  return parsed.userId === expectedUserId && parsed.exp > Date.now();
}

export function getGoogleAuthorizationUrl(userId: string) {
  const params = new URLSearchParams({
    client_id: requiredEnv('GOOGLE_CLIENT_ID'),
    redirect_uri: requiredEnv('GOOGLE_REDIRECT_URI'),
    response_type: 'code',
    scope: CALENDAR_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: createGoogleOAuthState(userId)
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCodeForToken(code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv('GOOGLE_CLIENT_ID'),
      client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: requiredEnv('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${await response.text()}`);
  }

  return (await response.json()) as GoogleTokenResponse;
}

async function upsertCalendarToken(userId: string, token: GoogleTokenResponse) {
  const existing = await getStoredCalendarToken(userId).catch(() => null);
  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
  const { url, key } = getSupabaseConfig();

  const response = await fetch(`${url}/rest/v1/${TOKEN_TABLE}?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      user_id: userId,
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? existing?.refresh_token ?? null,
      expires_at: expiresAt,
      scope: token.scope ?? existing?.scope ?? CALENDAR_SCOPE,
      token_type: token.token_type ?? existing?.token_type ?? 'Bearer',
      updated_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Supabase token upsert failed: ${await response.text()}`);
  }
}

export async function storeGoogleCalendarToken(userId: string, token: GoogleTokenResponse) {
  await upsertCalendarToken(userId, token);
}

export async function getStoredCalendarToken(userId: string) {
  const { url, key } = getSupabaseConfig();
  const params = new URLSearchParams({
    select: 'user_id,access_token,refresh_token,expires_at,scope,token_type',
    user_id: `eq.${userId}`,
    limit: '1'
  });

  const response = await fetch(`${url}/rest/v1/${TOKEN_TABLE}?${params.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Supabase token lookup failed: ${await response.text()}`);
  }

  const rows = (await response.json()) as StoredGoogleCalendarToken[];
  return rows[0] ?? null;
}

async function refreshAccessToken(userId: string, token: StoredGoogleCalendarToken) {
  if (!token.refresh_token) {
    throw new Error('Google Calendar refresh token is missing. Reconnect Google Calendar.');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: requiredEnv('GOOGLE_CLIENT_ID'),
      client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    throw new Error(`Google token refresh failed: ${await response.text()}`);
  }

  const refreshed = (await response.json()) as GoogleTokenResponse;
  await upsertCalendarToken(userId, refreshed);
  return refreshed.access_token;
}

export async function hasGoogleCalendarConnection(userId: string) {
  return Boolean(await getStoredCalendarToken(userId));
}

export async function getValidGoogleAccessToken(userId: string) {
  const token = await getStoredCalendarToken(userId);
  if (!token) return null;

  const expiresAt = new Date(token.expires_at).getTime();
  if (expiresAt - Date.now() > 60 * 1000) {
    return token.access_token;
  }

  return refreshAccessToken(userId, token);
}

export async function listGoogleCalendarEvents(userId: string) {
  const accessToken = await getValidGoogleAccessToken(userId);
  if (!accessToken) return null;

  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 14);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    maxResults: '12',
    singleEvents: 'true',
    orderBy: 'startTime'
  });

  const response = await fetch(`${GOOGLE_CALENDAR_EVENTS_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Google Calendar events.list failed: ${await response.text()}`);
  }

  const data = (await response.json()) as { items?: GoogleCalendarEvent[] };
  return data.items ?? [];
}

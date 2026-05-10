import 'server-only';
import crypto from 'node:crypto';
import { loadEnvConfig } from '@next/env';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';
const TOKEN_TABLE = 'google_calendar_tokens';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

let envLoaded = false;

interface StoredGoogleCalendarTokenRow {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  /** Milliseconds since epoch (Postgres bigint; REST may return string or number) */
  expiry_date: number | string | null;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  colorId?: string;
  calendarId?: string;
  calendarSummary?: string;
  calendarBackgroundColor?: string;
  calendarForegroundColor?: string;
  eventBackgroundColor?: string;
  eventForegroundColor?: string;
  organizer?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  creator?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
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

export interface GoogleCalendarEventUpdate {
  summary?: string;
  description?: string;
  location?: string;
  start?: GoogleCalendarEvent['start'];
  end?: GoogleCalendarEvent['end'];
}

interface GoogleCalendarListEntry {
  id: string;
  summary?: string;
  selected?: boolean;
  hidden?: boolean;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

interface GoogleCalendarColors {
  event?: Record<
    string,
    {
      background: string;
      foreground: string;
    }
  >;
}

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
  if (direct?.trim()) return direct;
  ensureEnvLoaded();
  return process.env[name];
}

function requiredEnv(name: string) {
  const value = envValue(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function firstNonEmpty(...values: (string | undefined)[]) {
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const s = v.trim();
    if (s) return s;
  }
  return undefined;
}

/** Prefer NEXT_PUBLIC_SUPABASE_URL — matches typical .env.local; empty placeholders must not shadow it */
function supabaseUrl() {
  return firstNonEmpty(
    envValue('NEXT_PUBLIC_SUPABASE_URL'),
    envValue('SUPABASE_URL')
  );
}

function supabaseServiceRoleKey() {
  return firstNonEmpty(
    envValue('SUPABASE_SERVICE_ROLE_KEY'),
    envValue('SUPABASE_SERVICE_KEY')
  );
}

function getSupabaseConfig() {
  const url = supabaseUrl();
  const key = supabaseServiceRoleKey();

  if (!url || !key) {
    const missing: string[] = [];
    if (!url) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!key) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY');
    }
    throw new Error(
      `Calendar token storage requires: ${missing.join(', ')}. Optional override: SUPABASE_URL (instead of NEXT_PUBLIC_SUPABASE_URL).`
    );
  }

  return { url: url.replace(/\/$/, ''), key };
}

function expiryDateToMs(
  expiry_date: StoredGoogleCalendarTokenRow['expiry_date']
): number | null {
  if (expiry_date == null) return null;
  if (typeof expiry_date === 'number' && Number.isFinite(expiry_date)) {
    return expiry_date;
  }
  const n = parseInt(String(expiry_date), 10);
  return Number.isFinite(n) ? n : null;
}

function stateSecret() {
  return (
    process.env.GOOGLE_OAUTH_STATE_SECRET ?? requiredEnv('GOOGLE_CLIENT_SECRET')
  );
}

function base64Url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function signStatePayload(payload: string) {
  return crypto
    .createHmac('sha256', stateSecret())
    .update(payload)
    .digest('base64url');
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

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
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
  const expiryMs = Date.now() + token.expires_in * 1000;
  const { url, key } = getSupabaseConfig();

  const response = await fetch(
    `${url}/rest/v1/${TOKEN_TABLE}?on_conflict=user_id`,
    {
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
        expiry_date: expiryMs
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase token upsert failed: ${await response.text()}`);
  }
}

export async function storeGoogleCalendarToken(
  userId: string,
  token: GoogleTokenResponse
) {
  await upsertCalendarToken(userId, token);
}

export async function getStoredCalendarToken(userId: string) {
  const { url, key } = getSupabaseConfig();
  const params = new URLSearchParams({
    select: 'user_id,access_token,refresh_token,expiry_date',
    user_id: `eq.${userId}`,
    limit: '1'
  });

  const response = await fetch(
    `${url}/rest/v1/${TOKEN_TABLE}?${params.toString()}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase token lookup failed: ${await response.text()}`);
  }

  const rows = (await response.json()) as StoredGoogleCalendarTokenRow[];
  return rows[0] ?? null;
}

async function refreshAccessToken(
  userId: string,
  token: StoredGoogleCalendarTokenRow
) {
  if (!token.refresh_token) {
    throw new Error(
      'Google Calendar refresh token is missing. Reconnect Google Calendar.'
    );
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

  const expiryMs = expiryDateToMs(token.expiry_date);
  if (expiryMs != null && expiryMs - Date.now() > 60 * 1000) {
    return token.access_token;
  }

  return refreshAccessToken(userId, token);
}

export async function listGoogleCalendarEvents(userId: string) {
  const accessToken = await getValidGoogleAccessToken(userId);
  if (!accessToken) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(now.getDate() + 1);

  const headers = {
    Authorization: `Bearer ${accessToken}`
  };

  const [calendarListResponse, colorsResponse] = await Promise.all([
    fetch(`${GOOGLE_CALENDAR_API_URL}/users/me/calendarList`, {
      headers,
      cache: 'no-store'
    }),
    fetch(`${GOOGLE_CALENDAR_API_URL}/colors`, {
      headers,
      cache: 'no-store'
    })
  ]);

  if (!calendarListResponse.ok) {
    throw new Error(
      `Google Calendar calendarList.list failed: ${await calendarListResponse.text()}`
    );
  }

  if (!colorsResponse.ok) {
    throw new Error(
      `Google Calendar colors.get failed: ${await colorsResponse.text()}`
    );
  }

  const calendarList = (await calendarListResponse.json()) as {
    items?: GoogleCalendarListEntry[];
  };
  const colors = (await colorsResponse.json()) as GoogleCalendarColors;
  const calendars =
    calendarList.items?.filter(
      (calendar) => calendar.selected && !calendar.hidden
    ) ?? [];

  const eventLists = await Promise.all(
    calendars.map(async (calendar) => {
      const params = new URLSearchParams({
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
        maxResults: '250',
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const response = await fetch(
        `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(calendar.id)}/events?${params.toString()}`,
        {
          headers,
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error(
          `Google Calendar events.list failed: ${await response.text()}`
        );
      }

      const data = (await response.json()) as { items?: GoogleCalendarEvent[] };
      return (data.items ?? []).map((event) => {
        const eventColor = event.colorId
          ? colors.event?.[event.colorId]
          : undefined;

        return {
          ...event,
          calendarId: calendar.id,
          calendarSummary: calendar.summary,
          calendarBackgroundColor: calendar.backgroundColor,
          calendarForegroundColor: calendar.foregroundColor,
          eventBackgroundColor: eventColor?.background,
          eventForegroundColor: eventColor?.foreground
        };
      });
    })
  );

  return eventLists.flat();
}

export async function updateGoogleCalendarEvent(
  userId: string,
  eventId: string,
  event: GoogleCalendarEventUpdate,
  calendarId = 'primary'
) {
  const accessToken = await getValidGoogleAccessToken(userId);
  if (!accessToken) return null;

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(
      `Google Calendar events.patch failed: ${await response.text()}`
    );
  }

  return {
    ...((await response.json()) as GoogleCalendarEvent),
    calendarId
  };
}

export async function deleteGoogleCalendarEvent(
  userId: string,
  eventId: string,
  calendarId = 'primary'
) {
  const accessToken = await getValidGoogleAccessToken(userId);
  if (!accessToken) return null;

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(
      `Google Calendar events.delete failed: ${await response.text()}`
    );
  }

  return true;
}

# Google Calendar Integration

BrokerOS stores Google Calendar OAuth tokens in Supabase via server-side REST calls.

Required environment variables:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Create this table in Supabase:

```sql
create table if not exists public.google_calendar_tokens (
  user_id text primary key,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz not null,
  scope text,
  token_type text,
  updated_at timestamptz not null default now()
);
```

The app writes with the service role key from route handlers only. Do not expose the service role key to the browser.

import {
  exchangeGoogleCodeForToken,
  storeGoogleCalendarToken,
  verifyGoogleOAuthState
} from '@/lib/google-calendar';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/settings?calendar=error&reason=${error}`, request.url));
  }

  if (!userId || !code || !state || !verifyGoogleOAuthState(state, userId)) {
    return NextResponse.redirect(
      new URL('/settings?calendar=error&reason=invalid_state', request.url)
    );
  }

  try {
    // TEMP DEBUG: verify runtime env availability without exposing secret values.
    console.log('[auth/google/callback] env presence', {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      SUPABASE_SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY?.trim()),
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
      GOOGLE_REDIRECT_URI: Boolean(process.env.GOOGLE_REDIRECT_URI?.trim())
    });

    const token = await exchangeGoogleCodeForToken(code);
    await storeGoogleCalendarToken(userId, token);
    return NextResponse.redirect(new URL('/settings?calendar=connected', request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      new URL('/settings?calendar=error&reason=token_store', request.url)
    );
  }
}

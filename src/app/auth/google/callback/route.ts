import {
  exchangeGoogleCodeForToken,
  storeGoogleCalendarToken,
  verifyGoogleOAuthState
} from '@/lib/google-calendar';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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

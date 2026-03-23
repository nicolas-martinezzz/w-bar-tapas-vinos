import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

export async function GET() {
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!adminSessionSecret) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = await verifyAdminSessionToken(sessionToken, adminSessionSecret);

  return NextResponse.json({ authenticated });
}

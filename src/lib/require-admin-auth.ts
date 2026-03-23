import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * Validates the signed admin session cookie for Route Handlers.
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'CONFIG', message: 'Falta configuración de sesión en el servidor.' },
        { status: 500 }
      ),
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifyAdminSessionToken(token, secret);

  if (!valid) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'UNAUTHORIZED', message: 'Sesión no válida.' }, { status: 401 }),
    };
  }

  return { ok: true };
}

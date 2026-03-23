import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_DURATION_SECONDS,
  createAdminSessionToken,
} from '@/lib/admin-session';

function verifyAdminPassword(input: string, expected: string): boolean {
  const a = createHash('sha256').update(input, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(a, b);
}

type LoginBody = {
  password?: string;
};

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !adminSessionSecret) {
    return NextResponse.json(
      { success: false, message: 'Configuración de seguridad incompleta' },
      { status: 500 }
    );
  }

  const body = (await request.json()) as LoginBody;
  if (!body.password) {
    return NextResponse.json(
      { success: false, message: 'La contraseña es obligatoria' },
      { status: 400 }
    );
  }

  if (!verifyAdminPassword(body.password, adminPassword)) {
    return NextResponse.json(
      { success: false, message: 'Credenciales inválidas' },
      { status: 401 }
    );
  }

  const sessionToken = await createAdminSessionToken(adminSessionSecret);
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
  });

  return NextResponse.json({ success: true });
}

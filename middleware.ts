import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminSessionSecret) {
    const securityErrorUrl = request.nextUrl.clone();
    securityErrorUrl.pathname = '/admin';
    securityErrorUrl.searchParams.set('error', 'security-config');
    return NextResponse.redirect(securityErrorUrl);
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = await verifyAdminSessionToken(sessionToken, adminSessionSecret);

  if (pathname === '/admin' && isAuthenticated) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/admin/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname !== '/admin' && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

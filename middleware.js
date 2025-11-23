import { NextResponse } from 'next/server';
import { getAdminTokenFromCookies } from './lib/supabase';

const protectedPaths = ['/admin', '/admin/orders', '/admin/stats'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isLogin = pathname === '/admin/login';

  if (!isProtected || isLogin) {
    return NextResponse.next();
  }

  const tokenFromCookie = getAdminTokenFromCookies(req.headers.get('cookie') || '');

  if (!tokenFromCookie) {
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

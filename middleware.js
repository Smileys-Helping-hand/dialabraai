import { NextResponse } from 'next/server';

const protectedPaths = ['/admin', '/admin/orders', '/admin/stats'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isLogin = pathname === '/admin/login';

  if (!isProtected || isLogin) {
    return NextResponse.next();
  }

  // Check for admin session in localStorage (client-side check)
  // For server-side auth, consider using Firebase Admin SDK to verify tokens
  // For now, allow access (client-side auth check in pages)
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  // Only run middleware on admin routes (keeps it lightweight)
  matcher: ['/admin/:path*'],
};

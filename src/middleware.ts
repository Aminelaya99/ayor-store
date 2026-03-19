import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Exclude explicit public routes, login APIs, and Google Sheet Webhook Sync routes
  if (
    path === '/login' || 
    path.startsWith('/api/auth') || 
    path === '/api/orders/sync'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

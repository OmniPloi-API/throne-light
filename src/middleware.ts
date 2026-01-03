import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Handle author domain
  if (hostname.includes('lightofeolles.com')) {
    // If not already on /author path, redirect
    if (!request.nextUrl.pathname.startsWith('/author')) {
      const url = request.nextUrl.clone();
      url.pathname = '/author';
      return NextResponse.redirect(url);
    }
  }
  
  // Handle book domain
  if (hostname.includes('thecrowdedbedandtheemptythrone.com')) {
    // If not already on /book path, redirect
    if (!request.nextUrl.pathname.startsWith('/book')) {
      const url = request.nextUrl.clone();
      url.pathname = '/book';
      return NextResponse.redirect(url);
    }
  }
  
  // thronelightpublishing.com serves all routes normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - downloads (public downloads)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|downloads).*)',
  ],
};

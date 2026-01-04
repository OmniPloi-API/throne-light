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
    const pathname = request.nextUrl.pathname;
    
    // Allow these paths on the book domain (no redirect)
    const allowedPaths = ['/book', '/reader', '/checkout', '/login', '/register', '/library', '/read'];
    const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));
    
    // If not on an allowed path, redirect to /book
    if (!isAllowedPath && pathname !== '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/book';
      return NextResponse.redirect(url);
    }
    
    // Root path goes to /book
    if (pathname === '/') {
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

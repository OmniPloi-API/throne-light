import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates admin session from the admin_session cookie.
 * Returns true if the session is valid, false otherwise.
 */
export function validateAdminSession(req: NextRequest): boolean {
  const session = req.cookies.get('admin_session')?.value;

  if (!session) {
    return false;
  }

  try {
    const decoded = Buffer.from(session, 'base64').toString();
    const [prefix, timestamp] = decoded.split(':');

    if (prefix !== 'admin') {
      return false;
    }

    // Check if session is expired (8 hours)
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    const eightHours = 8 * 60 * 60 * 1000;

    if (now - sessionTime > eightHours) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Middleware wrapper for admin-protected API routes.
 * Returns 401 if not authenticated, otherwise calls the handler.
 */
export function withAdminAuth<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    if (!validateAdminSession(req)) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      ) as NextResponse<{ error: string }>;
    }
    return handler(req);
  };
}

/**
 * Simple check function for use in route handlers.
 * Returns a 401 response if not authenticated, or null if authenticated.
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  if (!validateAdminSession(req)) {
    return NextResponse.json(
      { error: 'Admin authentication required' },
      { status: 401 }
    );
  }
  return null;
}

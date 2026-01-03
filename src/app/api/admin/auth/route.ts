import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      // Set a secure HTTP-only cookie for admin session
      const response = NextResponse.json({ success: true });
      
      // Create a simple token (in production, use proper JWT)
      const token = Buffer.from(`admin:${Date.now()}:${adminPassword.slice(0, 4)}`).toString('base64');
      
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
      });

      return response;
    }

    // Log failed attempt (in production, add rate limiting)
    console.warn('Failed admin login attempt');
    
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Verify admin session
export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('admin_session');

    if (!session?.value) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify token format
    try {
      const decoded = Buffer.from(session.value, 'base64').toString();
      const [prefix, timestamp] = decoded.split(':');
      
      if (prefix !== 'admin') {
        return NextResponse.json({ authenticated: false });
      }

      // Check if session is expired (8 hours)
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      const eightHours = 8 * 60 * 60 * 1000;
      
      if (now - sessionTime > eightHours) {
        return NextResponse.json({ authenticated: false });
      }

      return NextResponse.json({ authenticated: true });
    } catch {
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}

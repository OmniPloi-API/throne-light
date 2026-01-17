import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_ROLES } from '../users/route';

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
      // Super admin login - full access
      const response = NextResponse.json({ 
        success: true,
        user: {
          id: 'super_admin',
          name: 'Super Admin',
          role: 'super_admin',
          permissions: ['all'],
        }
      });
      
      // Create token for super admin
      const token = Buffer.from(`superadmin:super_admin:super_admin:${Date.now()}`).toString('base64');
      
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

// Verify admin session and return user info with permissions
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session?.value) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify token format
    try {
      const decoded = Buffer.from(session.value, 'base64').toString();
      const parts = decoded.split(':');
      const [prefix, userId, role, timestamp] = parts;
      
      // Support both old format (admin:timestamp:hash) and new format (superadmin/subadmin:id:role:timestamp)
      if (prefix === 'admin') {
        // Old format - treat as super admin for backward compatibility
        const sessionTime = parseInt(parts[1]);
        const now = Date.now();
        const eightHours = 8 * 60 * 60 * 1000;
        
        if (now - sessionTime > eightHours) {
          return NextResponse.json({ authenticated: false });
        }
        
        return NextResponse.json({ 
          authenticated: true,
          user: {
            id: 'super_admin',
            name: 'Super Admin',
            role: 'super_admin',
            permissions: ['all'],
          }
        });
      }
      
      if (prefix !== 'superadmin' && prefix !== 'subadmin') {
        return NextResponse.json({ authenticated: false });
      }

      // Check if session is expired (8 hours)
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      const eightHours = 8 * 60 * 60 * 1000;
      
      if (now - sessionTime > eightHours) {
        return NextResponse.json({ authenticated: false });
      }

      // Get permissions for role
      const rolePermissions = ADMIN_ROLES[role as keyof typeof ADMIN_ROLES]?.permissions || [];

      return NextResponse.json({ 
        authenticated: true,
        user: {
          id: userId,
          role,
          permissions: rolePermissions,
        }
      });
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

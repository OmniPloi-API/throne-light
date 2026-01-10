import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'throne-light-secret-key-change-in-production';

interface LicenseAuthPayload {
  licenseId: string;
  email: string;
  deviceFingerprint: string;
  sessionToken: string;
}

// Validate license-based JWT token
function validateLicenseToken(token: string): LicenseAuthPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as LicenseAuthPayload;
    // Check if this is a license token (has licenseId)
    if (payload.licenseId) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // First try license-based auth (new system)
    const licensePayload = validateLicenseToken(token);
    if (licensePayload) {
      return NextResponse.json({ 
        user: { 
          id: licensePayload.licenseId, 
          email: licensePayload.email, 
          name: null,
          authType: 'license',
        } 
      });
    }
    
    // Fall back to old session-based auth
    const session = validateSession(token);
    
    if (!session.valid) {
      // Clear invalid cookie
      const response = NextResponse.json({ error: session.error }, { status: 401 });
      response.cookies.delete('auth_token');
      return response;
    }
    
    return NextResponse.json({ 
      user: { 
        id: session.user.id, 
        email: session.user.email, 
        name: session.user.name,
        authType: 'session',
      } 
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
  }
}

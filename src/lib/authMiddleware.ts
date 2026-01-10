import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'throne-light-secret-key-change-in-production';

interface LicenseAuthPayload {
  licenseId: string;
  email: string;
  deviceFingerprint: string;
  sessionToken: string;
}

function validateLicenseToken(token: string): LicenseAuthPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as LicenseAuthPayload;
    if (payload && typeof payload === 'object' && 'licenseId' in payload && payload.licenseId) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// Middleware helper to validate session on protected routes
export function withAuth(
  handler: (req: NextRequest, user: { id: string; email: string; name?: string }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // License-based auth (new system)
    const licensePayload = validateLicenseToken(token);
    if (licensePayload) {
      return handler(req, {
        id: licensePayload.licenseId,
        email: licensePayload.email,
        name: undefined,
      });
    }

    const session = validateSession(token);

    if (!session.valid) {
      // This is where "One Device" kicks in
      // If session token doesn't match, user logged in elsewhere
      const response = NextResponse.json(
        { error: session.error },
        { status: 401 }
      );
      response.cookies.delete('auth_token');
      return response;
    }

    return handler(req, {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
  };
}

// Simple validation function for use in route handlers
export function validateRequest(req: NextRequest): {
  valid: true;
  user: { id: string; email: string; name?: string };
} | {
  valid: false;
  response: NextResponse;
} {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // License-based auth (new system)
  const licensePayload = validateLicenseToken(token);
  if (licensePayload) {
    return {
      valid: true,
      user: {
        id: licensePayload.licenseId,
        email: licensePayload.email,
        name: undefined,
      },
    };
  }

  const session = validateSession(token);

  if (!session.valid) {
    const response = NextResponse.json(
      { error: session.error },
      { status: 401 }
    );
    response.cookies.delete('auth_token');
    return { valid: false, response };
  }

  return {
    valid: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
}

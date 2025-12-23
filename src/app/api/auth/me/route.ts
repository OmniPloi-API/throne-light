import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
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
        name: session.user.name 
      } 
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
  }
}

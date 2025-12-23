import { NextRequest, NextResponse } from 'next/server';
import { validateSession, logoutUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (token) {
      const session = validateSession(token);
      if (session.valid) {
        logoutUser(session.user.id);
      }
    }
    
    // Clear the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

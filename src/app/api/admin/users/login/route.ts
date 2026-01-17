import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// Hash password (must match the one in parent route)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + process.env.ADMIN_PASSWORD).digest('hex');
}

/**
 * Sub-admin login
 * POST /api/admin/users/login
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Find admin user by email
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    // Create session token
    const token = Buffer.from(`subadmin:${user.id}:${user.role}:${Date.now()}`).toString('base64');
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    
    // Set session cookie
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Sub-admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

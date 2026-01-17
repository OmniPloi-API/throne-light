import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Admin roles and their permissions
export const ADMIN_ROLES = {
  super_admin: {
    label: 'Super Admin',
    permissions: ['all'], // Full access to everything
  },
  admin: {
    label: 'Admin',
    permissions: [
      'view_dashboard',
      'view_partners',
      'view_orders',
      'view_subscribers',
      'view_feedback',
      'view_support',
      'manage_partners',
      'manage_orders',
      'manage_support',
    ],
  },
  manager: {
    label: 'Manager',
    permissions: [
      'view_dashboard',
      'view_partners',
      'view_orders',
      'view_subscribers',
      'view_feedback',
      'view_support',
      'manage_support',
    ],
  },
  support: {
    label: 'Support',
    permissions: [
      'view_dashboard',
      'view_support',
      'manage_support',
    ],
  },
};

export type AdminRole = keyof typeof ADMIN_ROLES;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  password_hash: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  last_login?: string;
}

// Hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + process.env.ADMIN_PASSWORD).digest('hex');
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// GET - List all admin users (super_admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active, created_at, last_login, created_by')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json({ users: [] });
    }
    
    return NextResponse.json({ users: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ users: [] });
  }
}

// POST - Create new admin user (super_admin only)
export async function POST(req: NextRequest) {
  try {
    const { email, name, role, password, createdBy } = await req.json();
    
    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    
    if (!ADMIN_ROLES[role as AdminRole]) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Cannot create super_admin via API
    if (role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot create super admin via API' }, { status: 403 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    const id = uuidv4();
    const passwordHash = hashPassword(password);
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        id,
        email: email.toLowerCase(),
        name,
        role,
        password_hash: passwordHash,
        is_active: true,
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating admin user:', error);
      return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}

// PATCH - Update admin user (super_admin only)
export async function PATCH(req: NextRequest) {
  try {
    const { id, email, name, role, password, isActive } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Build update object
    const updates: Record<string, any> = {};
    if (email) updates.email = email.toLowerCase();
    if (name) updates.name = name;
    if (role && ADMIN_ROLES[role as AdminRole] && role !== 'super_admin') {
      updates.role = role;
    }
    if (password) updates.password_hash = hashPassword(password);
    if (typeof isActive === 'boolean') updates.is_active = isActive;
    
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating admin user:', error);
      return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 });
  }
}

// DELETE - Delete admin user (super_admin only)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    // Check if trying to delete super_admin
    const { data: user } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', id)
      .single();
    
    if (user?.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 403 });
    }
    
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting admin user:', error);
      return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/adminAuth';

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic';

// GET all books for admin (including inactive, with all fields)
export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const db = readDb();
    const books = db.books || [];
    // Return all books for admin view (still hide fileUrl for security)
    const adminBooks = books.map(({ fileUrl, ...book }) => book);
    return NextResponse.json(adminBooks);
  } catch (error) {
    console.error('Error reading books:', error);
    return NextResponse.json([]);
  }
}

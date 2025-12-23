import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

// GET all books for admin (including inactive, with all fields)
export async function GET() {
  const db = readDb();
  // Return all books for admin view (still hide fileUrl for security)
  const adminBooks = db.books.map(({ fileUrl, ...book }) => book);
  return NextResponse.json(adminBooks);
}

import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { validateRequest } from '@/lib/authMiddleware';

// GET user's library (books they own)
export async function GET(req: NextRequest) {
  const auth = validateRequest(req);
  if (!auth.valid) {
    return auth.response;
  }
  
  const db = readDb();
  
  // Get all library access entries for this user
  const userAccess = db.libraryAccess.filter(la => la.userId === auth.user.id);
  
  // Get the actual book details (without fileUrl)
  const userBooks = userAccess.map(access => {
    const book = db.books.find(b => b.id === access.bookId);
    if (!book) return null;
    
    const { fileUrl, ...safeBook } = book;
    return {
      ...safeBook,
      grantedAt: access.grantedAt,
    };
  }).filter(Boolean);
  
  return NextResponse.json(userBooks);
}

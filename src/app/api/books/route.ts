import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId, DigitalBook } from '@/lib/db';

// GET all books (public - for storefront)
export async function GET() {
  const db = readDb();
  // Only return active books, without fileUrl (security)
  const publicBooks = db.books
    .filter(b => b.isActive)
    .map(({ fileUrl, ...book }) => book);
  return NextResponse.json(publicBooks);
}

// POST create new book (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, author, description, coverImage, fileUrl, price } = body;
    
    if (!title || !coverImage || !fileUrl || price === undefined) {
      return NextResponse.json(
        { error: 'Title, cover image, file URL, and price are required' },
        { status: 400 }
      );
    }
    
    const db = readDb();
    const now = new Date().toISOString();
    
    const newBook: DigitalBook = {
      id: generateId(),
      title,
      subtitle: subtitle || undefined,
      author: author || 'Eolles',
      description: description || undefined,
      coverImage,
      fileUrl,
      price: Number(price),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    db.books.push(newBook);
    writeDb(db);
    
    // Return without fileUrl for security
    const { fileUrl: _, ...safeBook } = newBook;
    return NextResponse.json(safeBook, { status: 201 });
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}

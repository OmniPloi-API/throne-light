import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

// GET single book by ID (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const book = db.books.find(b => b.id === id);
  
  if (!book || !book.isActive) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }
  
  // Return without fileUrl for security
  const { fileUrl, ...safeBook } = book;
  return NextResponse.json(safeBook);
}

// PUT update book (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = readDb();
    
    const bookIndex = db.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    const updatedBook = {
      ...db.books[bookIndex],
      ...body,
      id: db.books[bookIndex].id, // Prevent ID change
      createdAt: db.books[bookIndex].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };
    
    db.books[bookIndex] = updatedBook;
    writeDb(db);
    
    // Return without fileUrl
    const { fileUrl, ...safeBook } = updatedBook;
    return NextResponse.json(safeBook);
  } catch (error) {
    console.error('Update book error:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

// DELETE book (soft delete - set isActive to false)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDb();
    
    const bookIndex = db.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    db.books[bookIndex].isActive = false;
    db.books[bookIndex].updatedAt = new Date().toISOString();
    writeDb(db);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete book error:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}

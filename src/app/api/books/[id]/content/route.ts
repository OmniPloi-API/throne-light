import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { validateRequest } from '@/lib/authMiddleware';

// GET book content - PROTECTED with "One Device" enforcement
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate session (One Device check happens here)
  const auth = validateRequest(req);
  if (!auth.valid) {
    return auth.response;
  }
  
  const { id } = await params;
  const db = readDb();
  
  // Check if user has access to this book
  const access = db.libraryAccess.find(
    la => la.userId === auth.user.id && la.bookId === id
  );
  
  if (!access) {
    return NextResponse.json(
      { error: 'You do not have access to this book' },
      { status: 403 }
    );
  }
  
  // Get the book
  const book = db.books.find(b => b.id === id);
  if (!book || !book.isActive) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }
  
  // In production, this would:
  // 1. Generate a signed URL for S3/Blob storage
  // 2. Or stream the file directly through the API
  // For now, return the file URL (in production, this should be a signed URL)
  
  // Option A: Return signed URL (for S3)
  // const signedUrl = await generateSignedUrl(book.fileUrl);
  // return NextResponse.json({ url: signedUrl, expiresIn: 3600 });
  
  // Option B: For local development, return the file URL directly
  // In production, replace with signed URL generation
  return NextResponse.json({
    bookId: book.id,
    title: book.title,
    // In production: use AWS S3 getSignedUrl or similar
    // For dev: serve from public folder or return placeholder
    contentUrl: book.fileUrl,
    expiresIn: 3600, // 1 hour
    watermark: auth.user.email, // For reader to display
  });
}

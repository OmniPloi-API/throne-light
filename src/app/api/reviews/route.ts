import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId, Review } from '@/lib/db';
import { seedReviews } from '@/data/seed-reviews';

// GET - Fetch all approved reviews (or all for admin)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get('all') === 'true'; // Admin flag
  const pendingOnly = searchParams.get('pending') === 'true';
  
  const db = readDb();
  
  // Initialize with seed reviews if empty
  if (db.reviews.length === 0) {
    db.reviews = seedReviews;
    writeDb(db);
  }
  
  let reviews = db.reviews;
  
  if (pendingOnly) {
    reviews = reviews.filter(r => r.status === 'PENDING');
  } else if (!includeAll) {
    reviews = reviews.filter(r => r.status === 'APPROVED');
  }
  
  // Sort by date, newest first
  reviews = reviews.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Calculate stats
  const approvedReviews = db.reviews.filter(r => r.status === 'APPROVED');
  const totalReviews = approvedReviews.length;
  const averageRating = totalReviews > 0 
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;
  
  return NextResponse.json({
    reviews,
    stats: {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      pendingCount: db.reviews.filter(r => r.status === 'PENDING').length,
    }
  });
}

// POST - Submit a new review (goes to pending)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, rating, content, country, countryFlag } = body;
    
    if (!name || !email || !rating || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    
    const db = readDb();
    
    // Check if this email already submitted a review
    const existingReview = db.reviews.find(r => r.email.toLowerCase() === email.toLowerCase());
    if (existingReview) {
      return NextResponse.json({ error: 'You have already submitted a review' }, { status: 400 });
    }
    
    // Check for verified purchase by email
    const isVerifiedPurchase = db.orders.some(
      o => o.customerEmail?.toLowerCase() === email.toLowerCase() && o.status === 'COMPLETED'
    );
    
    // Detect if content has emojis (simplified check)
    const hasEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/.test(content);
    
    // Get IP and device info from headers
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    
    const newReview: Review = {
      id: generateId(),
      name,
      email,
      rating,
      content,
      country: country || 'US',
      countryFlag: countryFlag || '🇺🇸',
      device: isMobile ? 'mobile' : 'desktop',
      hasEmoji,
      status: 'PENDING',
      isVerifiedPurchase,
      ipAddress: ip,
      createdAt: new Date().toISOString(),
    };
    
    db.reviews.push(newReview);
    writeDb(db);
    
    return NextResponse.json({ 
      success: true, 
      review: newReview,
      message: 'Your review has been submitted and is pending approval.',
      isVerifiedPurchase,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

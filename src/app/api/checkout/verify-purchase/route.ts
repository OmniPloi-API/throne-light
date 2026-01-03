import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Check for purchase token in cookies
    const cookieStore = cookies();
    const purchaseToken = cookieStore.get('throne-light-purchase');
    
    // Also check localStorage indicator via a different method
    // For now, we'll use cookies as the source of truth
    
    if (purchaseToken && purchaseToken.value) {
      // Verify the token is valid (in production, verify against database)
      // For now, if the cookie exists, we consider it a valid purchase
      return NextResponse.json({ 
        hasPurchased: true,
        bookId: 'crowded-bed-empty-throne'
      });
    }
    
    // No purchase found
    return NextResponse.json({ 
      hasPurchased: false 
    });
    
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return NextResponse.json({ 
      hasPurchased: false,
      error: 'Unable to verify purchase status'
    });
  }
}

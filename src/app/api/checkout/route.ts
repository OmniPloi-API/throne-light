import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPartnerById, readDb } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const DEFAULT_BOOK_PRICE = 29.99; // Digital book price
const DEFAULT_BOOK_NAME = 'The Crowded Bed & The Empty Throne';

export async function POST(req: NextRequest) {
  try {
    const { partnerId, couponCode, bookId } = await req.json();
    
    // Get book details if bookId provided
    let bookPrice = DEFAULT_BOOK_PRICE;
    let bookName = DEFAULT_BOOK_NAME;
    let actualBookId = bookId;
    
    if (bookId) {
      const db = readDb();
      const book = db.books.find(b => b.id === bookId && b.isActive);
      if (book) {
        bookPrice = book.price;
        bookName = book.title;
      }
    } else {
      // Default to first active book if no bookId specified
      const db = readDb();
      const defaultBook = db.books.find(b => b.isActive);
      if (defaultBook) {
        actualBookId = defaultBook.id;
        bookPrice = defaultBook.price;
        bookName = defaultBook.title;
      }
    }
    
    let discountPercent = 0;
    let partnerData = null;
    
    if (partnerId) {
      const partner = getPartnerById(partnerId);
      if (partner) {
        partnerData = partner;
        discountPercent = partner.discountPercent;
      }
    }
    
    const finalPrice = bookPrice * (1 - discountPercent / 100);
    const priceInCents = Math.round(finalPrice * 100);
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: bookName,
              description: partnerData 
                ? `${discountPercent}% discount applied via ${partnerData.name}'s link`
                : 'Digital book purchase',
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Redirect to thank-you page with install prompt
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel`,
      metadata: {
        partner_id: partnerId || '',
        coupon_code: couponCode || '',
        book_id: actualBookId || '',
        original_price: bookPrice.toString(),
        discount_percent: discountPercent.toString(),
      },
    });
    
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

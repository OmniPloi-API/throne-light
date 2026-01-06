import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPartnerById } from '@/lib/db-supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const DEFAULT_BOOK_PRICE = 29.99; // Digital book price
const DEFAULT_BOOK_NAME = 'The Crowded Bed & The Empty Throne';

export async function POST(req: NextRequest) {
  try {
    const { partnerId, couponCode, bookId } = await req.json();
    
    // Use default book details (can be extended to fetch from DB if multiple books)
    const bookPrice = DEFAULT_BOOK_PRICE;
    const bookName = DEFAULT_BOOK_NAME;
    const actualBookId = bookId || 'default-book';
    
    let discountPercent = 0;
    let partnerData = null;
    
    if (partnerId) {
      console.log(`Checkout: Looking up partner ${partnerId}`);
      const partner = await getPartnerById(partnerId);
      console.log(`Checkout: Partner lookup result:`, partner ? { name: partner.name, discount: partner.discountPercent, active: partner.isActive } : 'not found');
      if (partner && partner.isActive) {
        partnerData = partner;
        discountPercent = partner.discountPercent;
      }
    }
    
    console.log(`Checkout: Final discount: ${discountPercent}%, Price: $${DEFAULT_BOOK_PRICE} -> $${DEFAULT_BOOK_PRICE * (1 - discountPercent / 100)}`);
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

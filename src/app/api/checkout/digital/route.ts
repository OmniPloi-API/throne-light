import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to prevent build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  try {
    const stripeClient = getStripe();
    
    if (!stripeClient) {
      console.error('Stripe is not configured - STRIPE_SECRET_KEY is missing');
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email } = body;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Crowded Bed & The Empty Throne - Digital Edition',
              description: 'Instant access to the Throne Light Reader with the complete book',
              images: [`${baseUrl}/images/book-cover.jpg`],
            },
            unit_amount: 2999, // $29.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/reader/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book`,
      customer_email: email || undefined,
      metadata: {
        product_type: 'digital',
        book_id: 'crowded-bed-empty-throne',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

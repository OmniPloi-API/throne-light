// Add Device License Checkout API
// Creates a Stripe checkout session for purchasing an additional device slot
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateLicense } from '@/lib/reader-licensing';

// Lazy initialization to prevent build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

const ADD_DEVICE_PRICE = 1499; // $14.99 in cents

export async function POST(req: NextRequest) {
  try {
    const stripeClient = getStripe();
    
    if (!stripeClient) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 503 }
      );
    }

    const { licenseCode } = await req.json();

    if (!licenseCode) {
      return NextResponse.json({ error: 'License code is required' }, { status: 400 });
    }

    // Validate the license exists and is active
    const validation = await validateLicense(licenseCode);
    
    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.error || 'Invalid license code' 
      }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thronelightpublishing.com';

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Additional Device License',
              description: 'Add +1 device slot to your Throne Light Reader license',
              images: ['https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png'],
            },
            unit_amount: ADD_DEVICE_PRICE,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/checkout/add-device/success?session_id={CHECKOUT_SESSION_ID}&license=${licenseCode}`,
      cancel_url: `${baseUrl}/checkout/add-device?license=${licenseCode}`,
      metadata: {
        type: 'add_device',
        license_code: licenseCode,
        license_id: validation.licenseId || '',
        current_max_devices: String(validation.maxDevices || 2),
      },
    };
    
    // Only add customer_email if we have one
    if (validation.email) {
      sessionParams.customer_email = validation.email;
    }
    
    const session = await stripeClient.checkout.sessions.create(sessionParams);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Add device checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

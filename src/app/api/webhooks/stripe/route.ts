import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPartnerById as getPartnerByIdJson, readDb, writeDb, generateId } from '@/lib/db';
import { createOrder as createOrderSupabase, getPartnerById as getPartnerByIdSupabase, convertPendingSaleToSale } from '@/lib/db-supabase';
import { hashPassword, generateSessionToken } from '@/lib/auth';
import { createLicenseFromPurchase, sendReaderDownloadEmail } from '@/lib/reader-licensing';
import { getSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Log webhook events for debugging - non-blocking, fire-and-forget
function logWebhookEvent(eventType: string, sessionId: string | null, amount: number, status: string, details: string) {
  // Always log to console for Railway logs
  console.log(`[WEBHOOK] ${status}: ${eventType} - amount=${amount}, ${details}`);
  
  // Fire and forget to database - don't block the main flow
  try {
    const supabase = getSupabaseAdmin();
    supabase.from('webhook_logs').insert({
      event_type: eventType,
      stripe_session_id: sessionId,
      amount,
      status,
      details,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silently ignore - we already logged to console
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    
    let event: Stripe.Event;
    
    // Verify webhook signature (skip in dev if no secret)
    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Dev mode - parse without verification
      event = JSON.parse(body);
    }
    
    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const partnerId = session.metadata?.partner_id || null;
      const bookId = session.metadata?.book_id || null;
      const totalAmount = (session.amount_total || 0) / 100;
      const customerEmail = session.customer_email || session.customer_details?.email || undefined;
      
      let commissionEarned = 0;
      
      if (partnerId) {
        // Try Supabase first, fallback to JSON
        let partner = await getPartnerByIdSupabase(partnerId);
        if (!partner) partner = getPartnerByIdJson(partnerId) || null;
        if (partner) {
          commissionEarned = (totalAmount * partner.commissionPercent) / 100;
          
          // Convert PENDING_SALE to SALE in Supabase (primary)
          const converted = await convertPendingSaleToSale(partnerId);
          if (converted) {
            console.log(`[WEBHOOK] Converted PENDING_SALE to SALE in Supabase for partner ${partnerId}`);
          } else {
            console.log(`[WEBHOOK] No PENDING_SALE found to convert for partner ${partnerId}`);
          }
          
          // Also update JSON file for backward compatibility
          const db = readDb();
          const pendingSaleEvent = db.events.find(e => 
            e.partnerId === partnerId && 
            e.type === 'PENDING_SALE' &&
            new Date(e.createdAt).getTime() > Date.now() - (60 * 60 * 1000)
          );
          
          if (pendingSaleEvent) {
            pendingSaleEvent.type = 'SALE';
          } else {
            db.events.push({
              id: crypto.randomUUID(),
              partnerId,
              type: 'SALE',
              createdAt: new Date().toISOString(),
            });
          }
          writeDb(db);
        }
      }
      
      // Create order record in Supabase with idempotency check
      let orderId: string | undefined;
      try {
        // Check if order already exists for this session (idempotency)
        const { getOrderByStripeSession } = await import('@/lib/db-supabase');
        const existingOrder = await getOrderByStripeSession(session.id);
        
        if (existingOrder) {
          logWebhookEvent('checkout.session.completed', session.id, totalAmount, 'SKIPPED', 
            `Order already exists: ${existingOrder.id}`);
          orderId = existingOrder.id;
        } else {
          // Calculate maturity date (16 days from now)
          const maturityDate = new Date();
          maturityDate.setDate(maturityDate.getDate() + 16);
          
          // Log the attempt (non-blocking)
          logWebhookEvent('checkout.session.completed', session.id, totalAmount, 'ATTEMPTING', 
            `email=${customerEmail}, partnerId=${partnerId}, paymentIntent=${session.payment_intent}`);
          
          const order = await createOrderSupabase({
            partnerId: partnerId || undefined,
            stripeSessionId: session.id,
            stripeChargeId: session.payment_intent as string || undefined,
            stripePaymentIntentId: session.payment_intent as string || undefined,
            totalAmount,
            commissionEarned,
            customerEmail,
            customerName: session.customer_details?.name || undefined,
            status: 'COMPLETED',
            maturityDate: maturityDate.toISOString(),
            isMatured: false,
            refundStatus: 'NONE',
          });
          orderId = order.id;
          
          // Log success (non-blocking)
          logWebhookEvent('checkout.session.completed', session.id, totalAmount, 'SUCCESS', 
            `orderId=${orderId}, commission=${commissionEarned}`);
        }
      } catch (dbError: unknown) {
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        const errorDetails = dbError && typeof dbError === 'object' && 'code' in dbError ? (dbError as { code: string }).code : 'unknown';
        
        // Log failure (non-blocking)
        logWebhookEvent('checkout.session.completed', session.id, totalAmount, 'FAILED', 
          `error=${errorMessage}, code=${errorDetails}`);
      }
      
      // DIGITAL PURCHASE: Create license and send download email
      // Handle both 'reader' and 'digital' product types, or any purchase with an email
      const productType = session.metadata?.product_type;
      const isDigitalPurchase = productType === 'reader' || productType === 'digital' || (!productType && customerEmail);
      if (isDigitalPurchase && customerEmail) {
        const licenseResult = await createLicenseFromPurchase(
          customerEmail,
          session.customer_details?.name || null,
          session.id,
          session.payment_intent as string || null,
          session.customer as string || null,
          session.amount_total || 0,
          session.currency || 'usd'
        );

        if (licenseResult.success && licenseResult.licenseId && licenseResult.licenseCode) {
          await sendReaderDownloadEmail(
            licenseResult.licenseId,
            customerEmail,
            session.customer_details?.name || null,
            licenseResult.licenseCode
          );
          console.log(`Reader license created and email sent: ${licenseResult.licenseCode}`);
        } else {
          console.error('Failed to create Reader license:', licenseResult.error);
        }
      }

      // PHASE 2: Create user account and grant library access
      if (customerEmail && bookId) {
        const db = readDb();
        
        // Check if user exists, create if not
        let user = db.users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase());
        
        if (!user) {
          // Generate a random password (user will need to reset or we email them)
          const tempPassword = crypto.randomUUID().slice(0, 12);
          const hashedPassword = await hashPassword(tempPassword);
          const now = new Date().toISOString();
          const sessionToken = generateSessionToken();
          
          user = {
            id: generateId(),
            email: customerEmail.toLowerCase(),
            password: hashedPassword,
            activeSessions: [{
              token: sessionToken,
              createdAt: now,
            }],
            createdAt: now,
            updatedAt: now,
          };
          
          db.users.push(user);
          console.log(`Created new user account for: ${customerEmail}`);
          
          // TODO: Send welcome email with temp password or magic link
        }
        
        // Grant library access if not already granted
        const existingAccess = db.libraryAccess.find(
          la => la.userId === user!.id && la.bookId === bookId
        );
        
        if (!existingAccess) {
          db.libraryAccess.push({
            id: generateId(),
            userId: user.id,
            bookId,
            orderId,
            grantedAt: new Date().toISOString(),
          });
          console.log(`Granted library access for book ${bookId} to user ${user.id}`);
        }
        
        writeDb(db);
      }
    }
    
    // Handle refunds
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const db = readDb();
      
      // Find and update the order status
      const order = db.orders.find((o) => 
        o.stripeSessionId === charge.payment_intent || 
        o.stripePaymentIntentId === charge.payment_intent
      );
      if (order) {
        order.status = 'REFUNDED';
        order.refundStatus = 'APPROVED';
        order.refundApprovedAt = new Date().toISOString();
        writeDb(db);
        console.log(`Order ${order.id} marked as refunded`);
      }
    }
    
    // Handle disputes (chargebacks)
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object as Stripe.Dispute;
      const db = readDb();
      
      // Find and flag the order as disputed
      const order = db.orders.find((o) => 
        o.stripeChargeId === dispute.charge ||
        o.stripePaymentIntentId === dispute.payment_intent
      );
      if (order) {
        order.refundStatus = 'DISPUTED';
        writeDb(db);
        console.log(`Order ${order.id} flagged as DISPUTED - chargeback detected`);
        // TODO: Send admin notification
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrder, getPartnerById, readDb, writeDb, generateId } from '@/lib/db';
import { hashPassword, generateSessionToken } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

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
        const partner = getPartnerById(partnerId);
        if (partner) {
          commissionEarned = (totalAmount * partner.commissionPercent) / 100;
          
          // Also record the CLICK_DIRECT event if not already recorded
          const db = readDb();
          db.events.push({
            id: crypto.randomUUID(),
            partnerId,
            type: 'CLICK_DIRECT',
            createdAt: new Date().toISOString(),
          });
          writeDb(db);
        }
      }
      
      // Create order record (idempotent via stripeSessionId unique constraint)
      let orderId: string | undefined;
      try {
        const order = createOrder({
          partnerId: partnerId || undefined,
          stripeSessionId: session.id,
          totalAmount,
          commissionEarned,
          customerEmail,
          status: 'COMPLETED',
        });
        orderId = order.id;
        console.log(`Order recorded: $${totalAmount}, commission: $${commissionEarned}`);
      } catch (dbError) {
        // Likely duplicate - Stripe may send webhook twice
        console.log('Order may already exist (duplicate webhook)');
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
          
          user = {
            id: generateId(),
            email: customerEmail.toLowerCase(),
            password: hashedPassword,
            activeSessionToken: generateSessionToken(),
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
      const order = db.orders.find((o) => o.stripeSessionId === charge.payment_intent);
      if (order) {
        order.status = 'REFUNDED';
        writeDb(db);
        console.log(`Order ${order.id} marked as refunded`);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

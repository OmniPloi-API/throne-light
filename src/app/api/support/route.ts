import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId, SupportTicket } from '@/lib/db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function generateTicketNumber(): string {
  const db = readDb();
  const year = new Date().getFullYear();
  const ticketCount = db.supportTickets.length + 1;
  return `TL-${year}-${ticketCount.toString().padStart(4, '0')}`;
}

// GET - Fetch all support tickets (admin only)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  
  const db = readDb();
  let tickets = db.supportTickets || [];
  
  // Filter by status if provided
  if (status && status !== 'all') {
    tickets = tickets.filter(t => t.status === status);
  }
  
  // Filter by priority if provided
  if (priority && priority !== 'all') {
    tickets = tickets.filter(t => t.priority === priority);
  }
  
  // Sort by date, newest first
  tickets = tickets.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Calculate stats
  const stats = {
    total: db.supportTickets.length,
    open: db.supportTickets.filter(t => t.status === 'OPEN').length,
    inProgress: db.supportTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: db.supportTickets.filter(t => t.status === 'RESOLVED').length,
    closed: db.supportTickets.filter(t => t.status === 'CLOSED').length,
    urgent: db.supportTickets.filter(t => t.priority === 'URGENT' && t.status !== 'CLOSED').length,
  };
  
  return NextResponse.json({ tickets, stats });
}

// POST - Submit a new support ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, subject, message, orderNumber } = body;
    
    // Validation
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, category, subject, and message are required' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }
    
    const db = readDb();
    const now = new Date().toISOString();
    
    // Determine priority based on category
    let priority: SupportTicket['priority'] = 'MEDIUM';
    if (category === 'REFUND_REQUEST' || category === 'ORDER_ISSUE') {
      priority = 'HIGH';
    } else if (category === 'GENERAL_INQUIRY') {
      priority = 'LOW';
    }
    
    const newTicket: SupportTicket = {
      id: generateId(),
      ticketNumber: generateTicketNumber(),
      name,
      email,
      category,
      subject,
      message,
      orderNumber: orderNumber || undefined,
      priority,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };
    
    db.supportTickets = db.supportTickets || [];
    db.supportTickets.push(newTicket);
    writeDb(db);
    
    // Send email notification to admin
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Throne Light Support <noreply@thronelightpublishing.com>',
          to: 'info@thronelightpublishing.com',
          subject: `[${newTicket.ticketNumber}] New Support Ticket: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #c9a961;">New Support Ticket Received</h2>
              <div style="background: #f9f7f3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ticket Number:</strong> ${newTicket.ticketNumber}</p>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Category:</strong> ${category.replace('_', ' ')}</p>
                <p><strong>Priority:</strong> ${priority}</p>
                ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
                <p><strong>Subject:</strong> ${subject}</p>
              </div>
              <div style="background: #fff; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 20px; color: #666;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/support" style="color: #c9a961;">
                  View in Admin Panel →
                </a>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    }
    
    // Send confirmation email to customer
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Throne Light Support <noreply@thronelightpublishing.com>',
          to: email,
          subject: `[${newTicket.ticketNumber}] We received your support request`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #c9a961;">Thank You for Contacting Us</h2>
              <p>Dear ${name},</p>
              <p>We have received your support request and will get back to you as soon as possible.</p>
              <div style="background: #f9f7f3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ticket Number:</strong> ${newTicket.ticketNumber}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Category:</strong> ${category.replace('_', ' ')}</p>
              </div>
              <p>Please save your ticket number for future reference. We typically respond within 24-48 hours.</p>
              <p style="margin-top: 30px;">
                Warm regards,<br>
                <strong>Throne Light Publishing Support Team</strong>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send customer confirmation email:', emailError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      ticketNumber: newTicket.ticketNumber,
      message: 'Your support ticket has been submitted successfully. You will receive a confirmation email shortly.'
    });
  } catch (error) {
    console.error('Support ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to submit support ticket' },
      { status: 500 }
    );
  }
}

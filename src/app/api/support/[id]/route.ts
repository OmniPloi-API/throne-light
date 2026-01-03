import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, SupportTicket } from '@/lib/db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// PATCH - Update a support ticket (admin actions)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, adminNotes, assignedTo, priority } = body;
    
    const db = readDb();
    const ticketIndex = db.supportTickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    const ticket = db.supportTickets[ticketIndex];
    const now = new Date().toISOString();
    
    // Update based on action
    switch (action) {
      case 'in_progress':
        ticket.status = 'IN_PROGRESS';
        break;
      case 'resolve':
        ticket.status = 'RESOLVED';
        ticket.resolvedAt = now;
        // Send resolution email to customer
        if (resend) {
          try {
            await resend.emails.send({
              from: 'Throne Light Support <noreply@thronelightpublishing.com>',
              to: ticket.email,
              subject: `[${ticket.ticketNumber}] Your support ticket has been resolved`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #c9a961;">Your Support Ticket Has Been Resolved</h2>
                  <p>Dear ${ticket.name},</p>
                  <p>We're pleased to inform you that your support ticket has been resolved.</p>
                  <div style="background: #f9f7f3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
                    <p><strong>Subject:</strong> ${ticket.subject}</p>
                    ${adminNotes ? `<p><strong>Resolution Notes:</strong> ${adminNotes}</p>` : ''}
                  </div>
                  <p>If you have any further questions, feel free to submit a new support request.</p>
                  <p style="margin-top: 30px;">
                    Warm regards,<br>
                    <strong>Throne Light Publishing Support Team</strong>
                  </p>
                </div>
              `,
            });
          } catch (emailError) {
            console.error('Failed to send resolution email:', emailError);
          }
        }
        break;
      case 'close':
        ticket.status = 'CLOSED';
        ticket.closedAt = now;
        break;
      case 'reopen':
        ticket.status = 'OPEN';
        ticket.resolvedAt = undefined;
        ticket.closedAt = undefined;
        break;
    }
    
    // Update other fields if provided
    if (adminNotes !== undefined) {
      ticket.adminNotes = adminNotes;
    }
    if (assignedTo !== undefined) {
      ticket.assignedTo = assignedTo;
    }
    if (priority !== undefined) {
      ticket.priority = priority;
    }
    
    ticket.updatedAt = now;
    db.supportTickets[ticketIndex] = ticket;
    writeDb(db);
    
    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a support ticket (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = readDb();
    
    const ticketIndex = db.supportTickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    db.supportTickets.splice(ticketIndex, 1);
    writeDb(db);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}

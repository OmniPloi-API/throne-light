import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    const db = readDb();
    
    // Find partner by email (case-insensitive)
    const partner = db.partners.find((p: any) => 
      p.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!partner) {
      // For security, don't reveal if the email exists
      // Just return success anyway
      return NextResponse.json({ 
        success: true,
        message: 'If this email is registered, you will receive your access code.'
      });
    }
    
    // In production, you would send an email here
    // For now, we'll just log it and return success
    console.log(`Access code request for ${email}: ${partner.accessCode || partner.couponCode}`);
    
    // TODO: Implement email sending
    // await sendEmail({
    //   to: partner.email,
    //   subject: 'Your Partner Portal Access Code',
    //   body: `Your access code is: ${partner.accessCode || partner.couponCode}`
    // });
    
    return NextResponse.json({ 
      success: true,
      message: 'Access code sent to your email'
    });
    
  } catch (error) {
    console.error('Request access error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

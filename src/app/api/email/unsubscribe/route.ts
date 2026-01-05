// Unsubscribe endpoint for Light of EOLLES and other email campaigns

import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return new NextResponse(renderUnsubscribePage(false, 'Invalid unsubscribe link'), {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // Decode token: base64(email:campaignSlug)
    let email: string;
    let campaignSlug: string;
    
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      [email, campaignSlug] = decoded.split(':');
    } catch {
      return new NextResponse(renderUnsubscribePage(false, 'Invalid unsubscribe link'), {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    if (!email || !campaignSlug) {
      return new NextResponse(renderUnsubscribePage(false, 'Invalid unsubscribe link'), {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    const db = readDb();
    
    // Find subscriber
    const subscriber = db.subscribers.find(
      s => s.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!subscriber) {
      return new NextResponse(renderUnsubscribePage(false, 'Subscriber not found'), {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // Mark subscriber as unsubscribed
    subscriber.unsubscribedAt = new Date().toISOString();
    
    // Pause any campaign states for this subscriber
    const campaignStates = db.subscriberCampaignStates.filter(
      s => s.subscriberId === subscriber.id
    );
    
    for (const state of campaignStates) {
      state.isPaused = true;
    }
    
    writeDb(db);
    
    console.log(`Unsubscribed ${email} from ${campaignSlug}`);
    
    return new NextResponse(renderUnsubscribePage(true, email), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(renderUnsubscribePage(false, 'An error occurred'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// POST for one-click unsubscribe (List-Unsubscribe-Post header support)
export async function POST(request: NextRequest) {
  return GET(request);
}

function renderUnsubscribePage(success: boolean, message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? 'Unsubscribed' : 'Unsubscribe Error'} | Light of EOLLES</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: linear-gradient(180deg, #0a0a0a 0%, #111 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #f5f0e6;
    }
    .container {
      max-width: 500px;
      text-align: center;
    }
    .crown {
      width: 64px;
      height: 64px;
      margin-bottom: 24px;
    }
    h1 {
      color: #c9a961;
      font-size: 28px;
      margin-bottom: 16px;
    }
    p {
      color: #a0a0a0;
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    .email {
      color: #c9a961;
      font-style: italic;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #c9a961 0%, #a88a4a 100%);
      color: #0a0a0a;
      font-size: 14px;
      font-weight: bold;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .error {
      color: #ef4444;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://thronelightpublishing.com/images/THRONELIGHT-CROWN.png" alt="Crown" class="crown">
    ${success ? `
      <h1>You Have Been Unsubscribed</h1>
      <p>
        We have removed <span class="email">${message}</span> from the Light of EOLLES mailing list.
      </p>
      <p>
        We are sorry to see you go. If this was a mistake or you change your mind you are always welcome to return.
      </p>
      <a href="https://thronelightpublishing.com/author" class="btn">
        Return to EOLLES
      </a>
    ` : `
      <h1 class="error">Unable to Unsubscribe</h1>
      <p>
        ${message}
      </p>
      <p>
        If you continue to have issues please contact us at support@thronelightpublishing.com
      </p>
      <a href="https://thronelightpublishing.com" class="btn">
        Visit Website
      </a>
    `}
  </div>
</body>
</html>
  `.trim();
}

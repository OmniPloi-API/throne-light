import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId, PartnerFeedback } from '@/lib/db';
import OpenAI from 'openai';

// Lazy OpenAI client initialization
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (_openai === null && process.env.OPENAI_API_KEY) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

function generateFeedbackNumber(): string {
  const db = readDb();
  const year = new Date().getFullYear();
  const feedbackCount = (db.partnerFeedback?.length || 0) + 1;
  return `FB-${year}-${feedbackCount.toString().padStart(4, '0')}`;
}

async function processWithAI(rawFeedback: string, pageUrl: string, sectionName?: string): Promise<string> {
  const openaiClient = getOpenAI();
  if (!openaiClient) {
    return `[AI Processing Unavailable]\n\nRaw Feedback:\n${rawFeedback}\n\nPage: ${pageUrl}${sectionName ? `\nSection: ${sectionName}` : ''}`;
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a technical translator that converts informal user feedback into precise, IDE-ready instructions. The project is a Next.js/React web application with TypeScript and TailwindCSS.

Your output should be formatted as actionable development instructions that can be copy-pasted directly into a conversation with an AI coding assistant (like Cursor, Windsurf Cascade, or GitHub Copilot).

Format your response as:
1. A brief summary of what changes are requested
2. Specific file paths that likely need to be modified (based on the page URL and common Next.js patterns)
3. Detailed step-by-step instructions for implementing the changes
4. Any relevant code snippets or pseudo-code if applicable

Be precise, technical, and actionable. Assume the developer receiving these instructions has full context of the codebase.`
        },
        {
          role: 'user',
          content: `Convert this partner feedback into IDE-ready instructions:

Page URL: ${pageUrl}
${sectionName ? `Section: ${sectionName}` : ''}

Feedback:
${rawFeedback}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || rawFeedback;
  } catch (error) {
    console.error('AI processing error:', error);
    return `[AI Processing Failed]\n\nRaw Feedback:\n${rawFeedback}\n\nPage: ${pageUrl}${sectionName ? `\nSection: ${sectionName}` : ''}`;
  }
}

// GET - Fetch all feedback (admin only)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  const db = readDb();
  let feedback = db.partnerFeedback || [];
  
  // Filter by status if provided
  if (status && status !== 'all') {
    feedback = feedback.filter(f => f.status === status);
  }
  
  // Sort by date, newest first
  feedback = feedback.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Calculate stats
  const stats = {
    total: db.partnerFeedback?.length || 0,
    new: (db.partnerFeedback || []).filter(f => f.status === 'NEW').length,
    reviewed: (db.partnerFeedback || []).filter(f => f.status === 'REVIEWED').length,
    inProgress: (db.partnerFeedback || []).filter(f => f.status === 'IN_PROGRESS').length,
    completed: (db.partnerFeedback || []).filter(f => f.status === 'COMPLETED').length,
  };
  
  return NextResponse.json({ feedback, stats });
}

// POST - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerName, partnerEmail, pageUrl, sectionName, screenshotBase64, rawFeedback } = body;
    
    // Validation
    if (!partnerName || !rawFeedback || !pageUrl) {
      return NextResponse.json(
        { error: 'Partner name, feedback, and page URL are required' },
        { status: 400 }
      );
    }
    
    const db = readDb();
    const now = new Date().toISOString();
    
    // Process feedback with AI
    const aiProcessedInstructions = await processWithAI(rawFeedback, pageUrl, sectionName);
    
    const newFeedback: PartnerFeedback = {
      id: generateId(),
      feedbackNumber: generateFeedbackNumber(),
      partnerName,
      partnerEmail: partnerEmail || undefined,
      pageUrl,
      sectionName: sectionName || undefined,
      screenshotBase64: screenshotBase64 || undefined,
      rawFeedback,
      aiProcessedInstructions,
      status: 'NEW',
      createdAt: now,
    };
    
    db.partnerFeedback = db.partnerFeedback || [];
    db.partnerFeedback.push(newFeedback);
    writeDb(db);
    
    return NextResponse.json({ 
      success: true, 
      feedbackNumber: newFeedback.feedbackNumber,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import OpenAI from 'openai';

// Lazy OpenAI client initialization
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (_openai === null && process.env.OPENAI_API_KEY) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
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
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supabase = getSupabaseAdmin();
    
    // Build query
    let query = supabase
      .from('partner_feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data: feedback, error } = await query;
    
    if (error) {
      console.error('Feedback fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
    
    // Get stats
    const { data: allFeedback } = await supabase
      .from('partner_feedback')
      .select('status');
    
    const stats = {
      total: allFeedback?.length || 0,
      new: allFeedback?.filter(f => f.status === 'NEW').length || 0,
      reviewed: allFeedback?.filter(f => f.status === 'REVIEWED').length || 0,
      inProgress: allFeedback?.filter(f => f.status === 'IN_PROGRESS').length || 0,
      completed: allFeedback?.filter(f => f.status === 'COMPLETED').length || 0,
    };
    
    // Transform to match existing frontend expectations
    const transformedFeedback = (feedback || []).map(f => ({
      id: f.id,
      feedbackNumber: f.feedback_number,
      partnerName: f.partner_name,
      partnerEmail: f.partner_id, // Using partner_id field for email
      pageUrl: f.page_url,
      sectionName: f.section_name,
      screenshotBase64: f.screenshot_url,
      rawFeedback: f.raw_feedback,
      aiProcessedInstructions: f.processed_feedback,
      status: f.status,
      adminNotes: f.admin_notes,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));
    
    return NextResponse.json({ feedback: transformedFeedback, stats });
  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
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
    
    const supabase = getSupabaseAdmin();
    
    // Process feedback with AI
    const aiProcessedInstructions = await processWithAI(rawFeedback, pageUrl, sectionName);
    
    // Insert into Supabase (feedback_number is auto-generated by trigger)
    const { data: newFeedback, error } = await supabase
      .from('partner_feedback')
      .insert({
        partner_name: partnerName,
        partner_id: partnerEmail || null,
        page_url: pageUrl,
        section_name: sectionName || null,
        screenshot_url: screenshotBase64 || null,
        raw_feedback: rawFeedback,
        processed_feedback: aiProcessedInstructions,
        status: 'NEW',
      })
      .select('feedback_number')
      .single();
    
    if (error) {
      console.error('Feedback insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      feedbackNumber: newFeedback?.feedback_number,
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

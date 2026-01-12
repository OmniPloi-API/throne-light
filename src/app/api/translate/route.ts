import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not configured');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

type TranslateRequestBody = {
  text: string;
  targetLang: string;
  sourceLang?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslateRequestBody;
    const { text, targetLang, sourceLang = 'en' } = body;

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields: text, targetLang' },
        { status: 400 }
      );
    }

    if (targetLang === 'en' || targetLang === sourceLang) {
      return NextResponse.json({ translatedText: text });
    }

    // Try OpenAI first
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a translation engine. Translate the user text precisely and naturally. Return only the translated text, with no quotes and no extra commentary.',
          },
          {
            role: 'user',
            content: `Translate from ${sourceLang} to ${targetLang}:\n\n${text}`,
          },
        ],
        temperature: 0.2,
      });

      const translatedText = completion.choices?.[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error('Empty translation from OpenAI');
      }

      return NextResponse.json({ translatedText });
    } catch (openaiError) {
      console.warn('OpenAI translation failed, trying LibreTranslate fallback', openaiError);

      // Fallback to LibreTranslate (free public instance)
      try {
        const libreResponse = await fetch('https://libretranslate.com/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text',
          }),
        });

        if (!libreResponse.ok) {
          throw new Error(`LibreTranslate error: ${libreResponse.status}`);
        }

        const data = await libreResponse.json();
        const translatedText = data.translatedText;

        if (!translatedText) {
          throw new Error('Empty translation from LibreTranslate');
        }

        return NextResponse.json({ translatedText });
      } catch (fallbackError) {
        console.error('All translation methods failed', { openaiError, fallbackError });
        const message = openaiError instanceof Error && openaiError.message.includes('OPENAI_API_KEY')
          ? 'Translation service is not configured. Please contact support.'
          : 'Translation service temporarily unavailable.';
        return NextResponse.json(
          { error: message, details: fallbackError instanceof Error ? fallbackError.message : 'Unknown error' },
          { status: 503 }
        );
      }
    }
  } catch (error) {
    console.error('Translate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to translate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

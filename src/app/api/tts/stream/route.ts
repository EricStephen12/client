import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
const MAX_TEXT_LENGTH = 5000;

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body?.text || typeof body.text !== 'string') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  if (body.text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `text too long (max ${MAX_TEXT_LENGTH} characters)` },
      { status: 400 },
    );
  }

  const { getToken } = getAuth(req);
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/tts/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/x-ndjson',
      },
      body: JSON.stringify({
        text: body.text,
        voice: body.voice || 'af_heart',
        lang: body.lang || 'en-us',
        emotion: body.emotion || 'neutral',
        speed: body.speed ?? 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'TTS service error');
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    if (!response.body) {
      return NextResponse.json({ error: 'TTS stream empty' }, { status: 502 });
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[TTS stream proxy] failed:', detail);
    return NextResponse.json({ error: 'TTS service unavailable', detail }, { status: 502 });
  }
}

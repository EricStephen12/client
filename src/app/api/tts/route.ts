import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
const MAX_TEXT_LENGTH = 5000;

async function resolveBearerToken(req: NextRequest): Promise<string | null> {
  const header = req.headers.get('authorization');
  if (header?.startsWith('Bearer ') && header.length > 14) {
    return header.slice(7);
  }
  const session = await auth();
  return (await session.getToken()) ?? null;
}

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

  const token = await resolveBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: body.text,
        voice: body.voice || 'nova',
        lang: body.lang || 'en-us',
        emotion: body.emotion || 'neutral',
        speed: body.speed ?? 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'TTS service error');
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'audio/mpeg';
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-TTS-Provider': response.headers.get('X-TTS-Provider') || '',
        'X-Audio-Duration-S': response.headers.get('X-Audio-Duration-S') || '',
        'X-Real-Time-Factor': response.headers.get('X-Real-Time-Factor') || '',
        'X-Segments': response.headers.get('X-Segments') || '',
      },
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[TTS proxy] failed:', detail);
    return NextResponse.json({ error: 'TTS service unavailable', detail }, { status: 502 });
  }
}

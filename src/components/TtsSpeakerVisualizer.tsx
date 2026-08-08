'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import VoiceAgentVisualizer from './VoiceAgentVisualizer';

interface Props {
  textToSpeak?: string;
  /**
   * Sentence-level speak from LLM stream. Same turnId enqueues onto one timeline;
   * a new turnId starts a fresh reply.
   */
  speakUtterance?: { turnId: number; sentence: string } | null;
  onSpeakEnd?: () => void;
  messages?: Array<{ role: string; content: string; type?: string }>;
  isThinking?: boolean;
  onSendMessage?: (text: string) => void;
  isSending?: boolean;
  onForgeBrief?: () => void;
  /** Exit Live mode (Gemini End button) */
  onEndSession?: () => void;
  userName?: string;
}

type VoiceError = 'auth' | 'unavailable' | 'blocked-autoplay' | 'mic-unsupported' | null;

function micUnsupportedReason(): string {
  if (typeof window === 'undefined') return 'Voice isn’t available here.';
  if (!window.isSecureContext) {
    return 'Open this page on localhost to use the mic.';
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'This browser can’t use the mic.';
  }
  return 'Mic unavailable.';
}

function pickRecorderMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

/** Per-request TTS limit (mirrors server / proxy / engine). */
const TTS_CHUNK_CHARS = 4800;
/** Micro-breath between stream segments — long gaps feel like the AI stalled. */
const BREATH_MS = 80;
/** Don't start playback until this many PCM segments are buffered (avoids mid-reply silence). */
const STREAM_LEAD_CHUNKS = 2;
/** Or until this much audio is buffered — whichever comes first. */
const STREAM_LEAD_SEC = 2.8;
const TTS_SPEED = 1.15;
/** Ignore a second stage-tap for this long after listening starts (kills accidental double-tap send). */
const LISTEN_ARM_MS = 900;
/** Discard clips shorter than this — almost always a mis-tap, not a real question. */
const MIN_SEND_MS = 1000;
/** Hard cap so a forgotten mic doesn't run forever. */
const MAX_RECORD_MS = 45000;
/** Continuous Live: RMS above this counts as speech (0–1 scale). */
const VAD_SPEECH_RMS = 0.035;
/** Continuous Live: silence after speech → auto-send. */
const VAD_SILENCE_MS = 1100;
/** Barge-in while AI talks — higher than listen VAD to resist speaker echo. */
const BARGE_SPEECH_RMS = 0.07;
/** Barge-in requires sustained user speech this long. */
const BARGE_HOLD_MS = 320;

function stripMarkdownForSpeech(raw: string): string {
  return raw
    .replace(/\*\*?/g, '')
    .replace(/__?/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-•]\s+/gm, '')
    .replace(/`+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split oversized speakable text on sentence boundaries for sequential stream requests. */
function chunkForSpeech(cleaned: string, maxChars: number): string[] {
  if (!cleaned) return [];
  if (cleaned.length <= maxChars) return [cleaned];
  const chunks: string[] = [];
  let rest = cleaned;
  while (rest.length > maxChars) {
    const slice = rest.slice(0, maxChars);
    const lastSentence = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
    );
    const cut =
      lastSentence > maxChars * 0.4
        ? lastSentence + 1
        : Math.max(slice.lastIndexOf(' '), maxChars);
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/**
 * Turn assistant markdown into speakable text.
 * Initial analysis dumps get a short score summary; normal chat replies are spoken in full.
 */
function prepareSpeakText(raw: string): string {
  const isInitialReport =
    /Performance Scores|Product Intelligence Report|Ask me anything — why the hook works/i.test(raw);

  if (isInitialReport) {
    const hook = raw.match(/Hook Power:\s*\*?\*?(\d+)/i)?.[1];
    const retention = raw.match(/Retention Logic:\s*\*?\*?(\d+)/i)?.[1];
    const conversion = raw.match(/Conversion Trigger:\s*\*?\*?(\d+)/i)?.[1];
    if (hook && retention && conversion) {
      return `I've finished analyzing this video. Hook power ${hook} out of 10, retention ${retention}, conversion ${conversion}. Ask me anything about the hook, retention, or scripts.`;
    }
    return (
      stripMarkdownForSpeech(raw).slice(0, 220) ||
      "I've finished analyzing this video. Ask me anything about the hook, retention, or scripts."
    );
  }

  // Full reply — no artificial short-sentence cut
  return stripMarkdownForSpeech(raw);
}

export default function VoiceLounge({
  textToSpeak,
  speakUtterance = null,
  onSpeakEnd,
  messages = [],
  isThinking = false,
  onSendMessage,
  isSending = false,
  onForgeBrief,
  onEndSession,
  userName,
}: Props) {
  const { getToken } = useAuth();
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [isListening, setIsListening]       = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isHeld, setIsHeld]                 = useState(false);
  const [chatInput, setChatInput]           = useState('');
  const [lastSpoken, setLastSpoken]         = useState<string | undefined>(undefined);
  const [voiceError, setVoiceError]         = useState<VoiceError>(null);
  const [micHint, setMicHint]               = useState<string | null>(null);

  const audioRef          = useRef<HTMLAudioElement | null>(null);
  const audioContextRef   = useRef<AudioContext | null>(null);
  const analyserRef       = useRef<AnalyserNode | null>(null);
  const transcriptRef     = useRef<HTMLDivElement | null>(null);
  const audioIntensityRef = useRef<number>(0.8);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const mediaChunksRef    = useRef<Blob[]>([]);
  const mediaStreamRef    = useRef<MediaStream | null>(null);
  const recordMaxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPlayRef    = useRef(false);
  const lastTextRef       = useRef<string | null>(null);
  const ttsAbortRef       = useRef<AbortController | null>(null);
  const streamSourcesRef  = useRef<AudioBufferSourceNode[]>([]);
  const streamEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaWiredRef     = useRef(false);
  /** Only auto-speak replies after the user has sent something (mic or type). */
  const userSentRef       = useRef(false);
  /** True while the user is holding the mic (handles getUserMedia race). */
  const wantRecordRef     = useRef(false);
  /** When true, recorder onstop discards audio instead of sending. */
  const discardRecordRef  = useRef(false);
  /** Blocks overlapping startListening() calls while getUserMedia is in flight. */
  const listenStartingRef = useRef(false);
  /** performance.now() when recording actually began — used for arm + min-length guards. */
  const listenStartedAtRef = useRef(0);
  const isListeningRef    = useRef(false);
  /** Gemini Live–style: keep listening after AI speaks; VAD auto-sends on pause. */
  const continuousRef     = useRef(true);
  const vadRafRef         = useRef(0);
  const vadSourceRef      = useRef<MediaStreamAudioSourceNode | null>(null);
  const vadAnalyserRef    = useRef<AnalyserNode | null>(null);
  const speechHeardRef    = useRef(false);
  const lastSpeechAtRef   = useRef(0);
  const isHeldRef         = useRef(false);
  const isSpeakingRef     = useRef(false);
  const isLoadingRef      = useRef(false);
  const bargeStreamRef    = useRef<MediaStream | null>(null);
  const bargeLoudSinceRef = useRef(0);
  const lastUtteranceKeyRef = useRef('');
  const stopSpeakingRef = useRef<() => void>(() => {});
  const startListeningRef = useRef<(opts?: { continuousArm?: boolean }) => Promise<void>>(async () => {});
  /** Shared playback timeline for streamed sentence TTS */
  const pipelineRef = useRef<{
    turnId: number;
    abort: AbortController | null;
    nextStart: number;
    sampleRate: number;
    started: boolean;
    endTimer: ReturnType<typeof setTimeout> | null;
  }>({ turnId: -1, abort: null, nextStart: 0, sampleRate: 24000, started: false, endTimer: null });
  const insecureContext   = typeof window !== 'undefined' && !window.isSecureContext;

  const stopStreamSources = useCallback(() => {
    if (streamEndTimerRef.current) {
      clearTimeout(streamEndTimerRef.current);
      streamEndTimerRef.current = null;
    }
    for (const src of streamSourcesRef.current) {
      try { src.stop(); } catch { /* already stopped */ }
    }
    streamSourcesRef.current = [];
  }, []);

  const initAudio = useCallback(() => {
    const existing = audioContextRef.current;
    if (existing && existing.state !== 'closed') return;

    audioContextRef.current = null;
    analyserRef.current = null;
    mediaWiredRef.current = false;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.80;
    analyserRef.current = analyser;
    analyser.connect(ctx.destination);

    // Optional <audio> graph for WAV fallback / blocked-autoplay resume
    if (audioRef.current && !mediaWiredRef.current) {
      try {
        const src = ctx.createMediaElementSource(audioRef.current);
        src.connect(analyser);
        mediaWiredRef.current = true;
      } catch {
        mediaWiredRef.current = false;
      }
    }
  }, []);

  const resumeAudioContext = useCallback(async () => {
    initAudio();
    const live = audioContextRef.current;
    if (live && live.state === 'suspended') {
      await live.resume();
    }
  }, [initAudio]);

  useEffect(() => {
    if (showTranscript && transcriptRef.current)
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, showTranscript, isThinking]);

  useEffect(() => {
    if (!window.isSecureContext) {
      setMicHint('Open http://localhost:3000 (not the 192.168… IP) so the mic works.');
    }
  }, []);

  useEffect(() => () => {
    if (recordMaxTimerRef.current) clearTimeout(recordMaxTimerRef.current);
    try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isHeldRef.current = isHeld;
  }, [isHeld]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const stopVadWatch = useCallback(() => {
    if (vadRafRef.current) {
      cancelAnimationFrame(vadRafRef.current);
      vadRafRef.current = 0;
    }
    try { vadSourceRef.current?.disconnect(); } catch { /* ignore */ }
    try { vadAnalyserRef.current?.disconnect(); } catch { /* ignore */ }
    vadSourceRef.current = null;
    vadAnalyserRef.current = null;
  }, []);

  const stopBargeWatch = useCallback(() => {
    stopVadWatch();
    bargeStreamRef.current?.getTracks().forEach((t) => t.stop());
    bargeStreamRef.current = null;
    bargeLoudSinceRef.current = 0;
  }, [stopVadWatch]);

  const startBargeWatch = useCallback(async () => {
    if (isHeldRef.current || wantRecordRef.current || isListeningRef.current) return;
    if (bargeStreamRef.current) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return;
    try {
      await resumeAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      if (isHeldRef.current || wantRecordRef.current || isListeningRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      if (!isSpeakingRef.current && !isLoadingRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      bargeStreamRef.current = stream;
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      src.connect(analyser);
      vadSourceRef.current = src;
      vadAnalyserRef.current = analyser;
      bargeLoudSinceRef.current = 0;
      const data = new Uint8Array(2048);
      const tick = () => {
        vadRafRef.current = requestAnimationFrame(tick);
        if (!bargeStreamRef.current) return;
        if (!(isSpeakingRef.current || isLoadingRef.current)) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const now = performance.now();
        if (rms >= BARGE_SPEECH_RMS) {
          if (!bargeLoudSinceRef.current) bargeLoudSinceRef.current = now;
          if (now - bargeLoudSinceRef.current >= BARGE_HOLD_MS) {
            stopBargeWatch();
            stopSpeakingRef.current();
            void startListeningRef.current({ continuousArm: true });
          }
        } else {
          bargeLoudSinceRef.current = 0;
        }
      };
      vadRafRef.current = requestAnimationFrame(tick);
    } catch (err: unknown) {
      console.warn('[VoiceLounge] barge watch unavailable:', err);
    }
  }, [resumeAudioContext, stopBargeWatch]);

  useEffect(() => {
    if (!textToSpeak || textToSpeak === lastSpoken) return;
    setLastSpoken(textToSpeak);
    lastTextRef.current = textToSpeak;
    // Streamed utterances already own TTS for Live — skip duplicate full-reply speak
    if (pipelineRef.current.turnId >= 0 && pipelineRef.current.started) return;
    // Do NOT auto-speak the opening analysis dump — it blocks the mic and feels broken.
    // Only speak after the user has sent a question (voice or typed).
    // Never start TTS while the mic is open — that steals the UI into "One moment…".
    if (userSentRef.current && !wantRecordRef.current && !isListeningRef.current) {
      speakText(textToSpeak);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToSpeak]);

  useEffect(() => () => {
    ttsAbortRef.current?.abort();
    stopBargeWatch();
    stopVadWatch();
    stopStreamSources();
    const ctx = audioContextRef.current;
    audioContextRef.current = null;
    analyserRef.current = null;
    ctx?.close().catch(() => {});
    if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
  }, [stopStreamSources, stopVadWatch, stopBargeWatch]);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (analyserRef.current && (isSpeaking || isLoading || isThinking)) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const limit = Math.floor(data.length * 0.5);
        let sum = 0;
        for (let i = 0; i < limit; i++) sum += data[i];
        const avg = sum / limit;
        audioIntensityRef.current += (1 + (avg / 255) * 4 - audioIntensityRef.current) * 0.15;
      } else if (isListening || isTranscribing) {
        const pulse = 1 + 0.06 * Math.sin(Date.now() / 200);
        audioIntensityRef.current += (pulse - audioIntensityRef.current) * 0.12;
      } else {
        audioIntensityRef.current += (0.8 - audioIntensityRef.current) * 0.06;
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSpeaking, isLoading, isThinking, isListening, isTranscribing]);

  const speakText = async (text: string) => {
    if (!text.trim()) return;
    // Mic owns the stage — don't flip into TTS "One moment…" while the user is talking
    if (wantRecordRef.current || isListeningRef.current || listenStartingRef.current) return;
    const speakable = prepareSpeakText(text);
    if (!speakable) return;
    const textChunks = chunkForSpeech(speakable, TTS_CHUNK_CHARS);
    if (textChunks.length === 0) return;

    ttsAbortRef.current?.abort();
    stopStreamSources();
    const abort = new AbortController();
    ttsAbortRef.current = abort;

    lastTextRef.current = text;
    pendingPlayRef.current = false;
    setVoiceError(null);
    setIsLoading(true);
    isLoadingRef.current = true;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    stopBargeWatch();

    try {
      await resumeAudioContext();
      const ctx = audioContextRef.current;
      const analyser = analyserRef.current;
      if (!ctx || !analyser || abort.signal.aborted) return;

      let sampleRate = 24000;
      let nextStart = 0;
      let startedPlayback = false;
      let pendingDuration = 0;
      const pending: Array<{ buffer: AudioBuffer; pauseAfterMs: number }> = [];

      const markPlaybackStarted = () => {
        if (startedPlayback) return;
        startedPlayback = true;
        setIsLoading(false);
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        isLoadingRef.current = false;
        void startBargeWatch();
      };

      const scheduleBuffer = (buffer: AudioBuffer, pauseAfterMs = 0) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        const startAt = Math.max(ctx.currentTime + 0.02, nextStart);
        source.start(startAt);
        const breathMs = Math.min(Math.max(0, pauseAfterMs || 0), BREATH_MS);
        nextStart = startAt + buffer.duration + breathMs / 1000;
        streamSourcesRef.current.push(source);
        markPlaybackStarted();
      };

      const flushPending = () => {
        while (pending.length > 0) {
          const item = pending.shift();
          if (item) scheduleBuffer(item.buffer, item.pauseAfterMs);
        }
        pendingDuration = 0;
      };

      /** Hold audio until we have a lead buffer, then play gaplessly. */
      const enqueuePcm = (b64: string, pauseAfterMs: number) => {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        if (bytes.byteLength < 2) return;
        const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

        const buffer = ctx.createBuffer(1, float32.length, sampleRate);
        buffer.copyToChannel(float32, 0);

        if (!startedPlayback) {
          pending.push({ buffer, pauseAfterMs });
          pendingDuration += buffer.duration;
          if (
            pending.length >= STREAM_LEAD_CHUNKS ||
            pendingDuration >= STREAM_LEAD_SEC
          ) {
            flushPending();
          }
          return;
        }
        scheduleBuffer(buffer, pauseAfterMs);
      };

      const authHeaders = async (): Promise<Record<string, string>> => {
        let token = await getToken();
        if (!token) token = await getToken({ skipCache: true });
        return {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      };

      const fetchFullWavAndPlay = async (chunkText: string) => {
        const headers = await authHeaders();
        let res = await fetch('/api/tts', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: chunkText,
            voice: 'af_heart',
            lang: 'en-us',
            emotion: 'neutral',
            speed: TTS_SPEED,
          }),
          signal: abort.signal,
        });
        if (res.status === 401) {
          const retryHeaders = await authHeaders();
          res = await fetch('/api/tts', {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({
              text: chunkText,
              voice: 'af_heart',
              lang: 'en-us',
              emotion: 'neutral',
              speed: TTS_SPEED,
            }),
            signal: abort.signal,
          });
        }
        if (!res.ok) throw new Error(`TTS failed (${res.status})`);
        const ab = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(ab.slice(0));
        scheduleBuffer(buffer);
      };

      const processNdjsonLine = (line: string) => {
        if (!line.trim()) return;
        let ev: { type: string; sample_rate?: number; data?: string; pause_after_ms?: number; message?: string };
        try {
          ev = JSON.parse(line) as typeof ev;
        } catch {
          return;
        }
        if (ev.type === 'start' && typeof ev.sample_rate === 'number') {
          sampleRate = ev.sample_rate;
        } else if (ev.type === 'audio_chunk' && typeof ev.data === 'string') {
          enqueuePcm(ev.data, ev.pause_after_ms ?? 0);
        } else if (ev.type === 'error') {
          throw new Error(ev.message || 'TTS stream error');
        }
      };

      const consumeStream = async (body: ReadableStream<Uint8Array>) => {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let lineBuf = '';
        let chunks = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (abort.signal.aborted) {
            await reader.cancel();
            break;
          }
          lineBuf += decoder.decode(value, { stream: true });
          const lines = lineBuf.split('\n');
          lineBuf = lines.pop() ?? '';
          for (const line of lines) {
            const before = pending.length + streamSourcesRef.current.length;
            processNdjsonLine(line);
            if (pending.length + streamSourcesRef.current.length > before) chunks += 1;
          }
        }
        if (lineBuf.trim() && !abort.signal.aborted) {
          processNdjsonLine(lineBuf);
          chunks += 1;
        }
        // Stream ended — play whatever we were holding for lead buffer
        if (!startedPlayback && pending.length > 0) flushPending();
        return chunks;
      };

      for (let i = 0; i < textChunks.length; i++) {
        if (abort.signal.aborted) return;
        const headers = await authHeaders();
        let res = await fetch('/api/tts/stream', {
          method: 'POST',
          headers: { ...headers, Accept: 'application/x-ndjson' },
          body: JSON.stringify({
            text: textChunks[i],
            voice: 'af_heart',
            lang: 'en-us',
            emotion: 'neutral',
            speed: TTS_SPEED,
          }),
          signal: abort.signal,
        });
        if (res.status === 401) {
          const retryHeaders = await authHeaders();
          res = await fetch('/api/tts/stream', {
            method: 'POST',
            headers: { ...retryHeaders, Accept: 'application/x-ndjson' },
            body: JSON.stringify({
              text: textChunks[i],
              voice: 'af_heart',
              lang: 'en-us',
              emotion: 'neutral',
              speed: TTS_SPEED,
            }),
            signal: abort.signal,
          });
          if (res.status === 401) {
            setVoiceError('auth');
            throw new Error('TTS failed (401)');
          }
        }

        const contentType = res.headers.get('Content-Type') || '';
        if (contentType.includes('audio/')) {
          // OpenAI / WAV fallback path from proxy
          const ab = await res.arrayBuffer();
          const buffer = await ctx.decodeAudioData(ab.slice(0));
          scheduleBuffer(buffer);
          continue;
        }

        if (!res.ok || !res.body) {
          console.warn(`[VoiceLounge] stream ${res.status} — full WAV fallback`);
          await fetchFullWavAndPlay(textChunks[i]);
          continue;
        }

        const n = await consumeStream(res.body);
        if (!abort.signal.aborted && n === 0 && !startedPlayback) {
          console.warn('[VoiceLounge] empty stream — full WAV fallback');
          await fetchFullWavAndPlay(textChunks[i]);
        }
      }

      if (abort.signal.aborted) return;
      if (!startedPlayback) {
        setVoiceError('unavailable');
        onSpeakEnd?.();
        return;
      }

      const remainingMs = Math.max(0, (nextStart - ctx.currentTime) * 1000) + 80;
      streamEndTimerRef.current = setTimeout(() => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        stopBargeWatch();
        onSpeakEnd?.();
        // Continuous Live: open the mic again when the AI finishes talking
        if (
          continuousRef.current &&
          !isHeldRef.current &&
          !wantRecordRef.current &&
          !listenStartingRef.current
        ) {
          void startListening({ continuousArm: true });
        }
      }, remainingMs);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[VoiceLounge] Kokoro TTS failed:', err);
      stopStreamSources();
      stopBargeWatch();
      setVoiceError('unavailable');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onSpeakEnd?.();
    } finally {
      if (ttsAbortRef.current === abort) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  };

  /** Streamed LLM sentence → TTS onto a shared turn timeline (no mid-reply restart). */
  const speakUtteranceChunk = async (turnId: number, sentence: string) => {
    const cleaned = stripMarkdownForSpeech(sentence);
    if (!cleaned) return;
    if (wantRecordRef.current || isListeningRef.current || listenStartingRef.current) return;

    let pipe = pipelineRef.current;
    if (pipe.turnId !== turnId || !pipe.abort || pipe.abort.signal.aborted) {
      ttsAbortRef.current?.abort();
      stopStreamSources();
      stopBargeWatch();
      const abort = new AbortController();
      ttsAbortRef.current = abort;
      pipe = {
        turnId,
        abort,
        nextStart: 0,
        sampleRate: 24000,
        started: false,
        endTimer: null,
      };
      pipelineRef.current = pipe;
      setVoiceError(null);
      setIsLoading(true);
      isLoadingRef.current = true;
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }

    const abort = pipe.abort;
    if (!abort) return;

    try {
      await resumeAudioContext();
      const ctx = audioContextRef.current;
      const analyser = analyserRef.current;
      if (!ctx || !analyser || abort.signal.aborted) return;

      const scheduleBuffer = (buffer: AudioBuffer, pauseAfterMs = 0) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        const startAt = Math.max(ctx.currentTime + 0.02, pipe.nextStart);
        source.start(startAt);
        const breathMs = Math.min(Math.max(0, pauseAfterMs || 0), BREATH_MS);
        pipe.nextStart = startAt + buffer.duration + breathMs / 1000;
        streamSourcesRef.current.push(source);
        if (!pipe.started) {
          pipe.started = true;
          setIsLoading(false);
          isLoadingRef.current = false;
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          void startBargeWatch();
        }
        if (pipe.endTimer) clearTimeout(pipe.endTimer);
        const remainingMs = Math.max(0, (pipe.nextStart - ctx.currentTime) * 1000) + 120;
        pipe.endTimer = setTimeout(() => {
          if (pipelineRef.current.turnId !== turnId) return;
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          stopBargeWatch();
          onSpeakEnd?.();
          if (
            continuousRef.current &&
            !isHeldRef.current &&
            !wantRecordRef.current &&
            !listenStartingRef.current
          ) {
            void startListening({ continuousArm: true });
          }
        }, remainingMs);
        streamEndTimerRef.current = pipe.endTimer;
      };

      const token = (await getToken()) || (await getToken({ skipCache: true }));
      const res = await fetch('/api/tts/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/x-ndjson',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: cleaned,
          voice: 'af_heart',
          lang: 'en-us',
          emotion: 'neutral',
          speed: TTS_SPEED,
        }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) throw new Error(`TTS failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuf = '';
      let pending: Array<{ buffer: AudioBuffer; pauseAfterMs: number }> = [];
      let pendingDuration = 0;

      const flushPending = () => {
        while (pending.length) {
          const item = pending.shift();
          if (item) scheduleBuffer(item.buffer, item.pauseAfterMs);
        }
        pendingDuration = 0;
      };

      const enqueuePcm = (b64: string, pauseAfterMs: number) => {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        if (bytes.byteLength < 2) return;
        const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
        const buffer = ctx.createBuffer(1, float32.length, pipe.sampleRate);
        buffer.copyToChannel(float32, 0);
        if (!pipe.started) {
          pending.push({ buffer, pauseAfterMs });
          pendingDuration += buffer.duration;
          if (pending.length >= 1 || pendingDuration >= 1.2) flushPending();
          return;
        }
        scheduleBuffer(buffer, pauseAfterMs);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (abort.signal.aborted) {
          await reader.cancel();
          break;
        }
        lineBuf += decoder.decode(value, { stream: true });
        const lines = lineBuf.split('\n');
        lineBuf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          let ev: { type: string; sample_rate?: number; data?: string; pause_after_ms?: number };
          try {
            ev = JSON.parse(line) as typeof ev;
          } catch {
            continue;
          }
          if (ev.type === 'start' && typeof ev.sample_rate === 'number') {
            pipe.sampleRate = ev.sample_rate;
          } else if (ev.type === 'audio_chunk' && typeof ev.data === 'string') {
            enqueuePcm(ev.data, ev.pause_after_ms ?? 0);
          }
        }
      }
      if (lineBuf.trim() && !abort.signal.aborted) {
        try {
          const ev = JSON.parse(lineBuf) as { type: string; data?: string; pause_after_ms?: number };
          if (ev.type === 'audio_chunk' && typeof ev.data === 'string') {
            enqueuePcm(ev.data, ev.pause_after_ms ?? 0);
          }
        } catch { /* ignore */ }
      }
      if (!pipe.started && pending.length) flushPending();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[VoiceLounge] utterance TTS failed:', err);
      if (pipelineRef.current.turnId === turnId && !pipelineRef.current.started) {
        setVoiceError('unavailable');
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  };

  useEffect(() => {
    if (!speakUtterance?.sentence) return;
    const key = `${speakUtterance.turnId}:${speakUtterance.sentence}`;
    if (key === lastUtteranceKeyRef.current) return;
    lastUtteranceKeyRef.current = key;
    userSentRef.current = true;
    void speakUtteranceChunk(speakUtterance.turnId, speakUtterance.sentence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakUtterance]);

  /** Handles orb taps while in an error state. Returns true if the tap was consumed. */
  const resumeOrRetryVoice = (): boolean => {
    if (pendingPlayRef.current && audioRef.current?.src) {
      pendingPlayRef.current = false;
      setVoiceError(null);
      resumeAudioContext().catch(() => {});
      audioRef.current.play()
        .then(() => setIsSpeaking(true))
        .catch((err: unknown) => {
          console.error('[VoiceLounge] resume playback failed:', err);
          setVoiceError('unavailable');
        });
      return true;
    }
    if (voiceError === 'unavailable' && lastTextRef.current) {
      speakText(lastTextRef.current);
      return true;
    }
    return false;
  };

  const stopSpeaking = () => {
    ttsAbortRef.current?.abort();
    stopStreamSources();
    stopBargeWatch();
    pipelineRef.current = {
      turnId: -1,
      abort: null,
      nextStart: 0,
      sampleRate: 24000,
      started: false,
      endTimer: null,
    };
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setIsLoading(false);
    isLoadingRef.current = false;
    onSpeakEnd?.();
  };

  const stopMediaTracks = () => {
    stopVadWatch();
    if (recordMaxTimerRef.current) {
      clearTimeout(recordMaxTimerRef.current);
      recordMaxTimerRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  const transcribeAndSend = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setMicHint(null);
    try {
      const token = await getToken();
      if (!token) {
        setVoiceError('auth');
        setMicHint('Sign in to use voice.');
        return;
      }
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
      const form = new FormData();
      form.append('audio', blob, `voice.${ext}`);

      const res = await fetch('/api/main/api/transcribe', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        throw new Error('voice_failed');
      }
      const data = await res.json() as { text?: string };
      const text = (data.text || '').trim();
      if (!text) {
        setMicHint('Didn’t catch that — just speak again.');
        if (continuousRef.current && !isHeldRef.current) {
          void startListening({ continuousArm: true });
        }
        return;
      }
      setMicHint(null);
      userSentRef.current = true;
      setChatInput('');
      onSendMessage?.(text);
    } catch (err: unknown) {
      console.error('[VoiceLounge] STT failed:', err);
      setMicHint('Couldn’t hear that — speak again.');
      if (continuousRef.current && !isHeldRef.current) {
        void startListening({ continuousArm: true });
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopListening = useCallback((opts?: { discard?: boolean; force?: boolean }) => {
    const armedFor = performance.now() - listenStartedAtRef.current;
    // Accidental second tap right after start — keep recording
    if (!opts?.discard && !opts?.force && armedFor < LISTEN_ARM_MS) {
      setMicHint(continuousRef.current ? 'Keep talking — pause when you’re done.' : 'Keep talking — tap again when you’re done.');
      return;
    }
    stopVadWatch();
    discardRecordRef.current = !!opts?.discard;
    wantRecordRef.current = false;
    listenStartingRef.current = false;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'recording') {
      try { rec.requestData(); } catch { /* ignore */ }
      try { rec.stop(); } catch { /* ignore */ }
    } else {
      setIsListening(false);
      isListeningRef.current = false;
      stopMediaTracks();
      discardRecordRef.current = false;
    }
  }, [stopVadWatch]);

  const startVadWatch = (stream: MediaStream) => {
    stopVadWatch();
    const ctx = audioContextRef.current;
    if (!ctx) return;
    try {
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.35;
      src.connect(analyser);
      vadSourceRef.current = src;
      vadAnalyserRef.current = analyser;
    } catch (err: unknown) {
      console.warn('[VoiceLounge] VAD init failed:', err);
      return;
    }

    speechHeardRef.current = false;
    lastSpeechAtRef.current = 0;
    const data = new Uint8Array(2048);

    const tick = () => {
      vadRafRef.current = requestAnimationFrame(tick);
      const analyser = vadAnalyserRef.current;
      if (!analyser || !wantRecordRef.current) return;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const now = performance.now();
      if (rms >= VAD_SPEECH_RMS) {
        speechHeardRef.current = true;
        lastSpeechAtRef.current = now;
        return;
      }
      // Auto-send after a natural pause (continuous Live)
      if (
        continuousRef.current &&
        speechHeardRef.current &&
        lastSpeechAtRef.current > 0 &&
        now - lastSpeechAtRef.current >= VAD_SILENCE_MS &&
        now - listenStartedAtRef.current >= LISTEN_ARM_MS
      ) {
        stopListening({ force: true });
      }
    };
    vadRafRef.current = requestAnimationFrame(tick);
  };

  const startListening = async (opts?: { continuousArm?: boolean }) => {
    if (isHeldRef.current) return;
    if (!window.isSecureContext) {
      setMicHint('Open this page on localhost to use the mic.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicHint(micUnsupportedReason());
      return;
    }

    // Manual tap while recording → stop & send (after arm window)
    if (
      !opts?.continuousArm &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      stopListening();
      return;
    }
    // getUserMedia still opening — ignore duplicate taps
    if (listenStartingRef.current || wantRecordRef.current) return;

    listenStartingRef.current = true;
    wantRecordRef.current = true;
    discardRecordRef.current = false;
    listenStartedAtRef.current = performance.now();
    isListeningRef.current = true;
    setIsListening(true); // optimistic — full-stage tap shouldn't flash "One moment…"
    if (!opts?.continuousArm) {
      stopSpeaking();
    }
    await resumeAudioContext().catch(() => {});
    if (!wantRecordRef.current) {
      listenStartingRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    setMicHint(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      if (!wantRecordRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        listenStartingRef.current = false;
        return;
      }

      mediaStreamRef.current = stream;
      mediaChunksRef.current = [];

      const mimeType = pickRecorderMime();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const discard = discardRecordRef.current;
        const recordedMs = performance.now() - listenStartedAtRef.current;
        const heardSpeech = speechHeardRef.current;
        discardRecordRef.current = false;
        setIsListening(false);
        isListeningRef.current = false;
        wantRecordRef.current = false;
        listenStartingRef.current = false;
        if (recordMaxTimerRef.current) {
          clearTimeout(recordMaxTimerRef.current);
          recordMaxTimerRef.current = null;
        }
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(mediaChunksRef.current, { type });
        stopMediaTracks();
        if (discard) return;
        if (blob.size < 200 || recordedMs < MIN_SEND_MS || (continuousRef.current && !heardSpeech)) {
          if (continuousRef.current && !isHeldRef.current) {
            // No real utterance — keep the conversation open
            void startListening({ continuousArm: true });
            return;
          }
          setMicHint('Just speak — I’ll send when you pause.');
          return;
        }
        void transcribeAndSend(blob, type);
      };

      recorder.onerror = () => {
        setIsListening(false);
        isListeningRef.current = false;
        wantRecordRef.current = false;
        listenStartingRef.current = false;
        stopMediaTracks();
        setMicHint('Mic hiccup — tap to try again.');
      };

      recorder.start(250);
      listenStartedAtRef.current = performance.now();
      listenStartingRef.current = false;
      startVadWatch(stream);

      recordMaxTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopListening({ force: true });
        }
      }, MAX_RECORD_MS);
    } catch (err: unknown) {
      console.error('[VoiceLounge] getUserMedia failed:', err);
      wantRecordRef.current = false;
      listenStartingRef.current = false;
      isListeningRef.current = false;
      stopMediaTracks();
      setIsListening(false);
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicHint('Allow microphone access, then tap to talk.');
      } else {
        setMicHint('Couldn’t open the mic — check permissions and try again.');
      }
    }
  };

  stopSpeakingRef.current = stopSpeaking;
  startListeningRef.current = startListening;

  const handleSend = () => {
    if (!chatInput.trim() || isSending) return;
    if (isSpeaking) stopSpeaking();
    userSentRef.current = true;
    onSendMessage?.(chatInput.trim());
    setChatInput('');
  };

  const isActive = !isHeld && (isSpeaking || isLoading || isThinking || isListening || isTranscribing);
  const firstName = (userName || 'there').split(' ')[0];

  const handleStageTap = () => {
    if (isHeld) {
      setIsHeld(false);
      // Resume continuous Live after hold
      if (continuousRef.current) void startListening({ continuousArm: true });
      return;
    }
    // Opening mic — ignore duplicate taps until recording is live
    if (listenStartingRef.current) return;
    if (isListening || wantRecordRef.current) {
      // Manual send still works; VAD usually handles this
      stopListening({ force: true });
      return;
    }
    // Don't steal the mic while Whisper / chat is already in flight
    if (isTranscribing || isThinking) return;
    if (isSpeaking || isLoading) {
      // Barge-in
      stopSpeaking();
      void startListening({ continuousArm: true });
      return;
    }
    if (resumeOrRetryVoice()) return;
    void startListening({ continuousArm: true });
  };

  const handleHoldToggle = () => {
    if (isListening || wantRecordRef.current) stopListening({ discard: true, force: true });
    if (isSpeaking || isLoading) stopSpeaking();
    setIsHeld((v) => !v);
    setMicHint(null);
  };

  const statusLine = (() => {
    if (isHeld) return 'On hold';
    if (isListening) return 'Listening… pause to send';
    if (isTranscribing || isThinking || isLoading) return 'One moment…';
    if (isSpeaking) return 'Speak to interrupt';
    if (voiceError === 'auth') return 'Sign in to use voice';
    if (voiceError === 'unavailable') return 'Tap to try again';
    if (voiceError === 'blocked-autoplay') return 'Tap to hear the reply';
    if (insecureContext) return 'Mic needs a secure page';
    if (messages.length === 0) return `Hello, ${firstName} — tap to start`;
    return 'Tap to start listening';
  })();

  return (
    <>
      <style>{`
        @keyframes vl-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes vl-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .vl-msg { animation: vl-fadein 0.2s ease both }
        .vl-scroll::-webkit-scrollbar { width: 3px }
        .vl-scroll::-webkit-scrollbar-track { background: transparent }
        .vl-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 99px }
        .vl-hello {
          background: linear-gradient(90deg, #f9a8d4 0%, #c4b5fd 40%, #93c5fd 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <div
        className="relative w-full h-full min-h-0 flex-1 flex flex-col text-white"
        style={{ overflow: 'hidden', background: '#000' }}
      >
        {/* Top bar */}
        <div className="relative z-20 flex items-center justify-between px-5 pt-5 pb-3">
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
            aria-label={showTranscript ? 'Back to Live' : 'Open transcript'}
          >
            {showTranscript ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </button>

          <div className="inline-flex items-center gap-2 text-white/90">
            <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="8" width="2.5" height="8" rx="1" />
              <rect x="9" y="5" width="2.5" height="14" rx="1" />
              <rect x="14" y="7" width="2.5" height="10" rx="1" />
              <rect x="19" y="9" width="2.5" height="6" rx="1" />
            </svg>
            <span className="text-[15px] font-medium tracking-wide">Live</span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
              isListening
                ? 'bg-emerald-500/25 text-emerald-300'
                : isSpeaking
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'bg-white/10 text-white/60'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Ready'}
          </div>
        </div>

        {/* Stage */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          {!showTranscript ? (
            <button
              type="button"
              onClick={handleStageTap}
              className="absolute inset-0 z-10 w-full text-left border-0 bg-transparent p-0 cursor-pointer"
              aria-label="Voice stage"
            >
              <VoiceAgentVisualizer
                audioIntensityRef={audioIntensityRef}
                isActive={isActive}
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isThinking || isLoading}
              />
              <div className="absolute inset-0 z-10 flex items-center justify-center px-8 pointer-events-none">
                <p
                  className={`text-center text-[1.65rem] sm:text-3xl font-normal leading-snug max-w-md ${
                    !isActive && messages.length === 0 ? 'vl-hello' : 'text-white/90'
                  }`}
                >
                  {statusLine}
                </p>
              </div>
            </button>
          ) : (
            <div className="relative z-10 flex-1 overflow-hidden px-4 pb-4">
              <div
                ref={transcriptRef}
                className="vl-scroll h-full overflow-y-auto max-w-lg mx-auto"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <p className="text-white/40 text-sm">Your conversation will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-5 py-3">
                    {messages.map((msg, i) => (
                      <div key={i} className={`vl-msg flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5 ${
                          msg.role === 'user' ? 'bg-white/15 text-white' : 'bg-sky-400 text-slate-950'
                        }`}>
                          {msg.role === 'user' ? 'U' : 'E'}
                        </div>
                        <div className={`max-w-[80%] px-4 py-3.5 ${
                          msg.role === 'user'
                            ? 'bg-white/10 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white/[0.06] border border-white/10 text-white/90 rounded-2xl rounded-tl-sm'
                        }`} style={{ wordBreak: 'break-word' }}>
                          <p className="text-[13.5px] leading-[1.7] font-normal text-inherit">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isThinking && (
                      <div className="vl-msg flex gap-2.5">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-400 flex items-center justify-center text-[9px] font-bold text-slate-950 mt-0.5">E</div>
                        <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                          {[0, 140, 280].map(d => (
                            <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#93c5fd', animation: `vl-bounce 1.1s ${d}ms ease-in-out infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="relative z-20 w-full px-6 sm:px-10 pb-8 pt-3 space-y-3">
          {(insecureContext || micHint) && (
            <p className="text-[11px] text-amber-300/90 text-center leading-snug">
              {insecureContext
                ? 'Mic needs http://localhost:3000'
                : micHint}
            </p>
          )}

          {!showTranscript && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleHoldToggle}
                className="flex flex-col items-center gap-2"
              >
                <span className={`w-16 h-16 rounded-full flex items-center justify-center border transition-colors ${
                  isHeld
                    ? 'bg-lime-400/20 border-lime-400/40'
                    : 'bg-[#2a2a2a] border-white/10 hover:bg-[#333]'
                }`}>
                  {isHeld ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  )}
                </span>
                <span className="text-xs text-white/70">{isHeld ? 'Resume' : 'Hold'}</span>
              </button>
            </div>
          )}

          {showTranscript && (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1a1a1a] px-4 py-2.5">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Type a message…"
                disabled={isSending}
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/35 focus:ring-0"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !chatInput.trim()}
                className="p-2 rounded-full bg-white text-black disabled:opacity-25"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          )}

          {onForgeBrief && showTranscript && (
            <button
              onClick={onForgeBrief}
              disabled={isSending}
              className="w-full py-2.5 rounded-full border border-white/15 bg-white/5 text-white/80 text-xs font-medium hover:bg-white/10 disabled:opacity-40"
            >
              Forge Director Brief
            </button>
          )}
        </div>
      </div>

      <audio ref={audioRef} hidden />
    </>
  );
}
